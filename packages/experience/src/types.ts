import type { CalmScene } from '@calm/content';
import type { ReactNode } from 'react';

export type ResolvedMedia = string | number;

export interface PlayerProps {
  video: ResolvedMedia;
  poster: ResolvedMedia;
  muted: boolean;
  paused: boolean;
  reducedMotion: boolean;
  onError: () => void;
  onReady: () => void;
}

export type RenderPlayer = (props: PlayerProps) => ReactNode;

export interface CalmExperienceProps {
  scenes: CalmScene[];
  resolveMedia: (scene: CalmScene) => { video: ResolvedMedia; poster: ResolvedMedia };
  renderPlayer: RenderPlayer;
  initialSceneId?: string;
  onShare?: (scene: CalmScene) => Promise<'shared' | 'copied' | 'failed' | void>;
  compact?: boolean;
}
