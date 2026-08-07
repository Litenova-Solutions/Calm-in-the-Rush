import type { MediaRef } from './schema';

const pathByKey: Record<string, string> = {
  'lake.video': '/media/scenes/lake/scene.mp4',
  'lake.poster': '/media/scenes/lake/poster.jpg',
  'forest.video': '/media/scenes/forest/scene.mp4',
  'forest.poster': '/media/scenes/forest/poster.jpg',
  'field.video': '/media/scenes/field/scene.mp4',
  'field.poster': '/media/scenes/field/poster.jpg',
  'brook.video': '/media/scenes/brook/scene.mp4',
  'brook.poster': '/media/scenes/brook/poster.jpg',
};

export function resolveBundledMedia(ref: MediaRef): string | null {
  if (ref.kind === 'local') return null;
  return pathByKey[ref.key] ?? null;
}

export function resolveLocalMedia(ref: MediaRef, objectUrl: string): string | null {
  return ref.kind === 'local' ? objectUrl : resolveBundledMedia(ref);
}
