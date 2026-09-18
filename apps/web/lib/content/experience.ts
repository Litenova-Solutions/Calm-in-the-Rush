import { z } from 'zod';

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;

export const imageFileAccept = imageMimeTypes.join(',');

const bundledMediaSchema = z.object({
  kind: z.literal('bundled'),
  src: z.string().startsWith('/'),
});

const bundledVideoMediaSchema = z.object({
  kind: z.literal('bundled-video'),
  src: z.string().startsWith('/'),
  poster: z.string().startsWith('/'),
  audio: z.string().startsWith('/').optional(),
});

const localMediaSchema = z.object({
  kind: z.literal('local'),
  blobId: z.string().trim().min(1),
  fileName: z.string().trim().min(1),
  mimeType: z.enum(imageMimeTypes),
  size: z.number().int().positive(),
});

export const experienceMediaSchema = z.union([
  bundledMediaSchema,
  bundledVideoMediaSchema,
  localMediaSchema,
]);
export type ExperienceMedia = z.infer<typeof experienceMediaSchema>;

const attributionSchema = z.object({
  author: z.string().trim().min(1).max(120),
  licenseName: z.string().trim().min(1).max(60),
  licenseUrl: z.string().url().startsWith('https://').optional(),
  sourceUrl: z.string().url().startsWith('https://'),
  changes: z.string().trim().min(1).max(160),
});
export type MediaAttribution = z.infer<typeof attributionSchema>;

const assignedSentenceSchema = z.string().trim().max(160);

const prefilledTileSchema = z.object({
  id: z.string().trim().min(1),
  type: z.literal('prefilled'),
  title: z.string().trim().min(1).max(60),
  alt: z.string().trim().min(1).max(160),
  sentence: assignedSentenceSchema,
  media: experienceMediaSchema,
  attribution: attributionSchema.optional(),
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

function prefilledVideoTile(
  id: string,
  title: string,
  alt: string,
  sentence: string,
  src: string,
  poster: string,
  audio: string,
  attribution: MediaAttribution,
): ExperienceTile {
  return {
    id,
    type: 'prefilled',
    title,
    alt,
    sentence,
    media: { kind: 'bundled-video', src, poster, audio },
    attribution,
  };
}

function uploadTile(id: string, label: string, sentence = ''): ExperienceTile {
  return { id, type: 'upload', label, sentence };
}

export const seedExperience: ExperienceConfig = {
  schemaVersion: 1,
  oneLiner: {
    enabled: true,
    prompt: 'What is calm for you?',
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
        prefilledVideoTile(
          'cover-meadow',
          'Green meadow',
          'Tall grass swaying in a soft breeze.',
          'Take a breath.',
          '/media/experience/nature-meadow.webm',
          '/media/experience/nature-meadow-poster.jpg',
          '/media/experience/audio-wheat.mp3',
          {
            author: 'Matt Richmond',
            licenseName: 'Pexels license',
            licenseUrl: 'https://www.pexels.com/license/',
            sourceUrl:
              'https://www.pexels.com/video/serene-green-meadow-swaying-in-soft-breeze-31160414/',
            changes: 'Scaled to 480 wide, 8 second excerpt, muted.',
          },
        ),
        prefilledVideoTile(
          'nature-wheat',
          'Wheat field',
          'Golden wheat swaying in a gentle breeze.',
          'Take a breath.',
          '/media/experience/nature-wheat.webm',
          '/media/experience/nature-wheat-poster.jpg',
          '/media/experience/audio-wheat.mp3',
          {
            author: 'Yasar Baskurt',
            licenseName: 'Pexels license',
            licenseUrl: 'https://www.pexels.com/license/',
            sourceUrl:
              'https://www.pexels.com/video/wind-blowing-through-golden-wheat-field-32508413/',
            changes: 'Scaled to 480 wide, muted.',
          },
        ),
        prefilledVideoTile(
          'nature-valla',
          'Forest',
          'Sunlit conifer trees in a boreal forest.',
          'Let the next breath arrive on its own.',
          '/media/experience/nature-valla.webm',
          '/media/experience/nature-valla-poster.jpg',
          '/media/experience/audio-forest.mp3',
          {
            author: 'Lauri Poldre',
            licenseName: 'Pexels license',
            licenseUrl: 'https://www.pexels.com/license/',
            sourceUrl: 'https://www.pexels.com/video/serene-sunlit-boreal-forest-scene-35504127/',
            changes: '12 second excerpt, scaled to 480 wide, muted.',
          },
        ),
        prefilledVideoTile(
          'nature-brook',
          'Mountain brook',
          'A calm mountain stream flowing over smooth rocks.',
          'Take a breath.',
          '/media/experience/cover-brook.webm',
          '/media/experience/cover-brook-poster.jpg',
          '/media/experience/audio-brook.mp3',
          {
            author: 'Dr Photographer',
            licenseName: 'Pexels license',
            licenseUrl: 'https://www.pexels.com/license/',
            sourceUrl:
              'https://www.pexels.com/video/serene-mountain-stream-flowing-over-rocks-38008512/',
            changes: 'Slowed to quarter speed, cropped to portrait, 8 second excerpt, muted.',
          },
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
          'CALM in the rush',
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
      title: 'Relaxed Faces',
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
        uploadTile('friendly-third-upload', 'Add another relaxed photo'),
        uploadTile('friendly-fourth-upload', 'Add one more relaxed photo'),
      ],
    },
    {
      id: 'take-a-breath',
      type: 'breathing',
      title: 'Take a Breath',
      description: 'Follow the gentle movement at your own pace.',
    },
    {
      id: 'calm-logo',
      type: 'gateway',
      title: 'CALM in the Rush',
      description: '',
      links: [],
    },
    {
      id: 'calm-quote',
      type: 'gateway',
      title: 'Your Calm Quote',
      description: '',
      links: [],
    },
  ],
};

export const seedExperienceNl: ExperienceConfig = {
  schemaVersion: 1,
  oneLiner: {
    enabled: true,
    prompt: 'Wat is rust voor jou?',
    placeholder: 'Voor mij is rust...',
  },
  screens: [
    {
      id: 'nature',
      type: 'gallery',
      title: 'Natuur',
      description: 'Neem even de tijd voor de plekken waar je tot rust komt.',
      useFirstTileAsCover: true,
      repeatCoverInGallery: false,
      tiles: [
        prefilledVideoTile(
          'cover-meadow',
          'Groene weide',
          'Hoog gras dat zachtjes in de bries beweegt.',
          'Haal even adem.',
          '/media/experience/nature-meadow.webm',
          '/media/experience/nature-meadow-poster.jpg',
          '/media/experience/audio-wheat.mp3',
          {
            author: 'Matt Richmond',
            licenseName: 'Pexels license',
            licenseUrl: 'https://www.pexels.com/license/',
            sourceUrl:
              'https://www.pexels.com/video/serene-green-meadow-swaying-in-soft-breeze-31160414/',
            changes: 'Scaled to 480 wide, 8 second excerpt, muted.',
          },
        ),
        prefilledVideoTile(
          'nature-wheat',
          'Korenveld',
          'Goudgeel koren dat in een zachte bries beweegt.',
          'Haal adem.',
          '/media/experience/nature-wheat.webm',
          '/media/experience/nature-wheat-poster.jpg',
          '/media/experience/audio-wheat.mp3',
          {
            author: 'Yasar Baskurt',
            licenseName: 'Pexels license',
            licenseUrl: 'https://www.pexels.com/license/',
            sourceUrl:
              'https://www.pexels.com/video/wind-blowing-through-golden-wheat-field-32508413/',
            changes: 'Scaled to 480 wide, muted.',
          },
        ),
        prefilledVideoTile(
          'nature-valla',
          'Bos',
          'Zonverlichte naaldbomen in een boreaal bos.',
          'Laat de volgende adem vanzelf komen.',
          '/media/experience/nature-valla.webm',
          '/media/experience/nature-valla-poster.jpg',
          '/media/experience/audio-forest.mp3',
          {
            author: 'Lauri Poldre',
            licenseName: 'Pexels license',
            licenseUrl: 'https://www.pexels.com/license/',
            sourceUrl: 'https://www.pexels.com/video/serene-sunlit-boreal-forest-scene-35504127/',
            changes: '12 second excerpt, scaled to 480 wide, muted.',
          },
        ),
        prefilledVideoTile(
          'nature-brook',
          'Bergbeek',
          'Een rustig bergbeekje dat over gladde stenen stroomt.',
          'Haal adem.',
          '/media/experience/cover-brook.webm',
          '/media/experience/cover-brook-poster.jpg',
          '/media/experience/audio-brook.mp3',
          {
            author: 'Dr Photographer',
            licenseName: 'Pexels license',
            licenseUrl: 'https://www.pexels.com/license/',
            sourceUrl:
              'https://www.pexels.com/video/serene-mountain-stream-flowing-over-rocks-38008512/',
            changes: 'Slowed to quarter speed, cropped to portrait, 8 second excerpt, muted.',
          },
        ),
        uploadTile(
          'nature-upload',
          'Voeg een natuurfoto toe',
          'Een plek die je helpt om even stil te staan.',
        ),
      ],
    },
    {
      id: 'quiet-moments',
      type: 'gallery',
      title: 'Rust Momenten',
      description: 'Rust kan bestaan midden in het dagelijks leven.',
      useFirstTileAsCover: false,
      repeatCoverInGallery: false,
      tiles: [
        prefilledTile(
          'quiet-city-reading',
          'Rust in de drukte',
          'Iemand die op een bankje in de stad leest terwijl voorbijgangers langslopen.',
          'RUST in de drukte.',
          '/media/experience/quiet-city-reading.webp',
        ),
        prefilledTile(
          'quiet-window-tea',
          'Een rustig kopje thee',
          'Iemand met thee bij een raam met regendruppels.',
          'Een kleine pauze kan genoeg zijn.',
          '/media/experience/quiet-window-tea.webp',
        ),
        prefilledTile(
          'quiet-balcony-garden',
          'Kruiden verzorgen',
          'Iemand die kruiden verzorgt op een balkon.',
          'Neem je tijd.',
          '/media/experience/quiet-balcony-garden.webp',
        ),
        uploadTile('quiet-upload', 'Voeg een rust moment toe', 'Je eigen rust moment.'),
      ],
    },
    {
      id: 'friendly-faces',
      type: 'gallery',
      title: 'Ontspannen Gezichten',
      description: 'Voeg mensen toe wiens ontspannen aanwezigheid belangrijk voor je is.',
      useFirstTileAsCover: false,
      repeatCoverInGallery: false,
      tiles: [
        uploadTile(
          'friendly-self-upload',
          'Voeg een ontspannen foto van jezelf toe',
          'Een ontspannen moment van jezelf.',
        ),
        uploadTile(
          'friendly-other-upload',
          'Voeg een vriendelijke of ontspannen foto van iemand anders toe',
          'Iemand wiens aanwezigheid goed voelt.',
        ),
        uploadTile('friendly-third-upload', 'Voeg nog een ontspannen foto toe'),
        uploadTile('friendly-fourth-upload', 'Voeg een extra ontspannen foto toe'),
      ],
    },
    {
      id: 'take-a-breath',
      type: 'breathing',
      title: 'Haal rustig adem',
      description: 'Volg de zachte beweging in je eigen tempo.',
    },
    {
      id: 'calm-logo',
      type: 'gateway',
      title: 'Rust in de Drukte',
      description: '',
      links: [],
    },
    {
      id: 'calm-quote',
      type: 'gateway',
      title: 'Jouw Rust Quote',
      description: '',
      links: [],
    },
  ],
};
