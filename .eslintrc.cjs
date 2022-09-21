// @ts-check
const { defineConfig } = require('eslint-define-config') // eslint-disable-line

module.exports = defineConfig({
  root: true,
  env: {
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: 'packages/*/tsconfig.json',
      },
    },
  },
  rules: {
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'object',
          'type',
          'index',
        ],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before',
          },
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    // eslint-import-resolver-typescript
    'import/no-unresolved': 'error', // Enable main feature

    // Optional settings
    // for Map
    '@typescript-eslint/no-non-null-assertion': 'off',
    // loosen
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
  },
  overrides: [
    {
      files: '*.cjs',
      extends: ['plugin:n/recommended'],
      rules: {
        'n/no-unsupported-features/es-syntax': 'off', // Required to use import
      },
    },
  ],
})
