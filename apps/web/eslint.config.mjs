import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '.next/**',
      'public/media/**',
      'playwright-report/**',
      'test-results/**',
      // Installed shadcn/ui source is generated baseline source reviewed through
      // the source lock, not hand-authored feature code.
      'components/ui/**',
    ],
  },
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              message:
                'The web frontend is a shadcn/ui surface. React Native belongs to apps/mobile.',
            },
            {
              name: 'react-native-web',
              message:
                'The web frontend is a shadcn/ui surface. React Native belongs to apps/mobile.',
            },
            {
              name: '@calm/ui',
              message: '@calm/ui is the native design system. Use @/components/ui on the web.',
            },
          ],
          patterns: [
            {
              group: ['@base-ui/react', '@base-ui/react/*'],
              message: 'Compose installed primitives from @/components/ui, not the primitive base.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['app/**/*.tsx', 'app/**/*.ts', 'lib/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
);
