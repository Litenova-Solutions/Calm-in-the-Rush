import { deleteDB, openDB, type DBSchema, type IDBPDatabase } from 'idb';
import {
  calmSentenceSchema,
  calmSceneSchema,
  getLicenseUrl,
  sceneCatalogSchema,
  seedCatalog,
  seedSentenceBank,
  sentenceBankSchema,
  sortPublishedScenes,
  type CalmScene,
  type MediaRef,
  type SaveSceneInput,
  type SceneCatalog,
  type SceneRepository,
  type SentenceBank,
} from '@calm/content';

const DB_NAME = 'calm-in-the-rush-local-v2';
const DB_VERSION = 1;

interface CalmDb extends DBSchema {
  catalog: { key: string; value: SceneCatalog };
  media: { key: string; value: Blob };
  sentences: { key: string; value: SentenceBank };
}

export interface LocalMediaFiles {
  video?: Blob;
  poster?: Blob;
}

export interface StorageReport {
  usedBytes: number;
  quotaBytes: number | null;
}

function cloneCatalog(catalog: SceneCatalog): SceneCatalog {
  return JSON.parse(JSON.stringify(catalog)) as SceneCatalog;
}

function cloneSentenceBank(bank: SentenceBank): SentenceBank {
  return JSON.parse(JSON.stringify(bank)) as SentenceBank;
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
      if (!database.objectStoreNames.contains('catalog')) database.createObjectStore('catalog');
      if (!database.objectStoreNames.contains('media')) database.createObjectStore('media');
      if (!database.objectStoreNames.contains('sentences')) database.createObjectStore('sentences');
    },
  });
}

export class BrowserSceneRepository implements SceneRepository {
  private objectUrls = new Map<string, string>();

  async readCatalog(): Promise<SceneCatalog> {
    if (!dbAvailable()) return cloneCatalog(seedCatalog);
    const db = await openCalmDb();
    try {
      const local = await db.get('catalog', 'current');
      if (!local) return cloneCatalog(seedCatalog);
      return sceneCatalogSchema.parse(local);
    } finally {
      db.close();
    }
  }

  async readSentenceBank(): Promise<SentenceBank> {
    if (!dbAvailable()) return cloneSentenceBank(seedSentenceBank);
    const db = await openCalmDb();
    try {
      const local = await db.get('sentences', 'current');
      if (!local) return cloneSentenceBank(seedSentenceBank);
      return sentenceBankSchema.parse(local);
    } finally {
      db.close();
    }
  }

  async addSentence(text: string): Promise<SentenceBank> {
    if (!dbAvailable()) throw new Error('Browser storage is not available.');
    const sentence = calmSentenceSchema.parse({
      schemaVersion: 1,
      id: createId(),
      language: 'en',
      section: 'nature',
      text,
    });
    const db = await openCalmDb();
    try {
      const current = (await db.get('sentences', 'current')) ?? cloneSentenceBank(seedSentenceBank);
      const next = sentenceBankSchema.parse({
        schemaVersion: 1,
        language: 'en',
        sentences: [...current.sentences, sentence],
      });
      await db.put('sentences', next, 'current');
      return next;
    } finally {
      db.close();
    }
  }

  async saveScene(input: SaveSceneInput, files: LocalMediaFiles = {}): Promise<void> {
    if (!dbAvailable()) throw new Error('Browser storage is not available.');
    const db = await openCalmDb();
    const inserted: string[] = [];
    try {
      const current = await this.readCatalog();
      const id = input.id ?? createId();
      const now = new Date().toISOString();
      const currentScene = current.scenes.find((scene) => scene.id === id);
      const refs = { video: input.video, poster: input.poster };
      for (const kind of ['video', 'poster'] as const) {
        const file = files[kind];
        if (!file) continue;
        if (refs[kind].kind === 'local') {
          const blobId = refs[kind].blobId;
          await db.put('media', file, blobId);
          inserted.push(blobId);
        }
      }
      const candidate: CalmScene = calmSceneSchema.parse({
        ...input,
        id,
        schemaVersion: 1,
        createdAt: input.createdAt ?? currentScene?.createdAt ?? now,
        updatedAt: now,
        attribution: {
          ...input.attribution,
          licenseUrl: getLicenseUrl(input.attribution.licenseId),
        },
      });
      const next = sceneCatalogSchema.parse({
        schemaVersion: 1,
        scenes: [...current.scenes.filter((scene) => scene.id !== id), candidate],
      });
      await db.put('catalog', next, 'current');
      const previousRefs = currentScene ? [currentScene.video, currentScene.poster] : [];
      const nextRefIds = new Set(
        next.scenes
          .flatMap((scene) => [scene.video, scene.poster])
          .filter((ref) => ref.kind === 'local')
          .map((ref) => ref.blobId),
      );
      for (const ref of previousRefs) {
        if (ref.kind === 'local' && !nextRefIds.has(ref.blobId))
          await db.delete('media', ref.blobId);
      }
    } catch (error) {
      for (const blobId of inserted) await db.delete('media', blobId).catch(() => undefined);
      throw error;
    } finally {
      db.close();
    }
  }

  async removeScene(id: string): Promise<void> {
    const current = await this.readCatalog();
    const target = current.scenes.find((scene) => scene.id === id);
    if (!target) return;
    const next = sceneCatalogSchema.parse({
      schemaVersion: 1,
      scenes: current.scenes.filter((scene) => scene.id !== id),
    });
    if (!dbAvailable()) throw new Error('Browser storage is not available.');
    const db = await openCalmDb();
    try {
      await db.put('catalog', next, 'current');
      for (const ref of [target.video, target.poster])
        if (ref.kind === 'local') await db.delete('media', ref.blobId);
    } finally {
      db.close();
    }
  }

  async reorderScenes(ids: readonly string[]): Promise<void> {
    const current = await this.readCatalog();
    const order = new Map(ids.map((id, index) => [id, index]));
    const next = sceneCatalogSchema.parse({
      schemaVersion: 1,
      scenes: current.scenes.map((scene) => ({
        ...scene,
        sortOrder: order.get(scene.id) ?? scene.sortOrder,
        updatedAt: new Date().toISOString(),
      })),
    });
    if (!dbAvailable()) throw new Error('Browser storage is not available.');
    const db = await openCalmDb();
    try {
      await db.put('catalog', next, 'current');
    } finally {
      db.close();
    }
  }

  async reset(): Promise<void> {
    this.revokeObjectUrls();
    if (!dbAvailable()) return;
    const db = await openCalmDb();
    db.close();
    await deleteDB(DB_NAME);
  }

  async getObjectUrl(ref: MediaRef): Promise<string | null> {
    if (ref.kind === 'bundled') return null;
    const existing = this.objectUrls.get(ref.blobId);
    if (existing) return existing;
    const db = await openCalmDb();
    try {
      const blob = await db.get('media', ref.blobId);
      if (!blob) return null;
      const url = URL.createObjectURL(blob);
      this.objectUrls.set(ref.blobId, url);
      return url;
    } finally {
      db.close();
    }
  }

  revokeObjectUrls() {
    for (const url of this.objectUrls.values()) URL.revokeObjectURL(url);
    this.objectUrls.clear();
  }

  async getStorageReport(): Promise<StorageReport> {
    let usedBytes = 0;
    if (dbAvailable()) {
      const db = await openCalmDb();
      try {
        const keys = await db.getAllKeys('media');
        for (const key of keys) {
          const blob = await db.get('media', key);
          usedBytes += blob?.size ?? 0;
        }
      } finally {
        db.close();
      }
    }
    const estimate = await navigator.storage?.estimate?.();
    return { usedBytes, quotaBytes: estimate?.quota ?? null };
  }

  dispose() {
    this.revokeObjectUrls();
  }
}

export function getVisibleScenes(catalog: SceneCatalog): CalmScene[] {
  return sortPublishedScenes(catalog.scenes);
}
