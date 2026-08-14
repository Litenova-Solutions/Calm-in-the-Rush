import { z } from 'zod';

const mediaTypeSchema = z.enum(['image', 'video']);
export type GalleryMediaType = z.infer<typeof mediaTypeSchema>;

const bundledGalleryMediaSchema = z
  .object({
    kind: z.literal('bundled'),
    mediaType: mediaTypeSchema.optional(),
    src: z.string().startsWith('/media/'),
    poster: z.string().startsWith('/media/').optional(),
  })
  .superRefine((media, context) => {
    const mediaType = media.mediaType ?? (media.src.endsWith('.mp4') ? 'video' : 'image');
    if (mediaType === 'video' && !media.poster) {
      context.addIssue({
        code: 'custom',
        path: ['poster'],
        message: 'Video media needs a poster image.',
      });
    }
  })
  .transform((media) => ({
    ...media,
    mediaType: media.mediaType ?? (media.src.endsWith('.mp4') ? 'video' : 'image'),
  }));

const localGalleryMediaSchema = z
  .object({
    kind: z.literal('local'),
    mediaType: mediaTypeSchema.optional(),
    blobId: z.string().trim().min(1),
    fileName: z.string().trim().min(1),
    mimeType: z.string().trim().min(1),
    size: z.number().int().positive(),
  })
  .superRefine((media, context) => {
    const inferredType = media.mimeType.startsWith('video/')
      ? 'video'
      : media.mimeType.startsWith('image/')
        ? 'image'
        : null;
    if (!inferredType) {
      context.addIssue({
        code: 'custom',
        path: ['mimeType'],
        message: 'Local media must be an image or video.',
      });
    }
    if (media.mediaType && inferredType && media.mediaType !== inferredType) {
      context.addIssue({
        code: 'custom',
        path: ['mediaType'],
        message: 'Media type must match the local file type.',
      });
    }
  })
  .transform((media) => ({
    ...media,
    mediaType: media.mediaType ?? (media.mimeType.startsWith('video/') ? 'video' : 'image'),
  }));

export const galleryMediaSchema = z.union([bundledGalleryMediaSchema, localGalleryMediaSchema]);
export type GalleryMedia = z.output<typeof galleryMediaSchema>;

const gallerySentenceSchema = z.string().trim().min(1).max(160);
export type GallerySentence = z.infer<typeof gallerySentenceSchema>;

export const defaultGallerySentences = [
  'Nothing needs an answer here.',
  'You can stay with this view.',
  'Let the next breath arrive on its own.',
  'There is room for this moment.',
  'There is no next step to find.',
] as const;

const prefilledGalleryTileSchema = z
  .object({
    id: z.string().trim().min(1),
    type: z.literal('prefilled'),
    title: z.string().trim().min(1).max(60),
    alt: z.string().trim().min(1).max(160),
    media: galleryMediaSchema.optional(),
    image: galleryMediaSchema.optional(),
  })
  .superRefine((tile, context) => {
    if (!tile.media && !tile.image) {
      context.addIssue({
        code: 'custom',
        path: ['media'],
        message: 'Pre-filled tiles need media.',
      });
    }
  })
  .transform(({ image, media, ...tile }) => ({ ...tile, media: media ?? image! }));

const uploadGalleryTileSchema = z.object({
  id: z.string().trim().min(1),
  type: z.literal('upload'),
  label: z.string().trim().min(1).max(60),
});

export const galleryTileSchema = z.union([prefilledGalleryTileSchema, uploadGalleryTileSchema]);
export type GalleryTile = z.output<typeof galleryTileSchema>;

export const galleryPageSchema = z
  .object({
    id: z.string().trim().min(1),
    title: z.string().trim().min(1).max(60),
    description: z.string().trim().max(160),
    tiles: z.array(galleryTileSchema),
  })
  .superRefine((page, context) => {
    const ids = new Set<string>();
    for (const [index, tile] of page.tiles.entries()) {
      if (ids.has(tile.id)) {
        context.addIssue({
          code: 'custom',
          path: ['tiles', index, 'id'],
          message: 'Tile IDs must be unique within a page.',
        });
      }
      ids.add(tile.id);
    }
  });
export type GalleryPage = z.output<typeof galleryPageSchema>;

export const galleryConfigSchema = z
  .object({
    schemaVersion: z.literal(1),
    pages: z.array(galleryPageSchema).min(1),
    sentences: z
      .array(gallerySentenceSchema)
      .min(1)
      .max(24)
      .default([...defaultGallerySentences]),
  })
  .superRefine((config, context) => {
    const ids = new Set<string>();
    for (const [index, page] of config.pages.entries()) {
      if (ids.has(page.id)) {
        context.addIssue({
          code: 'custom',
          path: ['pages', index, 'id'],
          message: 'Page IDs must be unique.',
        });
      }
      ids.add(page.id);
    }
  });
export type GalleryConfig = z.output<typeof galleryConfigSchema>;

export const galleryUploadSchema = z
  .object({
    schemaVersion: z.literal(1),
    pageId: z.string().trim().min(1),
    tileId: z.string().trim().min(1),
    media: localGalleryMediaSchema.optional(),
    image: localGalleryMediaSchema.optional(),
  })
  .superRefine((upload, context) => {
    if (!upload.media && !upload.image) {
      context.addIssue({
        code: 'custom',
        path: ['media'],
        message: 'An upload needs media.',
      });
    }
  })
  .transform(({ image, media, ...upload }) => ({ ...upload, media: media ?? image! }));
export type GalleryUpload = z.output<typeof galleryUploadSchema>;

function uploadSlots(pageId: string, count: number, label: string): GalleryTile[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${pageId}-upload-${index + 1}`,
    type: 'upload' as const,
    label,
  }));
}

function bundledImage(src: string): GalleryMedia {
  return { kind: 'bundled', mediaType: 'image', src };
}

function bundledVideo(src: string, poster: string): GalleryMedia {
  return { kind: 'bundled', mediaType: 'video', src, poster };
}

function prefilledTile(id: string, title: string, alt: string, media: GalleryMedia): GalleryTile {
  return { id, type: 'prefilled', title, alt, media };
}

const yourPeopleUploadPrompt = 'Add a nice photo or video of yourself and/or people you love';
const legacyYourPeopleDescription =
  'Add a nice photo or video of yourself or someone you care about.';
const legacyYourPeopleUploadLabel = 'Add a photo or video';

export const seedGallery: GalleryConfig = {
  schemaVersion: 1,
  sentences: [...defaultGallerySentences],
  pages: [
    {
      id: 'nature',
      title: 'Nature',
      description: 'Choose a place, or add one from your device.',
      tiles: [
        prefilledTile(
          'nature-lake',
          'Lake',
          'Misty lake beside a mountain shoreline.',
          bundledVideo('/media/gallery/nature/lake/scene.mp4', '/media/gallery/nature/lake.jpg'),
        ),
        prefilledTile(
          'nature-forest',
          'Forest',
          'Tall trees moving in a quiet forest.',
          bundledVideo(
            '/media/gallery/nature/forest/scene.mp4',
            '/media/gallery/nature/forest.jpg',
          ),
        ),
        prefilledTile(
          'nature-field',
          'Field',
          'Wheat moving in an open field.',
          bundledVideo('/media/gallery/nature/field/scene.mp4', '/media/gallery/nature/field.jpg'),
        ),
        prefilledTile(
          'nature-brook',
          'Brook',
          'Mountain water moving over stones.',
          bundledVideo('/media/gallery/nature/brook/scene.mp4', '/media/gallery/nature/brook.jpg'),
        ),
        prefilledTile(
          'nature-night',
          'Night sky',
          'Stars above a mountain lake at night.',
          bundledImage('/media/landing/hero.jpg'),
        ),
        ...uploadSlots('nature', 7, 'Add a nature photo or video'),
      ],
    },
    {
      id: 'calm-activities',
      title: 'Quiet moments',
      description: 'Small things people do when there is time to slow down.',
      tiles: [
        prefilledTile(
          'calm-guitar',
          'Guitar',
          'A person quietly playing guitar on a porch.',
          bundledImage('/media/gallery/people/guitar.png'),
        ),
        prefilledTile(
          'calm-reading',
          'Reading',
          'A person reading beside a window.',
          bundledImage('/media/gallery/people/reading.png'),
        ),
        prefilledTile(
          'calm-tea',
          'Tea',
          'A person holding tea beside a rain-speckled window.',
          bundledImage('/media/gallery/people/tea.png'),
        ),
        prefilledTile(
          'calm-stretching',
          'Stretching',
          'A person stretching in a quiet park.',
          bundledImage('/media/gallery/people/stretching.png'),
        ),
        prefilledTile(
          'calm-gardening',
          'Gardening',
          'A person tending herbs on a balcony.',
          bundledImage('/media/gallery/people/gardening.png'),
        ),
        ...uploadSlots('calm-activities', 7, 'Add your own photo or video'),
      ],
    },
    {
      id: 'your-people',
      title: 'Your people',
      description: yourPeopleUploadPrompt,
      tiles: uploadSlots('your-people', 6, yourPeopleUploadPrompt),
    },
  ],
};

const legacyNatureVideoByTileId: Record<string, GalleryMedia> = {
  'nature-lake': bundledVideo(
    '/media/gallery/nature/lake/scene.mp4',
    '/media/gallery/nature/lake.jpg',
  ),
  'nature-forest': bundledVideo(
    '/media/gallery/nature/forest/scene.mp4',
    '/media/gallery/nature/forest.jpg',
  ),
  'nature-field': bundledVideo(
    '/media/gallery/nature/field/scene.mp4',
    '/media/gallery/nature/field.jpg',
  ),
  'nature-brook': bundledVideo(
    '/media/gallery/nature/brook/scene.mp4',
    '/media/gallery/nature/brook.jpg',
  ),
};

export function upgradeLegacyGallery(config: GalleryConfig): GalleryConfig {
  return {
    ...config,
    pages: config.pages.map((page) =>
      page.id === 'nature'
        ? {
            ...page,
            tiles: page.tiles.map((tile) => {
              const video =
                tile.type === 'prefilled' ? legacyNatureVideoByTileId[tile.id] : undefined;
              if (
                !video ||
                video.kind !== 'bundled' ||
                !video.poster ||
                tile.type !== 'prefilled' ||
                tile.media.kind !== 'bundled' ||
                tile.media.mediaType !== 'image' ||
                tile.media.src !== video.poster
              )
                return tile;
              return { ...tile, media: video };
            }),
          }
        : page.id === 'your-people'
          ? {
              ...page,
              description:
                page.description === legacyYourPeopleDescription
                  ? yourPeopleUploadPrompt
                  : page.description,
              tiles: page.tiles.map((tile) =>
                tile.type === 'upload' && tile.label === legacyYourPeopleUploadLabel
                  ? { ...tile, label: yourPeopleUploadPrompt }
                  : tile,
              ),
            }
          : page,
    ),
  };
}

export function galleryUploadKey(pageId: string, tileId: string): string {
  return `${pageId}:${tileId}`;
}
