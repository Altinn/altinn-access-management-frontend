// eslint-env node
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: "./tsconfig.json",
    ecmaFeatures: { jsx: true },
    ecmaVersion: "latest",
    sourceType: "module",
    extraFileExtensions: ".html",
  },
  env: {
    browser: true,
    es2021: true,
    "cypress/globals": true
  },
  extends: [
    'plugin:react/recommended',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    "plugin:cypress/recommended",
    "plugin:prettier/recommended"
    
  ],
  overrides: [],
  plugins: ['react' , 'cypress'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-no-bind': 'off',
    '@typescript-eslint/consistent-type-exports': 'warn',
    '@typescript-eslint/consistent-type-imports': 'warn',
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/strict-boolean-expressions": 0,
    "@typescript-eslint/triple-slash-reference": "off",
    "@typescript-eslint/no-namespace": "off",
    "eol-last": "error",
    "@typescript-eslint/no-invalid-void-type": 0,
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
      },
    ],
  },
  settings: {
    react: {
      version: '18',
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
};
