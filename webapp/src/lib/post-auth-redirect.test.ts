// ===========================================
// Tests unitaires - Destination de retour apres OAuth
// ===========================================
// Ce module porte une garde de securite : la destination memorisee est
// restituee telle quelle a router.replace. Sans filtrage, une valeur commencant
// par « // » ou par un protocole enverrait l'utilisateur sur un site tiers juste
// apres sa connexion — une redirection ouverte, d'autant plus credible qu'elle
// survient au moment ou il vient de saisir ses identifiants.

import {
  rememberPostAuthDestination,
  consumePostAuthDestination,
} from './post-auth-redirect';

describe('destination de retour', () => {
  beforeEach(() => sessionStorage.clear());

  it('restitue une destination interne memorisee', () => {
    rememberPostAuthDestination('/participate');

    expect(consumePostAuthDestination()).toBe('/participate');
  });

  // Sans effacement, une connexion ulterieure renverrait vers une page demandee
  // lors d'un parcours precedent, sans rapport avec l'intention du moment.
  it('efface la destination apres restitution', () => {
    rememberPostAuthDestination('/participate');
    consumePostAuthDestination();

    expect(consumePostAuthDestination()).toBe('/dashboard');
  });

  it('retombe sur l’espace personnel quand rien n’a ete memorise', () => {
    expect(consumePostAuthDestination()).toBe('/dashboard');
  });

  // Le coeur de la garde. Chacune de ces valeurs sortirait du site.
  it.each([
    ['//evil.example.com', 'double barre, interpretee comme un domaine'],
    ['https://evil.example.com', 'URL absolue'],
    ['http://evil.example.com/phishing', 'URL absolue en clair'],
    ['javascript:alert(1)', 'pseudo-protocole'],
    ['evil.example.com', 'chemin sans barre initiale'],
  ])('refuse %s (%s)', (valeur) => {
    rememberPostAuthDestination(valeur);

    expect(consumePostAuthDestination()).toBe('/dashboard');
  });

  it('accepte un chemin interne comportant une chaine de requete', () => {
    rememberPostAuthDestination('/participate?code=ABCDEFGH23');

    expect(consumePostAuthDestination()).toBe('/participate?code=ABCDEFGH23');
  });

  // Une valeur corrompue ne doit pas faire echouer la connexion : on retombe
  // sur la destination par defaut.
  it('ignore une valeur vide', () => {
    rememberPostAuthDestination('');

    expect(consumePostAuthDestination()).toBe('/dashboard');
  });
});
