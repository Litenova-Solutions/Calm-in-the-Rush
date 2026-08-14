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
    files: ['app/**/*.tsx', 'app/**/*.ts', 'lib/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
);
