import { describe, expect, it } from 'vitest';

import { tamaguiConfig } from './tamagui.config';

const parsedConfig = tamaguiConfig as unknown as {
  parsed: boolean;
  tokens: { color: Record<string, { val?: string }> };
  fontsParsed: Record<string, unknown>;
};

describe('Tamagui configuration', () => {
  it('keeps the bundled theme tokens while exposing the Calm palette', () => {
    expect(parsedConfig.parsed).toBe(true);
    expect(parsedConfig.tokens.color.deepTeal.val).toBe('#10252B');
    expect(parsedConfig.tokens.color.white1).toBeDefined();
    expect(parsedConfig.fontsParsed.$body).toBeDefined();
  });
});
