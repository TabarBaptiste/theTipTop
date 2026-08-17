// ===========================================
// Configuration ESLint (flat config, ESLint 9)
// ===========================================
// `next lint` a été supprimé dans Next.js 16 : on invoque ESLint directement
// (scripts npm `lint` / `lint:fix`) avec les presets officiels Next.

import coreWebVitals from 'eslint-config-next/core-web-vitals';

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'cypress/videos/**'],
  },
  ...coreWebVitals,
];
