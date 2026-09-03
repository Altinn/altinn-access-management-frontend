const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const globals = require('globals');
const importPlugin = require('eslint-plugin-import');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const react = require('eslint-plugin-react');
const storybook = require('eslint-plugin-storybook');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

// Files that TypeScript's wildcard include does not pick up (dot-directories are
// skipped by tsc, and CommonJS config files are outside the project entirely), so
// they have to be linted without type information.
const untypedFiles = ['.mock/**', '.storybook/**', '**/*.cjs', 'entrypoint.js'];

module.exports = [
  {
    ignores: [
      '**/*.d.ts',
      'dist/**',
      'coverage/**',
      'storybook-static/**',
      '.mock/mockServiceWorker.js',
      '.yarn/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs['flat/recommended'],
  react.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  ...storybook.configs['flat/recommended'],
  // Keep prettier last so it wins over the formatting rules the configs above enable.
  prettierConfig,
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: globals.browser,
    },
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          project: '.',
        },
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-bind': 'off',
      '@typescript-eslint/consistent-type-exports': 'warn',
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/strict-boolean-expressions': 0,
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-namespace': 'off',
      'eol-last': 'error',
      '@typescript-eslint/no-invalid-void-type': 0,
      'import/no-duplicates': 'warn',
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        },
      ],
    },
  },
  {
    files: untypedFiles,
    languageOptions: {
      parserOptions: { project: null },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Needs type information, which is unavailable for these files.
      '@typescript-eslint/consistent-type-exports': 'off',
    },
  },
  {
    files: ['**/*.cjs', 'entrypoint.js'],
    languageOptions: { sourceType: 'commonjs' },
    rules: {
      // These files are CommonJS by definition.
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
