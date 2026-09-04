// ===========================================
// Support E2E Cypress
// ===========================================

/**
 * Ignore les erreurs d'hydratation React - celles-la uniquement.
 *
 * Cypress fait echouer tout test pendant lequel l'application leve une
 * exception, et si cela se produit dans un `beforeEach`, il saute la suite
 * entiere. Une seule erreur d'hydratation faisait ainsi tomber les cinq specs
 * et mettait 63 tests en « skipped », sans qu'aucune assertion soit en cause.
 *
 * Ce qui a ete verifie avant d'en arriver la, sur le build de production :
 *
 * - le HTML servi et le DOM client sont identiques a l'octet pres sur `main`
 *   et `footer` ; la seule difference de structure est le bouton « Connexion »
 *   du header, rendu apres hydratation de facon deliberee ;
 * - aucune imbrication HTML invalide dans le document servi ;
 * - l'erreur ne se produit jamais dans un vrai navigateur, sur ce meme build,
 *   ni en local ni sur la preproduction. Elle n'apparait que sous Cypress.
 *
 * Cypress injecte sa propre balise `<style>` dans le `<head>` du document
 * teste. React 19 hydrate aussi le `<head>` : quand ce noeud surnumeraire
 * arrive avant la fin de l'hydratation, React constate un balisage different
 * de celui qu'il attendait, abandonne et regenere l'arbre cote client. D'ou le
 * caractere intermittent - tout depend de l'instant ou le style est injecte.
 *
 * React se retablit seul et la page reste correcte : c'est une incompatibilite
 * entre le harnais de test et l'hydratation, pas un defaut subi par les
 * visiteurs. Le filtre est donc volontairement etroit : toute autre exception
 * de l'application continue de faire echouer le test.
 */
const ERREUR_HYDRATATION =
  /Minified React error #(418|421|423|425)|Hydration failed|hydrated but some attributes|did not match/i;

Cypress.on('uncaught:exception', (erreur) => {
  // `false` demande a Cypress de ne pas faire echouer le test.
  if (ERREUR_HYDRATATION.test(erreur.message)) {
    return false;
  }
  return true;
});

// Custom commands
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/auth/login`,
    body: { email, password },
  }).then((response) => {
    window.localStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: {
          user: response.body.user,
          accessToken: response.body.accessToken,
          isAuthenticated: true,
        },
      })
    );
    cy.setCookie('refreshToken', response.body.refreshToken);
  });
});

Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('auth-storage');
  cy.clearCookie('refreshToken');
});

// Type declarations
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}

export {};
