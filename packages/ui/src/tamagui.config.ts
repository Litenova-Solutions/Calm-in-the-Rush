import { createTamagui } from 'tamagui';
import { config as defaultConfig } from '@tamagui/config/v3';

import { colors, fontFamily, fontSizes, radii, spacing } from './tokens';

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    // Keep the base color tokens because the bundled Tamagui themes refer to
    // them, then add the Calm in the Rush palette as project tokens.
    color: {
      ...defaultConfig.tokens.color,
      ...colors,
    },
    space: { ...spacing, true: spacing[4] },
    size: { ...spacing, true: spacing[4] },
    radius: { ...radii, true: radii.md },
    fontSize: { ...fontSizes, true: fontSizes.md },
  },
  fonts: {
    ...defaultConfig.fonts,
    // Tamagui font sections are token maps, not scalar values. Preserve the
    // generated maps and replace only the family name.
    body: { ...defaultConfig.fonts.body, family: fontFamily },
    heading: { ...defaultConfig.fonts.heading, family: fontFamily },
  },
  settings: {
    ...defaultConfig.settings,
    onlyAllowShorthands: false,
  },
} as any);

export type TamaguiConfig = typeof tamaguiConfig;
