import { useEffect } from 'react';
import { AppState, StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

export function NativePlayer({
  video,
  poster,
  muted,
  paused,
  onError,
  onReady,
}: {
  video: string | number;
  poster: string | number;
  muted: boolean;
  paused: boolean;
  reducedMotion: boolean;
  onError: () => void;
  onReady: () => void;
}) {
  const player = useVideoPlayer(video as any, (instance) => {
    instance.loop = true;
    instance.muted = muted;
    if (!paused) instance.play();
  });
  useEffect(() => {
    player.muted = muted;
    if (paused) player.pause();
    else player.play();
  }, [muted, paused, player]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !paused) player.play();
      else if (state !== 'active') player.pause();
    });
    return () => subscription.remove();
  }, [paused, player]);
  useEffect(() => {
    const status = player.addListener('statusChange', (event) => {
      if (event.status === 'readyToPlay') onReady();
      if (event.status === 'error') onError();
    });
    return () => status.remove();
  }, [onError, onReady, player]);
  return (
    <VideoView player={player} nativeControls={false} contentFit="cover" style={styles.video} />
  );
}

const styles = StyleSheet.create({ video: { ...StyleSheet.absoluteFill } });
