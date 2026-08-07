import { useFonts } from 'expo-font';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { resolveBundledMedia } from '@calm/content/media';
import { seedCatalog, sortPublishedScenes } from '@calm/content';
import { CalmExperience } from '@calm/experience';
import { shareMoment } from '@calm/experience/share';
import { ActivityIndicator, PaperText, Screen, Stack } from '@calm/ui';
import { NativePlayer } from '../components/NativePlayer';

export default function HomeScreen() {
  const [loaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  if (!loaded)
    return (
      <Screen tone="deep" className="mobile-loading">
        <Stack align="center" justify="center" space={3} className="mobile-loading-content">
          <ActivityIndicator />
          <PaperText tone="onDark" variant="bodyMedium">
            Loading a quiet place...
          </PaperText>
        </Stack>
      </Screen>
    );
  const scenes = sortPublishedScenes(seedCatalog.scenes);
  return (
    <CalmExperience
      scenes={scenes}
      resolveMedia={(scene) => ({
        video: resolveBundledMedia(scene.video) ?? 0,
        poster: resolveBundledMedia(scene.poster) ?? 0,
      })}
      renderPlayer={(props) => <NativePlayer {...props} />}
      onShare={(scene) => shareMoment(scene.title, 'https://calmintherush.org/demo')}
    />
  );
}
