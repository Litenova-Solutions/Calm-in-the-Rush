import { deleteDB, openDB, type DBSchema, type IDBPDatabase } from 'idb';

import {
  createExperienceId,
  experienceConfigSchema,
  galleryUploadKey,
  imageFileAccept,
  isGalleryScreen,
  seedExperience,
  visitorOneLinerSchema,
  visitorUploadSchema,
  type ExperienceConfig,
  type ExperienceMedia,
  type ExperienceTile,
  type VisitorUpload,
} from './experience';

const DB_NAME = 'calm-in-the-rush-local-v4';
const LEGACY_DB_NAME = 'calm-in-the-rush-local-v3';
const DB_VERSION = 1;

interface CalmDb extends DBSchema {
  experience: { key: string; value: ExperienceConfig };
  visitorUploads: { key: string; value: VisitorUpload };
  oneLiner: { key: string; value: { value: string } };
  media: { key: string; value: Blob };
}

export interface StorageReport {
  usedBytes: number;
  quotaBytes: number | null;
}

function cloneExperience(config: ExperienceConfig): ExperienceConfig {
  return JSON.parse(JSON.stringify(config)) as ExperienceConfig;
}

function dbAvailable(): boolean {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
}

async function openCalmDb(): Promise<IDBPDatabase<CalmDb>> {
  if (!dbAvailable()) throw new Error('Browser storage is not available in this environment.');
  return openDB<CalmDb>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('experience'))
        database.createObjectStore('experience');
      if (!database.objectStoreNames.contains('visitorUploads'))
        database.createObjectStore('visitorUploads');
      if (!database.objectStoreNames.contains('oneLiner')) database.createObjectStore('oneLiner');
      if (!database.objectStoreNames.contains('media')) database.createObjectStore('media');
    },
  });
}

function localMedia(file: File): Extract<ExperienceMedia, { kind: 'local' }> {
  if (!imageFileAccept.split(',').includes(file.type)) {
    throw new Error('Choose a JPEG, PNG, WebP, or AVIF image.');
  }
  return {
    kind: 'local',
    blobId: createExperienceId('media'),
    fileName: file.name || 'photo',
    mimeType: file.type as Extract<ExperienceMedia, { kind: 'local' }>['mimeType'],
    size: file.size,
  };
}

function validUploadSlots(config: ExperienceConfig): Set<string> {
  return new Set(
    config.screens.flatMap((screen) =>
      isGalleryScreen(screen)
        ? screen.tiles
            .filter((tile) => tile.type === 'upload')
            .map((tile) => galleryUploadKey(screen.id, tile.id))
        : [],
    ),
  );
}

function localMediaIds(config: ExperienceConfig, uploads: readonly VisitorUpload[]): Set<string> {
  const ids = new Set<string>();
  for (const screen of config.screens) {
    if (!isGalleryScreen(screen)) continue;
    for (const tile of screen.tiles) {
      if (tile.type === 'prefilled' && tile.media.kind === 'local') ids.add(tile.media.blobId);
    }
  }
  for (const upload of uploads) ids.add(upload.media.blobId);
  return ids;
}

export class BrowserExperienceRepository {
  private objectUrls = new Map<string, string>();

  async readExperience(): Promise<ExperienceConfig> {
    if (!dbAvailable()) return cloneExperience(seedExperience);
    const db = await openCalmDb();
    try {
      const local = await db.get('experience', 'current');
      return local ? experienceConfigSchema.parse(local) : cloneExperience(seedExperience);
    } finally {
      db.close();
    }
  }

  async readVisitorUploads(): Promise<VisitorUpload[]> {
    if (!dbAvailable()) return [];
    const db = await openCalmDb();
    try {
      return (await db.getAll('visitorUploads')).map((upload) => visitorUploadSchema.parse(upload));
    } finally {
      db.close();
    }
  }

  async readOneLiner(): Promise<string> {
    if (!dbAvailable()) return '';
    const db = await openCalmDb();
    try {
      const oneLiner = await db.get('oneLiner', 'current');
      return oneLiner ? visitorOneLinerSchema.parse(oneLiner).value : '';
    } finally {
      db.close();
    }
  }

  async saveExperience(input: ExperienceConfig): Promise<ExperienceConfig> {
    if (!dbAvailable()) throw new Error('Browser storage is not available.');
    const config = experienceConfigSchema.parse(input);
    const db = await openCalmDb();
    try {
      const slots = validUploadSlots(config);
      const uploads: VisitorUpload[] = [];
      for (const candidate of await db.getAll('visitorUploads')) {
        const upload = visitorUploadSchema.parse(candidate);
        const key = galleryUploadKey(upload.screenId, upload.tileId);
        if (!slots.has(key)) {
          await db.delete('visitorUploads', key);
          this.revokeObjectUrl(upload.media.blobId);
          continue;
        }
        uploads.push(upload);
      }
      await db.put('experience', config, 'current');
      const retained = localMediaIds(config, uploads);
      for (const mediaId of await db.getAllKeys('media')) {
        if (typeof mediaId === 'string' && !retained.has(mediaId)) {
          await db.delete('media', mediaId);
          this.revokeObjectUrl(mediaId);
        }
      }
      return config;
    } finally {
      db.close();
    }
  }

  async addPrefilledTile(
    screenId: string,
    input: Pick<Extract<ExperienceTile, { type: 'prefilled' }>, 'title' | 'alt' | 'sentence'>,
    file: File,
  ): Promise<ExperienceConfig> {
    const current = await this.readExperience();
    const screen = current.screens.find((candidate) => candidate.id === screenId);
    if (!screen || !isGalleryScreen(screen))
      throw new Error('That gallery screen is no longer available.');
    const title = input.title.trim();
    const alt = input.alt.trim() || title;
    const sentence = input.sentence.trim();
    if (!title || title.length > 60)
      throw new Error('Tile title must be between 1 and 60 characters.');
    if (!alt || alt.length > 160)
      throw new Error('Image description must be between 1 and 160 characters.');
    if (sentence.length > 160)
      throw new Error('Assigned sentence must be 160 characters or fewer.');
    const media = localMedia(file);
    const next = experienceConfigSchema.parse({
      ...current,
      screens: current.screens.map((candidate) =>
        candidate.id === screenId
          ? {
              ...candidate,
              tiles: [
                ...screen.tiles,
                { id: createExperienceId('tile'), type: 'prefilled', title, alt, sentence, media },
              ],
            }
          : candidate,
      ),
    });
    const db = await openCalmDb();
    try {
      await db.put('media', file, media.blobId);
    } finally {
      db.close();
    }
    try {
      return await this.saveExperience(next);
    } catch (error) {
      const cleanup = await openCalmDb();
      try {
        await cleanup.delete('media', media.blobId);
      } finally {
        cleanup.close();
      }
      throw error;
    }
  }

  async updatePrefilledTile(
    screenId: string,
    tileId: string,
    input: Pick<Extract<ExperienceTile, { type: 'prefilled' }>, 'title' | 'alt' | 'sentence'>,
    file: File | null,
  ): Promise<ExperienceConfig> {
    const current = await this.readExperience();
    const screen = current.screens.find((candidate) => candidate.id === screenId);
    if (!screen || !isGalleryScreen(screen)) {
      throw new Error('That pre-filled tile is no longer available.');
    }
    const tile = screen.tiles.find((candidate) => candidate.id === tileId);
    if (!tile || tile.type !== 'prefilled') {
      throw new Error('That pre-filled tile is no longer available.');
    }
    const title = input.title.trim();
    const alt = input.alt.trim() || title;
    const sentence = input.sentence.trim();
    if (!title || title.length > 60)
      throw new Error('Tile title must be between 1 and 60 characters.');
    if (!alt || alt.length > 160)
      throw new Error('Image description must be between 1 and 160 characters.');
    if (sentence.length > 160)
      throw new Error('Assigned sentence must be 160 characters or fewer.');
    const replacement = file ? localMedia(file) : null;
    const next = experienceConfigSchema.parse({
      ...current,
      screens: current.screens.map((candidate) =>
        candidate.id === screenId && candidate.type === 'gallery'
          ? {
              ...candidate,
              tiles: candidate.tiles.map((candidateTile) =>
                candidateTile.id === tileId && candidateTile.type === 'prefilled'
                  ? {
                      ...candidateTile,
                      title,
                      alt,
                      sentence,
                      media: replacement ?? candidateTile.media,
                    }
                  : candidateTile,
              ),
            }
          : candidate,
      ),
    });
    if (!replacement || !file) return this.saveExperience(next);
    const db = await openCalmDb();
    try {
      await db.put('media', file, replacement.blobId);
    } finally {
      db.close();
    }
    try {
      return await this.saveExperience(next);
    } catch (error) {
      const cleanup = await openCalmDb();
      try {
        await cleanup.delete('media', replacement.blobId);
      } finally {
        cleanup.close();
      }
      throw error;
    }
  }

  async saveVisitorUpload(screenId: string, tileId: string, file: File): Promise<VisitorUpload> {
    if (!dbAvailable()) throw new Error('Browser storage is not available.');
    const config = await this.readExperience();
    const screen = config.screens.find((candidate) => candidate.id === screenId);
    if (!screen || !isGalleryScreen(screen)) {
      throw new Error('That photo upload space is no longer available.');
    }
    const tile = screen.tiles.find((candidate) => candidate.id === tileId);
    if (!tile || tile.type !== 'upload') {
      throw new Error('That photo upload space is no longer available.');
    }
    const media = localMedia(file);
    const upload = visitorUploadSchema.parse({ schemaVersion: 1, screenId, tileId, media });
    const key = galleryUploadKey(screenId, tileId);
    const db = await openCalmDb();
    try {
      const previous = await db.get('visitorUploads', key);
      await db.put('media', file, media.blobId);
      await db.put('visitorUploads', upload, key);
      if (previous) {
        const old = visitorUploadSchema.parse(previous);
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

  async saveOneLiner(value: string): Promise<string> {
    if (!dbAvailable()) throw new Error('Browser storage is not available.');
    const trimmed = value.trim();
    const db = await openCalmDb();
    try {
      if (!trimmed) {
        await db.delete('oneLiner', 'current');
        return '';
      }
      const oneLiner = visitorOneLinerSchema.parse({ value: trimmed });
      await db.put('oneLiner', oneLiner, 'current');
      return oneLiner.value;
    } finally {
      db.close();
    }
  }

  async getObjectUrl(media: ExperienceMedia): Promise<string | null> {
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
    await deleteDB(DB_NAME);
    await deleteDB(LEGACY_DB_NAME);
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
