import 'fake-indexeddb/auto';

import { deleteDB } from 'idb';
import { beforeEach, describe, expect, it } from 'vitest';

import { seedCatalog } from '@calm/content';

import { BrowserSceneRepository } from './browser-repository';

const DB_NAME = 'calm-in-the-rush-demo';

function installBrowserGlobals() {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        removeItem: () => undefined,
        setItem: () => undefined,
      },
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    },
  });
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { storage: { estimate: async () => ({ quota: 1000 }) } },
  });
  globalThis.URL.createObjectURL = () => 'blob:calm-test';
  globalThis.URL.revokeObjectURL = () => undefined;
}

beforeEach(async () => {
  installBrowserGlobals();
  await deleteDB(DB_NAME);
});

describe('browser scene repository', () => {
  it('falls back to bundled scenes and keeps drafts out of the published catalog', async () => {
    const repository = new BrowserSceneRepository();
    expect((await repository.readCatalog()).scenes).toHaveLength(4);
    const lake = seedCatalog.scenes[0];
    await repository.saveScene({
      ...lake,
      id: lake.id,
      status: 'draft',
    });
    const local = await repository.readCatalog();
    expect(local.scenes.find((scene) => scene.id === lake.id)?.status).toBe('draft');
    repository.dispose();
  });

  it('stores local media, removes it with the scene, and restores the seed on reset', async () => {
    const repository = new BrowserSceneRepository();
    const video = new Blob(['video'], { type: 'video/mp4' });
    const poster = new Blob(['poster'], { type: 'image/jpeg' });
    await repository.saveScene(
      {
        id: 'local-scene',
        title: 'Local scene',
        location: 'Local place',
        description: '',
        soundLabel: 'Quiet water',
        video: {
          kind: 'local',
          blobId: 'local-video',
          fileName: 'scene.mp4',
          mimeType: 'video/mp4',
          size: video.size,
        },
        poster: {
          kind: 'local',
          blobId: 'local-poster',
          fileName: 'poster.jpg',
          mimeType: 'image/jpeg',
          size: poster.size,
        },
        attribution: {
          creator: 'Demo creator',
          sourceUrl: 'https://example.com/source',
          licenseId: 'cc0-1.0',
          licenseUrl: 'https://creativecommons.org/public-domain/cc0/',
          changesMade: 'Trimmed for the demo.',
        },
        status: 'published',
        sortOrder: 4,
      },
      { video, poster },
    );
    expect(
      await repository.getObjectUrl({
        kind: 'local',
        blobId: 'local-poster',
        fileName: 'poster.jpg',
        mimeType: 'image/jpeg',
        size: poster.size,
      }),
    ).toBe('blob:calm-test');
    await repository.removeScene('local-scene');
    expect(
      (await repository.readCatalog()).scenes.some((scene) => scene.id === 'local-scene'),
    ).toBe(false);
    await repository.reset();
    expect((await repository.readCatalog()).scenes.map((scene) => scene.id)).toEqual([
      'lake',
      'forest',
      'field',
      'brook',
    ]);
    repository.dispose();
  });
});
