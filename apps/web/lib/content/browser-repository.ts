import { deleteDB, openDB, type DBSchema, type IDBPDatabase } from 'idb';

import {
  galleryConfigSchema,
  galleryUploadKey,
  galleryUploadSchema,
  seedGallery,
  type GalleryConfig,
  type GalleryMedia,
  type GalleryPage,
  type GalleryUpload,
  upgradeLegacyGallery,
} from './gallery';

const DB_NAME = 'calm-in-the-rush-local-v3';
const DB_VERSION = 1;

interface CalmDb extends DBSchema {
  gallery: { key: string; value: GalleryConfig };
  galleryUploads: { key: string; value: GalleryUpload };
  media: { key: string; value: Blob };
}

export interface StorageReport {
  usedBytes: number;
  quotaBytes: number | null;
}

function cloneGallery(config: GalleryConfig): GalleryConfig {
  return JSON.parse(JSON.stringify(config)) as GalleryConfig;
}

function createId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `local-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function dbAvailable(): boolean {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
}

async function openCalmDb(): Promise<IDBPDatabase<CalmDb>> {
  if (!dbAvailable()) throw new Error('Browser storage is not available in this environment.');
  return openDB<CalmDb>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('gallery')) database.createObjectStore('gallery');
      if (!database.objectStoreNames.contains('galleryUploads'))
        database.createObjectStore('galleryUploads');
      if (!database.objectStoreNames.contains('media')) database.createObjectStore('media');
    },
  });
}

function localMediaIds(config: GalleryConfig, uploads: readonly GalleryUpload[]): Set<string> {
  const ids = new Set<string>();
  for (const page of config.pages) {
    for (const tile of page.tiles) {
      if (tile.type === 'prefilled' && tile.media.kind === 'local') ids.add(tile.media.blobId);
    }
  }
  for (const upload of uploads) ids.add(upload.media.blobId);
  return ids;
}

function validUploadSlots(config: GalleryConfig): Set<string> {
  return new Set(
    config.pages.flatMap((page) =>
      page.tiles
        .filter((tile) => tile.type === 'upload')
        .map((tile) => galleryUploadKey(page.id, tile.id)),
    ),
  );
}

function localMedia(file: File): Extract<GalleryMedia, { kind: 'local' }> {
  const mediaType = file.type.startsWith('video/')
    ? 'video'
    : file.type.startsWith('image/')
      ? 'image'
      : null;
  if (!mediaType) throw new Error('Choose an image or video file.');
  return {
    kind: 'local',
    mediaType,
    blobId: createId(),
    fileName: file.name || 'photo',
    mimeType: file.type,
    size: file.size,
  };
}

export class BrowserGalleryRepository {
  private objectUrls = new Map<string, string>();

  async readGallery(): Promise<GalleryConfig> {
    if (!dbAvailable()) return cloneGallery(seedGallery);
    const db = await openCalmDb();
    try {
      const local = await db.get('gallery', 'current');
      if (!local) return cloneGallery(seedGallery);
      return upgradeLegacyGallery(galleryConfigSchema.parse(local));
    } finally {
      db.close();
    }
  }

  async readGalleryUploads(): Promise<GalleryUpload[]> {
    if (!dbAvailable()) return [];
    const db = await openCalmDb();
    try {
      return (await db.getAll('galleryUploads')).map((upload) => galleryUploadSchema.parse(upload));
    } finally {
      db.close();
    }
  }

  async saveGallery(input: GalleryConfig): Promise<GalleryConfig> {
    if (!dbAvailable()) throw new Error('Browser storage is not available.');
    const config = galleryConfigSchema.parse(input);
    const db = await openCalmDb();
    try {
      const slots = validUploadSlots(config);
      const uploads: GalleryUpload[] = [];
      for (const candidate of await db.getAll('galleryUploads')) {
        const upload = galleryUploadSchema.parse(candidate);
        const key = galleryUploadKey(upload.pageId, upload.tileId);
        if (!slots.has(key)) {
          await db.delete('galleryUploads', key);
          this.revokeObjectUrl(upload.media.blobId);
          continue;
        }
        uploads.push(upload);
      }
      await db.put('gallery', config, 'current');
      const retainedMedia = localMediaIds(config, uploads);
      for (const mediaId of await db.getAllKeys('media')) {
        if (typeof mediaId === 'string' && !retainedMedia.has(mediaId)) {
          await db.delete('media', mediaId);
          this.revokeObjectUrl(mediaId);
        }
      }
      return config;
    } finally {
      db.close();
    }
  }

  async addPage(title: string): Promise<GalleryConfig> {
    const name = title.trim();
    if (!name || name.length > 60)
      throw new Error('Page name must be between 1 and 60 characters.');
    const current = await this.readGallery();
    const pageId = createId();
    return this.saveGallery({
      ...current,
      pages: [
        ...current.pages,
        {
          id: pageId,
          title: name,
          description: '',
          tiles: [],
        },
      ],
    });
  }

  async addPrefilledTile(
    pageId: string,
    title: string,
    alt: string,
    file: File,
  ): Promise<GalleryConfig> {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/'))
      throw new Error('Choose an image or video file.');
    const tileTitle = title.trim();
    const tileAlt = alt.trim() || tileTitle;
    if (!tileTitle || tileTitle.length > 60)
      throw new Error('Tile title must be between 1 and 60 characters.');
    if (tileAlt.length > 160) throw new Error('Alternative text must be 160 characters or fewer.');
    const current = await this.readGallery();
    const page = current.pages.find((candidate) => candidate.id === pageId);
    if (!page) throw new Error('The selected gallery page no longer exists.');
    const media = localMedia(file);
    const next = galleryConfigSchema.parse({
      ...current,
      pages: current.pages.map((candidate) =>
        candidate.id === pageId
          ? {
              ...candidate,
              tiles: [
                ...candidate.tiles,
                { id: createId(), type: 'prefilled', title: tileTitle, alt: tileAlt, media },
              ],
            }
          : candidate,
      ),
    });
    const db = await openCalmDb();
    try {
      await db.put('media', file, media.blobId);
      await db.put('gallery', next, 'current');
      return next;
    } catch (error) {
      await db.delete('media', media.blobId).catch(() => undefined);
      throw error;
    } finally {
      db.close();
    }
  }

  async updatePrefilledTile(
    pageId: string,
    tileId: string,
    title: string,
    alt: string,
    file: File | null,
  ): Promise<GalleryConfig> {
    const tileTitle = title.trim();
    const tileAlt = alt.trim() || tileTitle;
    if (!tileTitle || tileTitle.length > 60)
      throw new Error('Tile title must be between 1 and 60 characters.');
    if (tileAlt.length > 160) throw new Error('Alternative text must be 160 characters or fewer.');
    if (file && !file.type.startsWith('image/') && !file.type.startsWith('video/'))
      throw new Error('Choose an image or video file.');

    const current = await this.readGallery();
    const page = current.pages.find((candidate) => candidate.id === pageId);
    const tile = page?.tiles.find((candidate) => candidate.id === tileId);
    if (!page || !tile || tile.type !== 'prefilled')
      throw new Error('That pre-filled tile is no longer available.');

    const replacementMedia = file ? localMedia(file) : null;
    const media = replacementMedia ?? tile.media;
    const next = galleryConfigSchema.parse({
      ...current,
      pages: current.pages.map((candidate) =>
        candidate.id === pageId
          ? {
              ...candidate,
              tiles: candidate.tiles.map((candidateTile) =>
                candidateTile.id === tileId
                  ? { ...candidateTile, title: tileTitle, alt: tileAlt, media }
                  : candidateTile,
              ),
            }
          : candidate,
      ),
    });

    if (!file || !replacementMedia) return this.saveGallery(next);

    const db = await openCalmDb();
    try {
      await db.put('media', file, replacementMedia.blobId);
      return await this.saveGallery(next);
    } catch (error) {
      await db.delete('media', replacementMedia.blobId).catch(() => undefined);
      throw error;
    } finally {
      db.close();
    }
  }

  async moveTile(
    sourcePageId: string,
    tileId: string,
    targetPageId: string,
    targetIndex: number,
  ): Promise<GalleryConfig> {
    const current = await this.readGallery();
    const sourcePage = current.pages.find((page) => page.id === sourcePageId);
    const targetPage = current.pages.find((page) => page.id === targetPageId);
    const sourceIndex = sourcePage?.tiles.findIndex((tile) => tile.id === tileId) ?? -1;
    if (!sourcePage || !targetPage || sourceIndex < 0)
      throw new Error('That tile is no longer available. Refresh the gallery tree and try again.');

    const tile = sourcePage.tiles[sourceIndex]!;
    if (sourcePageId === targetPageId) {
      const tiles = sourcePage.tiles.filter((candidate) => candidate.id !== tileId);
      const insertionIndex = Math.min(
        Math.max(0, targetIndex > sourceIndex ? targetIndex - 1 : targetIndex),
        tiles.length,
      );
      tiles.splice(insertionIndex, 0, tile);
      return this.saveGallery({
        ...current,
        pages: current.pages.map((page) => (page.id === sourcePageId ? { ...page, tiles } : page)),
      });
    }

    if (targetPage.tiles.some((candidate) => candidate.id === tileId))
      throw new Error('The target page already contains a tile with this ID.');

    const targetTiles = [...targetPage.tiles];
    targetTiles.splice(Math.min(Math.max(0, targetIndex), targetTiles.length), 0, tile);
    const next = galleryConfigSchema.parse({
      ...current,
      pages: current.pages.map((page) => {
        if (page.id === sourcePageId)
          return { ...page, tiles: page.tiles.filter((candidate) => candidate.id !== tileId) };
        if (page.id === targetPageId) return { ...page, tiles: targetTiles };
        return page;
      }),
    });

    if (tile.type === 'upload') {
      const db = await openCalmDb();
      try {
        const sourceKey = galleryUploadKey(sourcePageId, tileId);
        const upload = await db.get('galleryUploads', sourceKey);
        if (upload) {
          const targetKey = galleryUploadKey(targetPageId, tileId);
          await db.put(
            'galleryUploads',
            galleryUploadSchema.parse({ ...upload, pageId: targetPageId, tileId }),
            targetKey,
          );
          await db.delete('galleryUploads', sourceKey);
        }
      } finally {
        db.close();
      }
    }

    return this.saveGallery(next);
  }

  async saveGalleryUpload(pageId: string, tileId: string, file: File): Promise<GalleryUpload> {
    if (!dbAvailable()) throw new Error('Browser storage is not available.');
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/'))
      throw new Error('Choose an image or video file.');
    const config = await this.readGallery();
    const page = config.pages.find((candidate) => candidate.id === pageId);
    const tile = page?.tiles.find((candidate) => candidate.id === tileId);
    if (!page || !tile || tile.type !== 'upload')
      throw new Error('That media space is not available.');
    const media = localMedia(file);
    const upload = galleryUploadSchema.parse({ schemaVersion: 1, pageId, tileId, media });
    const key = galleryUploadKey(pageId, tileId);
    const db = await openCalmDb();
    try {
      const previous = await db.get('galleryUploads', key);
      await db.put('media', file, media.blobId);
      await db.put('galleryUploads', upload, key);
      if (previous) {
        const old = galleryUploadSchema.parse(previous);
        await db.delete('media', old.media.blobId);
        this.revokeObjectUrl(old.media.blobId);
      }
      return upload;
    } catch (error) {
      await db.delete('media', media.blobId).catch(() => undefined);
      throw error;
    } finally {
      db.close();
    }
  }

  async getObjectUrl(media: GalleryMedia): Promise<string | null> {
    if (media.kind === 'bundled') return media.src;
    const existing = this.objectUrls.get(media.blobId);
    if (existing) return existing;
    const db = await openCalmDb();
    try {
      const blob = await db.get('media', media.blobId);
      if (!blob) return null;
      const url = URL.createObjectURL(blob);
      this.objectUrls.set(media.blobId, url);
      return url;
    } finally {
      db.close();
    }
  }

  async getStorageReport(): Promise<StorageReport> {
    let usedBytes = 0;
    if (dbAvailable()) {
      const db = await openCalmDb();
      try {
        for (const mediaId of await db.getAllKeys('media')) {
          const blob = await db.get('media', mediaId);
          usedBytes += blob?.size ?? 0;
        }
      } finally {
        db.close();
      }
    }
    const estimate = await navigator.storage?.estimate?.();
    return { usedBytes, quotaBytes: estimate?.quota ?? null };
  }

  async reset(): Promise<void> {
    this.revokeObjectUrls();
    if (!dbAvailable()) return;
    const db = await openCalmDb();
    db.close();
    await deleteDB(DB_NAME);
  }

  dispose(): void {
    this.revokeObjectUrls();
  }

  private revokeObjectUrl(blobId: string): void {
    const url = this.objectUrls.get(blobId);
    if (!url) return;
    URL.revokeObjectURL(url);
    this.objectUrls.delete(blobId);
  }

  private revokeObjectUrls(): void {
    for (const url of this.objectUrls.values()) URL.revokeObjectURL(url);
    this.objectUrls.clear();
  }
}

export function findPage(config: GalleryConfig, pageId: string): GalleryPage | undefined {
  return config.pages.find((page) => page.id === pageId);
}
