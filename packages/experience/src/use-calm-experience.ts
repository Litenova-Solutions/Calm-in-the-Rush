import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CalmScene } from '@calm/content';

import type { CalmExperienceModel, CalmExperienceOptions, ShareState } from './types';

const IDLE_CONTROL_DELAY_MS = 6000;
const SHARE_RESULT_DELAY_MS = 2400;

const shareLabels: Record<ShareState, string> = {
  idle: 'Share this calm moment',
  busy: 'Sharing this calm moment',
  copied: 'Calm moment link copied',
  failed: 'Share failed. Try again.',
};

/**
 * Owns scene selection, control visibility, player failure, and share state for
 * both frontends. It renders nothing and imports no visual system.
 */
export function useCalmExperience({
  scenes,
  resolveMedia,
  reducedMotion,
  initialSceneId,
  onShare,
}: CalmExperienceOptions): CalmExperienceModel {
  const [selectedId, setSelectedId] = useState(initialSceneId ?? scenes[0]?.id ?? '');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const [shareState, setShareState] = useState<ShareState>('idle');
  const [controlsVisible, setControlsVisible] = useState(true);
  const [focused, setFocused] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const shareTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const scene = useMemo(
    () => scenes.find((candidate) => candidate.id === selectedId) ?? scenes[0],
    [scenes, selectedId],
  );

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      if (!focused && !pickerOpen) setControlsVisible(false);
    }, IDLE_CONTROL_DELAY_MS);
  }, [focused, pickerOpen]);

  useEffect(() => {
    revealControls();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [revealControls, selectedId]);

  useEffect(
    () => () => {
      if (shareTimer.current) clearTimeout(shareTimer.current);
    },
    [],
  );

  useEffect(() => {
    setPlayerError(false);
  }, [selectedId]);

  useEffect(() => {
    if (!scenes.some((candidate) => candidate.id === selectedId))
      setSelectedId(scenes[0]?.id ?? '');
  }, [scenes, selectedId]);

  const selectScene = useCallback(
    (next: CalmScene) => {
      setSelectedId(next.id);
      setPickerOpen(false);
      revealControls();
    },
    [revealControls],
  );

  const openPicker = useCallback(() => {
    setPickerOpen(true);
    revealControls();
  }, [revealControls]);

  const closePicker = useCallback(() => setPickerOpen(false), []);

  const share = useCallback(async () => {
    if (!scene || !onShare) return;
    setShareState('busy');
    const result = await onShare(scene);
    setShareState(result === 'copied' ? 'copied' : result === 'failed' ? 'failed' : 'idle');
    if (shareTimer.current) clearTimeout(shareTimer.current);
    shareTimer.current = setTimeout(() => setShareState('idle'), SHARE_RESULT_DELAY_MS);
  }, [onShare, scene]);

  return {
    scene,
    media: scene ? resolveMedia(scene) : undefined,
    scenes,
    pickerOpen,
    playerError,
    shareState,
    shareLabel: shareLabels[shareState],
    statusMessage: playerError ? 'Video could not load. Showing the scene poster.' : null,
    controlsVisible,
    reducedMotion,
    showPoster: playerError || reducedMotion,
    isSelected: (candidate) => candidate.id === scene?.id,
    // A locally uploaded scene carries no location, so the label stays clean.
    sceneLabel: (candidate) =>
      [candidate.title, candidate.location, candidate.id === scene?.id ? 'selected' : '']
        .filter(Boolean)
        .join(', '),
    selectScene,
    openPicker,
    closePicker,
    share,
    revealControls,
    setFocused,
    reportPlayerError: () => setPlayerError(true),
    reportPlayerReady: () => setPlayerError(false),
  };
}
