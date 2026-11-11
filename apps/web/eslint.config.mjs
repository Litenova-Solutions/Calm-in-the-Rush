import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '.next/**',
      'public/media/**',
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
    // The service worker runs as a classic script with the worker globals.
    files: ['public/sw.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        self: 'readonly',
        caches: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
      },
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
