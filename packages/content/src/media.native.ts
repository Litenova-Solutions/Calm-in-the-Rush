import type { MediaRef } from './schema';

declare const require: (path: string) => number;

const nativeAssets: Record<string, number> = {
  'lake.video': require('../assets/scenes/lake/scene.mp4'),
  'lake.poster': require('../assets/scenes/lake/poster.jpg'),
  'forest.video': require('../assets/scenes/forest/scene.mp4'),
  'forest.poster': require('../assets/scenes/forest/poster.jpg'),
  'field.video': require('../assets/scenes/field/scene.mp4'),
  'field.poster': require('../assets/scenes/field/poster.jpg'),
  'brook.video': require('../assets/scenes/brook/scene.mp4'),
  'brook.poster': require('../assets/scenes/brook/poster.jpg'),
};

export function resolveBundledMedia(ref: MediaRef): number | null {
  if (ref.kind === 'local') return null;
  return nativeAssets[ref.key] ?? null;
}
