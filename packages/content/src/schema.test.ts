import { describe, expect, it } from 'vitest';

import { sceneCatalogSchema, seedCatalog, sortPublishedScenes } from './index';

describe('scene catalog contract', () => {
  it('accepts the four published seed scenes in order', () => {
    const catalog = sceneCatalogSchema.parse(seedCatalog);
    expect(sortPublishedScenes(catalog.scenes).map((scene) => scene.id)).toEqual([
      'lake',
      'forest',
      'field',
      'brook',
    ]);
  });

  it('rejects a catalog with no published scene', () => {
    const draftCatalog = {
      ...seedCatalog,
      scenes: seedCatalog.scenes.map((scene) => ({ ...scene, status: 'draft' as const })),
    };
    expect(() => sceneCatalogSchema.parse(draftCatalog)).toThrow();
  });

  it('rejects a title longer than 80 characters', () => {
    expect(() =>
      sceneCatalogSchema.parse({
        ...seedCatalog,
        scenes: [{ ...seedCatalog.scenes[0], title: 'x'.repeat(81) }],
      }),
    ).toThrow();
  });
});
