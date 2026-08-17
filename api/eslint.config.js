// ===========================================
// Configuration ESLint (flat config, ESLint 9)
// ===========================================
// Alignée sur l'ancienne .eslintrc.js ; le format flat est requis pour
// partager ESLint 9 avec la webapp dans le monorepo (hoisting npm workspaces).

const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'eslint.config.js', 'prisma/**'],
  },
  ...tsPlugin.configs['flat/recommended'],
  prettierRecommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
