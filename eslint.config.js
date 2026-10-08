import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked, reactHooks.configs.flat['recommended-latest'], prettier],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['\\.css$'],
            ['^react', '^@?\\w'],
            ['^@/context(/|$)'],
            ['^@/hooks(/|$)'],
            ['^@/pages(/|$)'],
            ['^@/components(/|$)'],
            ['^@/utilities(/|$)'],
            ['^@/'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['*.{js,ts}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['src/tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/require-await': 'off',
    },
  },
);
