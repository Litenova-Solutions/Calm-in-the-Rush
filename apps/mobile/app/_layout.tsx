import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CalmProvider } from '@calm/ui';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <CalmProvider>
        <Stack screenOptions={{ headerShown: false, orientation: 'portrait' }} />
      </CalmProvider>
    </>
  );
}
