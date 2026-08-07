import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { CalmScene } from '@calm/content';
import { colors, icons, radii, spacing } from '@calm/ui';

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
  const sceneButtonRef = useRef<any>(null);
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
    setTimeout(() => sceneButtonRef.current?.focus?.(), 0);
  };

  const closePicker = () => {
    setPickerOpen(false);
    setTimeout(() => sceneButtonRef.current?.focus?.(), 0);
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
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No published scenes are available.</Text>
      </View>
    );
  }

  const media = resolveMedia(scene);
  const frameWidth = Math.max(
    1,
    Math.min(windowWidth - spacing[8], 430, Math.max(1, windowHeight - spacing[12]) * (9 / 19.5)),
  );
  const frameHeight = frameWidth * (19.5 / 9);
  const imageSource = (source: string | number) =>
    typeof source === 'number' ? source : { uri: source };
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
      <View
        style={styles.canvas}
        onTouchStart={showControls}
        onFocus={() => {
          setFocused(true);
          showControls();
        }}
        onBlur={() => setFocused(false)}
      >
        <View
          style={[styles.mediaFrame, { width: frameWidth, height: frameHeight }]}
          testID="experience-media-surface"
        >
          {playerError || reducedMotion ? (
            <Image
              source={imageSource(media.poster)}
              style={styles.media}
              resizeMode="cover"
              accessibilityLabel={`${scene.title} poster`}
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
          <View pointerEvents="none" style={styles.scrim} />
          {!controlsVisible ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Show scene controls"
              onPress={showControls}
              style={styles.tapTarget}
              testID="experience-reveal-controls"
            />
          ) : null}
          {controlsVisible ? (
            <View style={styles.headingWrap}>
              <Text style={styles.heading}>Take a breath.</Text>
            </View>
          ) : null}
          {statusMessage ? (
            <Text accessibilityRole="alert" style={styles.status}>
              {statusMessage}
            </Text>
          ) : null}
          {controlsVisible ? (
            <View style={styles.dock} accessibilityLabel="Scene controls">
              <Pressable
                ref={sceneButtonRef}
                accessibilityRole="button"
                accessibilityLabel="Choose a scene"
                onPress={() => {
                  setPickerOpen(true);
                  showControls();
                }}
                style={styles.iconButton}
              >
                <icons.scene size={19} color={colors.paper} strokeWidth={2} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={shareLabel}
                onPress={share}
                style={styles.iconButton}
              >
                <icons.share size={19} color={colors.paper} strokeWidth={2} />
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
      <Modal
        visible={pickerOpen}
        transparent
        animationType={reducedMotion ? 'none' : 'slide'}
        onRequestClose={closePicker}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet} accessibilityViewIsModal>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choose a place</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close scene picker"
                onPress={closePicker}
                style={styles.closeButton}
              >
                <icons.close size={18} color={colors.ink} strokeWidth={2} />
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.sceneList}
              keyboardShouldPersistTaps="handled"
            >
              {scenes.map((candidate) => {
                const candidateMedia = resolveMedia(candidate);
                const selected = candidate.id === scene.id;
                return (
                  <Pressable
                    key={candidate.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${candidate.title}, ${candidate.location}${selected ? ', selected' : ''}`}
                    onPress={() => selectScene(candidate)}
                    style={[styles.sceneTile, selected && styles.sceneTileSelected]}
                  >
                    <Image
                      source={imageSource(candidateMedia.poster)}
                      style={styles.thumbnail}
                      accessibilityElementsHidden
                    />
                    {selected ? (
                      <View accessibilityElementsHidden style={styles.selectedMarker}>
                        <icons.check size={15} color={colors.paper} strokeWidth={2.5} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#0A1B20',
    position: 'relative',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 12px 24px rgba(0, 0, 0, 0.25)' }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 12 },
        }),
  },
  media: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(7, 23, 27, 0.12)' },
  tapTarget: { ...StyleSheet.absoluteFill, zIndex: 1 },
  headingWrap: { position: 'absolute', top: spacing[8], left: spacing[6], right: spacing[6] },
  heading: { color: colors.paper, fontSize: 28, fontWeight: '400', letterSpacing: -0.4 },
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
  iconButton: {
    width: 44,
    height: 44,
    minHeight: 44,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(16, 37, 43, 0.66)',
  },
  status: {
    position: 'absolute',
    bottom: 120,
    left: spacing[5],
    right: spacing[5],
    color: colors.paper,
    textAlign: 'center',
    backgroundColor: 'rgba(16, 37, 43, 0.8)',
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
  emptyText: { color: colors.paper, fontSize: 16 },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(16, 37, 43, 0.58)', justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '82%',
    backgroundColor: colors.warmCanvas,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing[5],
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[4],
    marginBottom: spacing[4],
  },
  sheetTitle: { color: colors.ink, fontSize: 22, fontWeight: '700' },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
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
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
  },
});
