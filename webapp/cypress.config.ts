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

      /**
       * Récapitule les échecs sur la sortie standard.
       *
       * Le pipeline impose `--reporter junit`, qui n'écrit que le fichier XML :
       * le log Jenkins ne montre alors que le nombre d'échecs et le nom des
       * captures d'écran, jamais le message d'erreur. Diagnostiquer un échec
       * obligeait à rejouer la suite en local.
       *
       * L'option de ligne de commande l'emportant sur ce fichier de
       * configuration, le reporter lui-même ne peut pas être changé d'ici. Ce
       * point d'entrée, lui, s'exécute dans tous les cas : il écrit donc le
       * récapitulatif à la main, en complément du XML.
       */
      on('after:spec', (spec, resultats) => {
        const echecs = (resultats.tests ?? []).filter((test) => test.state === 'failed');
        if (echecs.length === 0) {
          return;
        }

        console.log(`\n=== ${echecs.length} echec(s) dans ${spec.relative} ===`);
        for (const test of echecs) {
          console.log(`  x ${test.title.join(' > ')}`);
          const message = test.displayError ?? test.attempts?.at(-1)?.error?.message ?? '';
          for (const ligne of String(message).split('\n').slice(0, 8)) {
            console.log(`      ${ligne}`);
          }
        }
        console.log('');
      });

      return config;
    },
  },
  env: {
    // Utilisé par la commande cy.login (cypress/support/e2e.ts).
    // Surchargeable : CYPRESS_API_URL=https://... npx cypress run
    API_URL: 'http://localhost:3001/api/v1',
  },
});
