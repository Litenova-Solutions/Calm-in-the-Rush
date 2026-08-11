import type { CalmScene } from '@calm/content';

export type ResolvedMedia = string | number;

export interface ResolvedSceneMedia {
  video: ResolvedMedia;
  poster: ResolvedMedia;
}

/** The player contract each platform implements with its own media element. */
export interface PlayerProps {
  video: ResolvedMedia;
  poster: ResolvedMedia;
  muted: boolean;
  paused: boolean;
  reducedMotion: boolean;
  onError: () => void;
  onReady: () => void;
}

export type ShareResult = 'shared' | 'copied' | 'failed' | void;

export type ShareState = 'idle' | 'busy' | 'copied' | 'failed';

export interface CalmExperienceOptions {
  scenes: CalmScene[];
  resolveMedia: (scene: CalmScene) => ResolvedSceneMedia;
  reducedMotion: boolean;
  initialSceneId?: string;
  onShare?: (scene: CalmScene) => Promise<ShareResult>;
}

/**
 * Platform-independent experience behavior. The web and native frontends render
 * this state with their own visual systems; neither owns the state machine.
 */
export interface CalmExperienceModel {
  scene: CalmScene | undefined;
  media: ResolvedSceneMedia | undefined;
  scenes: CalmScene[];
  pickerOpen: boolean;
  playerError: boolean;
  shareState: ShareState;
  shareLabel: string;
  statusMessage: string | null;
  controlsVisible: boolean;
  reducedMotion: boolean;
  showPoster: boolean;
  isSelected: (scene: CalmScene) => boolean;
  sceneLabel: (scene: CalmScene) => string;
  selectScene: (scene: CalmScene) => void;
  openPicker: () => void;
  closePicker: () => void;
  share: () => Promise<void>;
  revealControls: () => void;
  setFocused: (focused: boolean) => void;
  reportPlayerError: () => void;
  reportPlayerReady: () => void;
}
