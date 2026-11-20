import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      'playwright-report/**',
      'test-results/**',
      '**/drizzle/meta/**',
      '.dependency-cruiser.cjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/consistent-type-definitions': 'off',
      // Les handlers Fastify sont async par convention, même sans await.
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
    },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['apps/web/**/*.tsx'],
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'e2e/**'],
    rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
  },
  // Lisibilité du code applicatif (docs/adr/0010-complexite.md) : au-delà, on découpe.
  // Complexité « modifiée » : un `switch` compte pour une décision (réducteurs lisibles).
  {
    files: ['apps/*/src/**/*.{ts,tsx}', 'packages/*/src/**/*.ts'],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: {
      complexity: ['error', { max: 20, variant: 'modified' }],
      'max-depth': ['error', 4],
      'max-lines-per-function': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 5],
    },
  },
  // Tables de données déclaratives (exercices, catalogue d'images) : constructeurs positionnels
  // compacts et listes longues par nature ; la complexité, elle, reste limitée.
  {
    files: ['packages/content/src/maths/**/*.ts', 'apps/web/src/design/catalog/**/*.ts'],
    rules: { 'max-lines-per-function': 'off', 'max-params': 'off' },
  },
);
