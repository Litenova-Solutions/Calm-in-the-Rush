import { z } from 'zod';

export const sceneStatusSchema = z.enum(['draft', 'published']);
export type SceneStatus = z.infer<typeof sceneStatusSchema>;

export const licenseIds = [
  'public-domain-us-government',
  'cc0-1.0',
  'cc-by-3.0',
  'cc-by-4.0',
  'cc-by-sa-4.0',
  'creator-owned',
] as const;

export const licenseIdSchema = z.enum(licenseIds);
export type LicenseId = z.infer<typeof licenseIdSchema>;

export const licenseDefinitions: Record<LicenseId, { label: string; url: string }> = {
  'public-domain-us-government': {
    label: 'United States government public domain basis',
    url: 'https://www.usa.gov/government-copyright',
  },
  'cc0-1.0': {
    label: 'CC0 1.0 Universal',
    url: 'https://creativecommons.org/public-domain/cc0/',
  },
  'cc-by-3.0': {
    label: 'Creative Commons Attribution 3.0',
    url: 'https://creativecommons.org/licenses/by/3.0/',
  },
  'cc-by-4.0': {
    label: 'Creative Commons Attribution 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
  },
  'cc-by-sa-4.0': {
    label: 'Creative Commons Attribution-ShareAlike 4.0',
    url: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  'creator-owned': {
    label: 'Creator-owned permission',
    url: 'https://creativecommons.org/share-your-work/cclicenses/',
  },
};

const bundledMediaSchema = z.object({
  kind: z.literal('bundled'),
  key: z.string().min(1),
});

const localMediaSchema = z.object({
  kind: z.literal('local'),
  blobId: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
});

export const mediaRefSchema = z.discriminatedUnion('kind', [bundledMediaSchema, localMediaSchema]);
export type MediaRef = z.infer<typeof mediaRefSchema>;

const httpUrl = z
  .url()
  .refine((value) => value.startsWith('http://') || value.startsWith('https://'), {
    message: 'URL must use HTTP or HTTPS',
  });

export const attributionSchema = z.object({
  creator: z.string().trim().min(1).max(120),
  sourceUrl: httpUrl,
  licenseId: licenseIdSchema,
  licenseUrl: httpUrl,
  changesMade: z.string().trim().min(1).max(500),
});

export const calmSceneSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().trim().min(1),
  title: z.string().trim().min(1).max(80),
  location: z.string().trim().max(100),
  description: z.string().trim().max(240),
  soundLabel: z.string().trim().min(1).max(80),
  video: mediaRefSchema,
  poster: mediaRefSchema,
  attribution: attributionSchema,
  status: sceneStatusSchema,
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type CalmScene = z.infer<typeof calmSceneSchema>;

export const sceneCatalogSchema = z
  .object({
    schemaVersion: z.literal(1),
    scenes: z.array(calmSceneSchema),
  })
  .superRefine((catalog, context) => {
    const ids = new Set<string>();
    const orders = new Set<number>();
    let published = 0;
    for (const scene of catalog.scenes) {
      if (ids.has(scene.id))
        context.addIssue({ code: 'custom', path: ['scenes'], message: 'Scene IDs must be unique' });
      ids.add(scene.id);
      if (orders.has(scene.sortOrder)) {
        context.addIssue({
          code: 'custom',
          path: ['scenes'],
          message: 'Scene order values must be unique',
        });
      }
      orders.add(scene.sortOrder);
      if (scene.status === 'published') published += 1;
    }
    if (published < 1) {
      context.addIssue({
        code: 'custom',
        path: ['scenes'],
        message: 'At least one scene must be published',
      });
    }
  });
export type SceneCatalog = z.infer<typeof sceneCatalogSchema>;

export type SaveSceneInput = Omit<CalmScene, 'schemaVersion' | 'createdAt' | 'updatedAt' | 'id'> & {
  id?: string;
  createdAt?: string;
};

export interface SceneRepository {
  readCatalog(): Promise<SceneCatalog>;
  saveScene(input: SaveSceneInput): Promise<void>;
  removeScene(id: string): Promise<void>;
  reorderScenes(ids: readonly string[]): Promise<void>;
  reset(): Promise<void>;
  subscribe(listener: () => void): () => void;
}

export function sortPublishedScenes(scenes: readonly CalmScene[]): CalmScene[] {
  return scenes
    .filter((scene) => scene.status === 'published')
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
}

export function getLicenseUrl(id: LicenseId): string {
  return licenseDefinitions[id].url;
}

export function validateCatalog(input: unknown): SceneCatalog {
  const catalog = sceneCatalogSchema.parse(input);
  return {
    ...catalog,
    scenes: catalog.scenes.map((scene) => ({
      ...scene,
      attribution: { ...scene.attribution, licenseUrl: getLicenseUrl(scene.attribution.licenseId) },
    })),
  };
}
