const base = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  plugins: [
    'simple-import-sort',
    'sort-keys-fix',
    'sort-destructure-keys',
    'unused-imports',
  ],
  rules: {
    'simple-import-sort/exports': 'error',
    'sort-destructure-keys/sort-destructure-keys': 'error',
    'sort-keys-fix/sort-keys-fix': 'error',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        vars: 'all',
        varsIgnorePattern: '^_',
      },
    ],
  },
}

const ts = Object.assign({}, base, {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  files: ['*.ts', '*.tsx'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: [].concat(base.plugins, ['@typescript-eslint']),
  rules: Object.assign({}, base.rules, {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/sort-type-union-intersection-members': 'error',
  }),
})

module.exports = Object.assign({}, base, { overrides: [ts] })
