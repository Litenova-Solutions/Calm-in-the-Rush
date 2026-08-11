import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // The web target of the native package resolves through react-native-web,
      // which now lives with the native application rather than the web one.
      'react-native': resolve(
        import.meta.dirname,
        '../../apps/mobile/node_modules/react-native-web',
      ),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
  server: {
    deps: {
      inline: [
        'react-native-paper',
        'react-native-safe-area-context',
        '@callstack/react-theme-provider',
      ],
    },
  },
});
