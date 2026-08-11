import { Platform, SafeAreaView, StyleSheet, useWindowDimensions } from 'react-native';
import type { CalmScene } from '@calm/content';
import { useCalmExperience, type CalmExperienceOptions, type PlayerProps } from '@calm/experience';
import { useReducedMotion } from '@calm/experience/reduced-motion';
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

interface CalmExperienceViewProps extends Omit<CalmExperienceOptions, 'reducedMotion'> {
  renderPlayer: (props: PlayerProps) => React.ReactNode;
  compact?: boolean;
}

/**
 * Native rendering of the shared experience model. The web frontend renders the
 * same model with shadcn/ui; neither owns the behavior.
 */
export function CalmExperience({
  renderPlayer,
  compact = false,
  ...options
}: CalmExperienceViewProps) {
  const reducedMotion = useReducedMotion();
  const model = useCalmExperience({ ...options, reducedMotion });
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  if (!model.scene || !model.media) {
    return (
      <Box viewStyle={styles.empty}>
        <PaperText tone="onDark" textStyle={styles.emptyText}>
          No published scenes are available.
        </PaperText>
      </Box>
    );
  }

  const frameWidth = Math.max(
    1,
    Math.min(windowWidth - spacing[8], 430, Math.max(1, windowHeight - spacing[12]) * (9 / 19.5)),
  );
  const frameHeight = frameWidth * (19.5 / 9);

  return (
    <SafeAreaView style={[styles.safe, compact && styles.safeCompact]}>
      <Box
        viewStyle={styles.canvas}
        onTouchStart={model.revealControls}
        onFocus={() => {
          model.setFocused(true);
          model.revealControls();
        }}
        onBlur={() => model.setFocused(false)}
      >
        <Box
          viewStyle={[styles.mediaFrame, { width: frameWidth, height: frameHeight }]}
          testID="experience-media-surface"
        >
          {model.showPoster ? (
            <UiImage
              source={model.media.poster}
              imageStyle={styles.media}
              resizeMode="cover"
              alt={`${model.scene.title} poster`}
            />
          ) : (
            renderPlayer({
              video: model.media.video,
              poster: model.media.poster,
              muted: true,
              paused: false,
              reducedMotion: model.reducedMotion,
              onError: model.reportPlayerError,
              onReady: model.reportPlayerReady,
            })
          )}
          <Box pointerEvents="none" viewStyle={styles.scrim} />
          {!model.controlsVisible ? (
            <Touchable
              accessibilityRole="button"
              accessibilityLabel="Show scene controls"
              onPress={model.revealControls}
              style={styles.tapTarget}
              testID="experience-reveal-controls"
            >
              <Box />
            </Touchable>
          ) : null}
          {model.controlsVisible ? (
            <Box viewStyle={styles.headingWrap}>
              <PaperText tone="onDark" variant="headlineSmall" textStyle={styles.heading}>
                Take a breath.
              </PaperText>
            </Box>
          ) : null}
          {model.statusMessage ? (
            <PaperText accessibilityRole="alert" tone="onDark" textStyle={styles.status}>
              {model.statusMessage}
            </PaperText>
          ) : null}
          {model.controlsVisible ? (
            <Box viewStyle={styles.dock}>
              <IconButton
                icon="list"
                iconColor={colors.paper}
                containerColor={overlays.dock}
                accessibilityLabel="Choose a scene"
                onPress={model.openPicker}
              />
              <IconButton
                icon="share"
                iconColor={colors.paper}
                containerColor={overlays.dock}
                accessibilityLabel={model.shareLabel}
                onPress={() => void model.share()}
              />
            </Box>
          ) : null}
        </Box>
      </Box>
      <Sheet visible={model.pickerOpen} onDismiss={model.closePicker}>
        <Box viewStyle={styles.sheetHeader}>
          <PaperText variant="titleLarge">Choose a place</PaperText>
          <IconButton
            icon="close"
            iconColor={colors.ink}
            containerColor={colors.paper}
            accessibilityLabel="Close scene picker"
            onPress={model.closePicker}
          />
        </Box>
        <Scroll contentStyle={styles.sceneList} keyboardShouldPersistTaps="handled">
          {model.scenes.map((candidate: CalmScene) => {
            const selected = model.isSelected(candidate);
            return (
              <Touchable
                key={candidate.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={model.sceneLabel(candidate)}
                onPress={() => model.selectScene(candidate)}
                style={[styles.sceneTile, selected && styles.sceneTileSelected]}
              >
                <Box>
                  <UiImage
                    source={options.resolveMedia(candidate).poster}
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
