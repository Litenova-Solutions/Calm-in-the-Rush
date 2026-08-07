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
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '@calm/ui';
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
      <View style={styles.loading}>
        <ActivityIndicator color={colors.sage} />
        <Text style={styles.loadingText}>Loading a quiet place...</Text>
      </View>
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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.deepTeal,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { color: colors.paper, fontFamily: 'Manrope_500Medium' },
});
