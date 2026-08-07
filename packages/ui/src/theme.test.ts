import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native-paper', () => ({
  MD3LightTheme: {
    version: 3,
    dark: false,
    roundness: 4,
    animation: { scale: 1 },
    colors: {},
    fonts: {
      bodyLarge: { fontFamily: 'System' },
    },
  },
}));

import { calmTheme } from './theme';

describe('Calm in the Rush Paper theme', () => {
  it('maps the product palette to Material Design 3 roles', () => {
    expect(calmTheme.version).toBe(3);
    expect(calmTheme.colors.primary).toBe('#10252B');
    expect(calmTheme.colors.background).toBe('#EEF1E8');
    expect(calmTheme.colors.surface).toBe('#FAFBF7');
    expect(calmTheme.fonts.bodyLarge.fontFamily).toContain('Manrope');
  });
});
