const { defineConfig, globalIgnores } = require('eslint/config');
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const globals = require('globals');
const importPlugin = require('eslint-plugin-import');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const react = require('eslint-plugin-react');
const storybook = require('eslint-plugin-storybook');
const prettier = require('eslint-plugin-prettier/recommended');

// eslint expands only the extensions that some config's `files` pattern names, so this
// list decides which files `eslint .` visits at all.
const lintedFiles = ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'];
const nodeFiles = ['.mock/**', '.storybook/**', '**/*.cjs', 'entrypoint.js'];

module.exports = defineConfig([
  globalIgnores([
    '**/*.d.ts',
    'dist/**',
    'coverage/**',
    'storybook-static/**',
    '.mock/mockServiceWorker.js',
    '.yarn/**',
  ]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  ...storybook.configs['flat/recommended'],
  prettier,
  {
    files: lintedFiles,
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: globals.browser,
    },
    plugins: { import: importPlugin },
    settings: {
      react: { version: 'detect' },
      'import/resolver': { typescript: { project: '.' } },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        },
      ],
      // A leading underscore marks a binding as intentionally unused.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // Playwright hooks take an object destructuring pattern, sometimes an empty one.
      'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: true }],
    },
  },
  {
    // Typed linting, scoped to the trees tsconfig.json covers. `extends` keeps it off
    // .mock/** and .storybook/**, which tsc skips because they are dot-directories.
    files: ['src/**/*.{ts,tsx}', 'playwright/**/*.{ts,tsx}', 'config.ts'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-exports': 'error',
    },
  },
  {
    files: nodeFiles,
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ['**/*.cjs', 'entrypoint.js'],
    languageOptions: { sourceType: 'commonjs' },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
]);
