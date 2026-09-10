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
    languageOptions: { globals: globals.browser },
    plugins: { import: importPlugin },
    settings: {
      react: { version: 'detect' },
      'import/resolver': { typescript: {} },
    },
    rules: {
      // The automatic JSX runtime needs no React import in scope. `react/jsx-uses-react`
      // stays on, so the files that still import React are not reported as unused.
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
    },
  },
  {
    // Typed linting, scoped by `files` to the trees tsconfig.app.json covers. .mock/** and
    // .storybook/** are linted but belong to no TypeScript project, so they stay untyped.
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
    // Playwright requires a hook's first argument to be an object destructuring pattern,
    // sometimes an empty one.
    files: ['playwright/**'],
    rules: { 'no-empty-pattern': 'off' },
  },
  {
    files: ['.mock/**', '.storybook/**', '**/*.cjs'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs' },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
]);
