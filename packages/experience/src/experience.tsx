import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet, useWindowDimensions } from 'react-native';
import type { CalmScene } from '@calm/content';
import {
  Box,
  CalmIcon,
  colors,
  fontSizes,
  IconButton,
  Image as UiImage,
  overlays,
  PaperText,
  radii,
  Scroll,
  shadows,
  Sheet,
  spacing,
  Touchable,
} from '@calm/ui';

import type { CalmExperienceProps } from './types';
import { useReducedMotion } from './use-reduced-motion';

export function CalmExperience({
  scenes,
  resolveMedia,
  renderPlayer,
  initialSceneId,
  onShare,
  compact = false,
}: CalmExperienceProps) {
  const [selectedId, setSelectedId] = useState(initialSceneId ?? scenes[0]?.id ?? '');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'busy' | 'copied' | 'failed'>('idle');
  const [controlsVisible, setControlsVisible] = useState(true);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useReducedMotion();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const scene = useMemo(
    () => scenes.find((candidate) => candidate.id === selectedId) ?? scenes[0],
    [scenes, selectedId],
  );

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      if (!focused && !pickerOpen) setControlsVisible(false);
    }, 6000);
  }, [focused, pickerOpen]);

  useEffect(() => {
    showControls();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [showControls, selectedId]);

  useEffect(() => {
    setPlayerError(false);
  }, [selectedId]);

  useEffect(() => {
    if (!scenes.some((candidate) => candidate.id === selectedId))
      setSelectedId(scenes[0]?.id ?? '');
  }, [scenes, selectedId]);

  const selectScene = (next: CalmScene) => {
    setSelectedId(next.id);
    setPickerOpen(false);
    showControls();
  };

  const closePicker = () => {
    setPickerOpen(false);
  };

  const share = async () => {
    if (!scene || !onShare) return;
    setShareState('busy');
    const result = await onShare(scene);
    setShareState(
      result === undefined
        ? 'idle'
        : result === 'copied'
          ? 'copied'
          : result === 'failed'
            ? 'failed'
            : 'idle',
    );
    setTimeout(() => setShareState('idle'), 2400);
  };

  if (!scene) {
    return (
      <Box viewStyle={styles.empty}>
        <PaperText tone="onDark" textStyle={styles.emptyText}>
          No published scenes are available.
        </PaperText>
      </Box>
    );
  }

  const media = resolveMedia(scene);
  const frameWidth = Math.max(
    1,
    Math.min(windowWidth - spacing[8], 430, Math.max(1, windowHeight - spacing[12]) * (9 / 19.5)),
  );
  const frameHeight = frameWidth * (19.5 / 9);
  const statusMessage = playerError ? 'Video could not load. Showing the scene poster.' : null;
  const shareLabel =
    shareState === 'busy'
      ? 'Sharing this calm moment'
      : shareState === 'copied'
        ? 'Calm moment link copied'
        : shareState === 'failed'
          ? 'Share failed. Try again.'
          : 'Share this calm moment';

  return (
    <SafeAreaView style={[styles.safe, compact && styles.safeCompact]}>
      <Box
        viewStyle={styles.canvas}
        onTouchStart={showControls}
        onFocus={() => {
          setFocused(true);
          showControls();
        }}
        onBlur={() => setFocused(false)}
      >
        <Box
          viewStyle={[styles.mediaFrame, { width: frameWidth, height: frameHeight }]}
          testID="experience-media-surface"
        >
          {playerError || reducedMotion ? (
            <UiImage
              source={media.poster}
              imageStyle={styles.media}
              resizeMode="cover"
              alt={`${scene.title} poster`}
            />
          ) : (
            renderPlayer({
              video: media.video,
              poster: media.poster,
              muted: true,
              paused: false,
              reducedMotion,
              onError: () => setPlayerError(true),
              onReady: () => setPlayerError(false),
            })
          )}
          <Box pointerEvents="none" viewStyle={styles.scrim} />
          {!controlsVisible ? (
            <Touchable
              accessibilityRole="button"
              accessibilityLabel="Show scene controls"
              onPress={showControls}
              style={styles.tapTarget}
              testID="experience-reveal-controls"
            >
              <Box />
            </Touchable>
          ) : null}
          {controlsVisible ? (
            <Box viewStyle={styles.headingWrap}>
              <PaperText tone="onDark" variant="headlineSmall" textStyle={styles.heading}>
                Take a breath.
              </PaperText>
            </Box>
          ) : null}
          {statusMessage ? (
            <PaperText accessibilityRole="alert" tone="onDark" textStyle={styles.status}>
              {statusMessage}
            </PaperText>
          ) : null}
          {controlsVisible ? (
            <Box viewStyle={styles.dock}>
              <IconButton
                icon="list"
                iconColor={colors.paper}
                containerColor={overlays.dock}
                accessibilityLabel="Choose a scene"
                onPress={() => {
                  setPickerOpen(true);
                  showControls();
                }}
              />
              <IconButton
                icon="share"
                iconColor={colors.paper}
                containerColor={overlays.dock}
                accessibilityLabel={shareLabel}
                onPress={share}
              />
            </Box>
          ) : null}
        </Box>
      </Box>
      <Sheet visible={pickerOpen} onDismiss={closePicker}>
        <Box viewStyle={styles.sheetHeader}>
          <PaperText variant="titleLarge">Choose a place</PaperText>
          <IconButton
            icon="close"
            iconColor={colors.ink}
            containerColor={colors.paper}
            accessibilityLabel="Close scene picker"
            onPress={closePicker}
          />
        </Box>
        <Scroll contentStyle={styles.sceneList} keyboardShouldPersistTaps="handled">
          {scenes.map((candidate) => {
            const candidateMedia = resolveMedia(candidate);
            const selected = candidate.id === scene.id;
            return (
              <Touchable
                key={candidate.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${candidate.title}, ${candidate.location}${selected ? ', selected' : ''}`}
                onPress={() => selectScene(candidate)}
                style={[styles.sceneTile, selected && styles.sceneTileSelected]}
              >
                <Box>
                  <UiImage
                    source={candidateMedia.poster}
                    imageStyle={styles.thumbnail}
                    alt=""
                    accessibilityElementsHidden
                  />
                  {selected ? (
                    <Box accessibilityElementsHidden viewStyle={styles.selectedMarker}>
                      <CalmIcon name="check" size={15} color={colors.paper} strokeWidth={2.5} />
                    </Box>
                  ) : null}
                </Box>
              </Touchable>
            );
          })}
        </Scroll>
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.deepTeal },
  safeCompact: { minHeight: 620 },
  canvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.deepTeal,
    padding: spacing[4],
  },
  mediaFrame: {
    maxWidth: 430,
    overflow: 'hidden',
    borderRadius: radii.lg,
    backgroundColor: colors.deepTeal,
    position: 'relative',
    ...(Platform.OS === 'web'
      ? { boxShadow: shadows.frame }
      : {
          shadowColor: colors.deepTeal,
          shadowOpacity: 0.25,
          shadowRadius: spacing[6],
          shadowOffset: { width: 0, height: spacing[3] },
        }),
  },
  media: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: overlays.mediaScrim },
  tapTarget: { ...StyleSheet.absoluteFill, zIndex: 1 },
  headingWrap: {
    position: 'absolute',
    top: spacing[8],
    left: spacing[6],
    right: spacing[6],
  },
  heading: { color: colors.paper, fontWeight: '400', letterSpacing: -0.4 },
  dock: {
    position: 'absolute',
    bottom: spacing[5],
    left: spacing[4],
    right: spacing[4],
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    zIndex: 2,
  },
  status: {
    position: 'absolute',
    bottom: 120,
    left: spacing[5],
    right: spacing[5],
    color: colors.paper,
    textAlign: 'center',
    backgroundColor: overlays.status,
    padding: spacing[2],
    borderRadius: radii.sm,
  },
  empty: {
    flex: 1,
    backgroundColor: colors.deepTeal,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  emptyText: { color: colors.paper, fontSize: fontSizes.md },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[4],
    marginBottom: spacing[4],
  },
  sceneList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    paddingBottom: spacing[4],
  },
  sceneTile: {
    width: '47.5%',
    aspectRatio: 9 / 13,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.fog,
    backgroundColor: colors.paper,
  },
  sceneTileSelected: { borderColor: colors.ink, borderWidth: 3 },
  thumbnail: { width: '100%', height: '100%', backgroundColor: colors.fog },
  selectedMarker: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
  },
});
