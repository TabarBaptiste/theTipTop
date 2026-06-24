import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
  },
  env: {
    // Utilisé par la commande cy.login (cypress/support/e2e.ts).
    // Surchargeable : CYPRESS_API_URL=https://... npx cypress run
    API_URL: 'http://localhost:3001/api/v1',
  },
});
