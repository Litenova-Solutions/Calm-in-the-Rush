import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  { ignores: ['.next/**', 'public/media/**', 'playwright-report/**', 'test-results/**'] },
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native-paper',
              message: 'Import Paper components from @calm/ui.',
            },
            {
              name: 'react-native',
              message: 'Import React Native primitives from @calm/ui.',
            },
            {
              name: 'lucide-react-native',
              message: 'Import icons from @calm/ui.',
            },
          ],
          patterns: [
            {
              group: ['@calm/ui/*'],
              message: 'Import public UI exports from @calm/ui.',
            },
          ],
        },
      ],
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
);
