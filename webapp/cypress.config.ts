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

    /**
     * Déduit l'adresse de l'API du front visé.
     *
     * Le pipeline ne transmet que `baseUrl` : la commande d'exécution vient de
     * la bibliothèque partagée, qui n'expose pas de moyen de passer une
     * variable d'environnement. Sans cette déduction, `API_URL` resterait sur
     * localhost et toute requête directe à l'API échouerait depuis le
     * conteneur Cypress - ce qui faisait tomber les hooks d'ouverture de deux
     * suites, et non leurs assertions.
     *
     * Le nommage des environnements déployés est régulier : le front
     * `thetiptop-<env>` a pour API `thetiptop-api-<env>`, sur le même domaine.
     */
    setupNodeEvents(on, config) {
      const base = config.baseUrl || '';

      // Une valeur explicite l'emporte toujours, et le développement local
      // garde sa cible par défaut.
      if (!process.env.CYPRESS_API_URL && base && !base.includes('localhost')) {
        const cible = new URL(base);
        cible.hostname = cible.hostname.replace(/^thetiptop-/, 'thetiptop-api-');
        config.env.API_URL = `${cible.origin}/api/v1`;
      }

      return config;
    },
  },
  env: {
    // Utilisé par la commande cy.login (cypress/support/e2e.ts).
    // Surchargeable : CYPRESS_API_URL=https://... npx cypress run
    API_URL: 'http://localhost:3001/api/v1',
  },
});
