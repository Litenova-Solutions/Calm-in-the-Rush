import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

import { colors, fontFamily, overlays, radii } from './tokens';

export const calmTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: radii.md / 4,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.deepTeal,
    onPrimary: colors.paper,
    primaryContainer: colors.sage,
    onPrimaryContainer: colors.deepTeal,
    secondary: colors.muted,
    onSecondary: colors.paper,
    secondaryContainer: colors.fog,
    onSecondaryContainer: colors.ink,
    tertiary: colors.sage,
    onTertiary: colors.deepTeal,
    tertiaryContainer: colors.warmCanvas,
    onTertiaryContainer: colors.ink,
    background: colors.warmCanvas,
    onBackground: colors.ink,
    surface: colors.paper,
    onSurface: colors.ink,
    surfaceVariant: colors.fog,
    onSurfaceVariant: colors.muted,
    outline: colors.muted,
    outlineVariant: colors.fog,
    error: colors.danger,
    onError: colors.paper,
    errorContainer: colors.dangerContainer,
    onErrorContainer: colors.dangerText,
    backdrop: overlays.backdrop,
  },
  fonts: Object.fromEntries(
    Object.entries(MD3LightTheme.fonts).map(([name, value]) => [name, { ...value, fontFamily }]),
  ) as MD3Theme['fonts'],
};
