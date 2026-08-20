import { z } from 'zod';

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;

export const imageFileAccept = imageMimeTypes.join(',');

const bundledMediaSchema = z.object({
  kind: z.literal('bundled'),
  src: z.string().startsWith('/'),
});

const localMediaSchema = z.object({
  kind: z.literal('local'),
  blobId: z.string().trim().min(1),
  fileName: z.string().trim().min(1),
  mimeType: z.enum(imageMimeTypes),
  size: z.number().int().positive(),
});

export const experienceMediaSchema = z.union([bundledMediaSchema, localMediaSchema]);
export type ExperienceMedia = z.infer<typeof experienceMediaSchema>;

const assignedSentenceSchema = z.string().trim().max(160);

const prefilledTileSchema = z.object({
  id: z.string().trim().min(1),
  type: z.literal('prefilled'),
  title: z.string().trim().min(1).max(60),
  alt: z.string().trim().min(1).max(160),
  sentence: assignedSentenceSchema,
  media: experienceMediaSchema,
});

const uploadTileSchema = z.object({
  id: z.string().trim().min(1),
  type: z.literal('upload'),
  label: z.string().trim().min(1).max(90),
  sentence: assignedSentenceSchema,
});

export const experienceTileSchema = z.union([prefilledTileSchema, uploadTileSchema]);
export type ExperienceTile = z.infer<typeof experienceTileSchema>;

const galleryScreenSchema = z.object({
  id: z.string().trim().min(1),
  type: z.literal('gallery'),
  title: z.string().trim().min(1).max(60),
  description: z.string().trim().max(160),
  useFirstTileAsCover: z.boolean(),
  repeatCoverInGallery: z.boolean(),
  tiles: z.array(experienceTileSchema),
});

const breathingScreenSchema = z.object({
  id: z.string().trim().min(1),
  type: z.literal('breathing'),
  title: z.string().trim().min(1).max(60),
  description: z.string().trim().max(160),
});

const externalLinkSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1).max(60),
  url: z.string().url().startsWith('https://'),
});

const gatewayScreenSchema = z.object({
  id: z.string().trim().min(1),
  type: z.literal('gateway'),
  title: z.string().trim().min(1).max(60),
  description: z.string().trim().max(160),
  links: z.array(externalLinkSchema),
});

export const experienceScreenSchema = z.discriminatedUnion('type', [
  galleryScreenSchema,
  breathingScreenSchema,
  gatewayScreenSchema,
]);
export type ExperienceScreen = z.infer<typeof experienceScreenSchema>;
export type GalleryScreen = Extract<ExperienceScreen, { type: 'gallery' }>;

const oneLinerSettingsSchema = z.object({
  enabled: z.boolean(),
  prompt: z.string().trim().min(1).max(200),
  placeholder: z.string().trim().min(1).max(100),
});

export const experienceConfigSchema = z
  .object({
    schemaVersion: z.literal(1),
    screens: z.array(experienceScreenSchema),
    oneLiner: oneLinerSettingsSchema,
  })
  .superRefine((config, context) => {
    const screenIds = new Set<string>();
    for (const [screenIndex, screen] of config.screens.entries()) {
      if (screenIds.has(screen.id)) {
        context.addIssue({
          code: 'custom',
          path: ['screens', screenIndex, 'id'],
          message: 'Screen IDs must be unique.',
        });
      }
      screenIds.add(screen.id);
      if (screen.type !== 'gallery') continue;
      const tileIds = new Set<string>();
      for (const [tileIndex, tile] of screen.tiles.entries()) {
        if (tileIds.has(tile.id)) {
          context.addIssue({
            code: 'custom',
            path: ['screens', screenIndex, 'tiles', tileIndex, 'id'],
            message: 'Tile IDs must be unique within a screen.',
          });
        }
        tileIds.add(tile.id);
      }
      if (screen.useFirstTileAsCover && screen.tiles[0]?.type !== 'prefilled') {
        context.addIssue({
          code: 'custom',
          path: ['screens', screenIndex, 'tiles'],
          message: 'A cover needs the first tile to be a pre-filled image.',
        });
      }
    }
  });
export type ExperienceConfig = z.infer<typeof experienceConfigSchema>;

export const visitorUploadSchema = z.object({
  schemaVersion: z.literal(1),
  screenId: z.string().trim().min(1),
  tileId: z.string().trim().min(1),
  media: localMediaSchema,
});
export type VisitorUpload = z.infer<typeof visitorUploadSchema>;

export const visitorOneLinerSchema = z.object({
  value: z.string().trim().min(1).max(160),
});

export function createExperienceId(prefix: string): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

export function galleryUploadKey(screenId: string, tileId: string): string {
  return `${screenId}:${tileId}`;
}

export function isGalleryScreen(screen: ExperienceScreen): screen is GalleryScreen {
  return screen.type === 'gallery';
}

function bundledImage(src: string): ExperienceMedia {
  return { kind: 'bundled', src };
}

function prefilledTile(
  id: string,
  title: string,
  alt: string,
  sentence: string,
  src: string,
): ExperienceTile {
  return { id, type: 'prefilled', title, alt, sentence, media: bundledImage(src) };
}

function uploadTile(id: string, label: string, sentence = ''): ExperienceTile {
  return { id, type: 'upload', label, sentence };
}

export const seedExperience: ExperienceConfig = {
  schemaVersion: 1,
  oneLiner: {
    enabled: true,
    prompt: 'What does calm mean to you, and/or how do you make time for it? Keep it short.',
    placeholder: 'For me, calm is...',
  },
  screens: [
    {
      id: 'nature',
      type: 'gallery',
      title: 'Nature',
      description: 'Take a moment with the places that help you slow down.',
      useFirstTileAsCover: true,
      repeatCoverInGallery: false,
      tiles: [
        prefilledTile(
          'cover-meadow',
          'Take a breath',
          'A green mountain meadow scattered with dandelions beneath a blue sky.',
          'Take a breath.',
          '/media/experience/cover-meadow.webp',
        ),
        prefilledTile(
          'nature-dunes',
          'Mountain path',
          'A quiet mountain valley with a winding path through green hills.',
          'There is room for this moment.',
          '/media/experience/nature-dunes.webp',
        ),
        prefilledTile(
          'nature-forest',
          'Forest',
          'An evergreen forest rising through a soft morning haze.',
          'Let the next breath arrive on its own.',
          '/media/experience/nature-forest.webp',
        ),
        prefilledTile(
          'nature-brook',
          'Mountain lake',
          'A green mountain valley with a lake beneath cloud-covered peaks.',
          'Nothing needs an answer here.',
          '/media/experience/nature-brook.webp',
        ),
        uploadTile('nature-upload', 'Add a nature photo', 'A place that helps you pause.'),
      ],
    },
    {
      id: 'quiet-moments',
      type: 'gallery',
      title: 'Quiet Moments',
      description: 'Calm can exist in the middle of everyday life.',
      useFirstTileAsCover: false,
      repeatCoverInGallery: false,
      tiles: [
        prefilledTile(
          'quiet-city-reading',
          'Calm in the rush',
          'A person reading on a city bench while pedestrians move around them.',
          'CALM in the rush.',
          '/media/experience/quiet-city-reading.webp',
        ),
        prefilledTile(
          'quiet-window-tea',
          'A quiet cup of tea',
          'A person holding tea by a rain-speckled window.',
          'A small pause can be enough.',
          '/media/experience/quiet-window-tea.webp',
        ),
        prefilledTile(
          'quiet-balcony-garden',
          'Tending herbs',
          'A person tending herbs on an apartment balcony.',
          'Take your time.',
          '/media/experience/quiet-balcony-garden.webp',
        ),
        uploadTile('quiet-upload', 'Add a quiet moment', 'Your own quiet moment.'),
      ],
    },
    {
      id: 'friendly-faces',
      type: 'gallery',
      title: 'Friendly Faces',
      description: 'Add people whose relaxed presence matters to you.',
      useFirstTileAsCover: false,
      repeatCoverInGallery: false,
      tiles: [
        uploadTile(
          'friendly-self-upload',
          'Add a relaxed photo of yourself',
          'A relaxed moment of your own.',
        ),
        uploadTile(
          'friendly-other-upload',
          'Add a friendly or relaxed photo of someone else',
          'Someone whose presence feels good.',
        ),
      ],
    },
    {
      id: 'take-a-breath',
      type: 'breathing',
      title: 'Take a Breath',
      description: 'Follow the gentle movement at your own pace.',
    },
    {
      id: 'rust-gateway',
      type: 'gateway',
      title: 'RUST in de Reuring',
      description: 'Find more people and moments that make space for calm.',
      links: [
        {
          id: 'rust-site',
          label: 'Visit RUST in de Reuring',
          url: 'https://rustindereuring.nl/',
        },
        {
          id: 'rust-friends',
          label: 'Meet the Friends of RUST',
          url: 'https://rustindereuring.nl/mensen-die-rust-belangrijk-vinden/',
        },
      ],
    },
  ],
};
