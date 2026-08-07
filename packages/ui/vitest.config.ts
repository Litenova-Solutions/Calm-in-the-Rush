import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      'react-native': resolve(import.meta.dirname, '../../apps/web/node_modules/react-native-web'),
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
