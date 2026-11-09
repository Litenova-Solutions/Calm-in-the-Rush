import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

import {
  createExperienceId,
  galleryUploadKey,
  imageFileAccept,
  isGalleryScreen,
  seedExperience,
  seedExperienceNl,
  legacyRatedFeedbackSchema,
  visitorFeedbackSchema,
  visitorOneLinerSchema,
  visitorUploadSchema,
  type ExperienceConfig,
  type ExperienceMedia,
  type VisitorFeedback,
  type VisitorUpload,
} from './experience';
import { repositoryStrings, resolveExperienceLocale, type ExperienceLocale } from './strings';

const DB_NAME = 'calm-in-the-rush-local-v4';
const DB_NAME_NL = 'calm-in-the-rush-local-v4-nl';
const DB_VERSION = 1;

/** The visitor's own data. The experience content itself is the built-in seed for each locale. */
interface CalmDb extends DBSchema {
  visitorUploads: { key: string; value: VisitorUpload };
  /** Holds 'feedback' (calm value and comment) and, from older versions, 'current' (a bare comment). */
  oneLiner: { key: string; value: unknown };
  media: { key: string; value: Blob };
}

function dbAvailable(): boolean {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
}

async function openCalmDb(
  database: string,
  storageMessage = 'Browser storage is not available in this environment.',
): Promise<IDBPDatabase<CalmDb>> {
  if (!dbAvailable()) throw new Error(storageMessage);
  return openDB<CalmDb>(database, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('visitorUploads'))
        database.createObjectStore('visitorUploads');
      if (!database.objectStoreNames.contains('oneLiner')) database.createObjectStore('oneLiner');
      if (!database.objectStoreNames.contains('media')) database.createObjectStore('media');
    },
  });
}

function localMedia(
  file: File,
  invalidMessage: string,
): Extract<ExperienceMedia, { kind: 'local' }> {
  if (!imageFileAccept.split(',').includes(file.type)) {
    throw new Error(invalidMessage);
  }
  return {
    kind: 'local',
    blobId: createExperienceId('media'),
    fileName: file.name || 'photo',
    mimeType: file.type as Extract<ExperienceMedia, { kind: 'local' }>['mimeType'],
    size: file.size,
  };
}

export class BrowserExperienceRepository {
  readonly locale: ExperienceLocale;
  private readonly dbName: string;
  private readonly experience: ExperienceConfig;
  private objectUrls = new Map<string, string>();

  constructor(options: { locale?: ExperienceLocale } = {}) {
    this.locale = resolveExperienceLocale(options.locale);
    this.dbName = this.locale === 'nl' ? DB_NAME_NL : DB_NAME;
    this.experience = this.locale === 'nl' ? seedExperienceNl : seedExperience;
  }

  private get copy() {
    return repositoryStrings[this.locale];
  }

  async readVisitorUploads(): Promise<VisitorUpload[]> {
    if (!dbAvailable()) return [];
    const db = await openCalmDb(this.dbName, this.copy.storageUnavailable);
    try {
      return (await db.getAll('visitorUploads')).map((upload) => visitorUploadSchema.parse(upload));
    } finally {
      db.close();
    }
  }

  /**
   * Reads the visitor's feedback. A comment saved before ratings existed comes
   * back without a rating, so the visitor only has to pick a face to keep it.
   */
  async readFeedback(): Promise<{ calm: number | null; comment: string }> {
    const empty = { calm: null, comment: '' };
    if (!dbAvailable()) return empty;
    const db = await openCalmDb(this.dbName, this.copy.storageUnavailable);
    try {
      const feedback = await db.get('oneLiner', 'feedback');
      if (feedback) {
        const current = visitorFeedbackSchema.safeParse(feedback);
        if (current.success) return current.data;
        const rated = legacyRatedFeedbackSchema.parse(feedback);
        return { calm: (rated.rating - 1) * 25, comment: rated.comment };
      }
      const legacy = await db.get('oneLiner', 'current');
      return legacy ? { calm: null, comment: visitorOneLinerSchema.parse(legacy).value } : empty;
    } finally {
      db.close();
    }
  }

  async saveVisitorUploadBatch(
    screenId: string,
    sourceTileId: string,
    files: File[],
  ): Promise<VisitorUpload[]> {
    if (!dbAvailable()) throw new Error(this.copy.storageUnavailableShort);
    if (files.length === 0) return [];
    const screen = this.experience.screens.find((candidate) => candidate.id === screenId);
    if (!screen || !isGalleryScreen(screen)) {
      throw new Error(this.copy.uploadGone);
    }
    const sourceTile = screen.tiles.find((candidate) => candidate.id === sourceTileId);
    if (!sourceTile || sourceTile.type !== 'upload') {
      throw new Error(this.copy.uploadGone);
    }
    const existingUploads = await this.readVisitorUploads();
    const filledTileIds = new Set(
      existingUploads
        .filter((upload) => upload.screenId === screenId)
        .map((upload) => upload.tileId),
    );
    const emptyUploadTiles = screen.tiles.filter(
      (tile) => tile.type === 'upload' && tile.id !== sourceTileId && !filledTileIds.has(tile.id),
    );
    const pairs: Array<{ file: File; tileId: string }> = [];
    if (files.length > 0) {
      pairs.push({ file: files[0]!, tileId: sourceTileId });
    }
    for (let index = 1; index < files.length && index - 1 < emptyUploadTiles.length; index += 1) {
      pairs.push({ file: files[index]!, tileId: emptyUploadTiles[index - 1]!.id });
    }
    if (pairs.length === 0) return [];
    const failedMedia: string[] = [];
    const db = await openCalmDb(this.dbName, this.copy.storageUnavailable);
    try {
      const saved: VisitorUpload[] = [];
      for (const { file, tileId } of pairs) {
        const media = localMedia(file, this.copy.invalidImage);
        const key = galleryUploadKey(screenId, tileId);
        try {
          const previous = await db.get('visitorUploads', key);
          await db.put('media', file, media.blobId);
          const upload = visitorUploadSchema.parse({
            schemaVersion: 1,
            screenId,
            tileId,
            media,
          });
          await db.put('visitorUploads', upload, key);
          if (previous) {
            const old = visitorUploadSchema.parse(previous);
            await db.delete('media', old.media.blobId).catch(() => undefined);
            this.revokeObjectUrl(old.media.blobId);
          }
          saved.push(upload);
        } catch (innerError) {
          failedMedia.push(media.blobId);
          throw innerError;
        }
      }
      return saved;
    } catch (error) {
      for (const blobId of failedMedia) {
        await db.delete('media', blobId).catch(() => undefined);
      }
      throw error;
    } finally {
      db.close();
    }
  }

  async clearVisitorUpload(screenId: string, tileId: string): Promise<void> {
    if (!dbAvailable()) return;
    const key = galleryUploadKey(screenId, tileId);
    const db = await openCalmDb(this.dbName, this.copy.storageUnavailable);
    try {
      const previous = await db.get('visitorUploads', key);
      if (previous) {
        const old = visitorUploadSchema.parse(previous);
        await db.delete('media', old.media.blobId).catch(() => undefined);
        this.revokeObjectUrl(old.media.blobId);
      }
      await db.delete('visitorUploads', key);
    } finally {
      db.close();
    }
  }

  async saveFeedback(input: VisitorFeedback): Promise<VisitorFeedback> {
    if (!dbAvailable()) throw new Error(this.copy.storageUnavailableShort);
    const feedback = visitorFeedbackSchema.parse(input);
    const db = await openCalmDb(this.dbName, this.copy.storageUnavailable);
    try {
      await db.put('oneLiner', feedback, 'feedback');
      await db.delete('oneLiner', 'current');
      return feedback;
    } finally {
      db.close();
    }
  }

  async clearFeedback(): Promise<void> {
    if (!dbAvailable()) return;
    const db = await openCalmDb(this.dbName, this.copy.storageUnavailable);
    try {
      await db.delete('oneLiner', 'feedback');
      await db.delete('oneLiner', 'current');
    } finally {
      db.close();
    }
  }

  async getObjectUrl(media: ExperienceMedia): Promise<string | null> {
    if (media.kind === 'bundled' || media.kind === 'bundled-video') return media.src;
    const existing = this.objectUrls.get(media.blobId);
    if (existing) return existing;
    const db = await openCalmDb(this.dbName, this.copy.storageUnavailable);
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
