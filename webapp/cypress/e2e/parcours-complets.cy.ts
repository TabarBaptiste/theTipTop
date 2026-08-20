// ===========================================
// Parcours complets, sans simulation
// ===========================================
// Les autres specs vérifient qu'une page s'affiche et qu'un formulaire valide
// ses champs. Celle-ci vérifie qu'un participant va d'un bout à l'autre : le
// navigateur parle à la vraie API, qui écrit dans la vraie base.
//
// C'est le seul niveau où certaines choses se voient. Les tests fonctionnels
// de l'API couvrent la logique métier ; ils ne peuvent rien dire du rendu
// serveur de Next, de l'hydratation, du store de session ni des redirections
// côté client - précisément là où plusieurs défauts sont apparus.
//
// Aucun `cy.intercept` ici, volontairement : une réponse simulée ne prouve
// jamais que le front et le back s'accordent.
//
// CE QUE CES TESTS MODIFIENT, sur l'environnement qu'ils visent :
//
// - la fenêtre de jeu est déplacée le temps de la suite, puis remise en place
//   dans un `after` qui s'exécute même après un échec ;
// - un à deux codes sont réellement consommés par exécution, pris dans le
//   stock par l'API d'administration. C'est le propre d'un test de bout en
//   bout : un code simulé ne prouverait rien ;
// - un compte est créé puis supprimé.
//
// Ils visent donc un environnement de test aux données représentatives, jamais
// la production. Le parcours sans compte (UC-05) n'y figure pas : son code de
// vérification arrive par email, hors de portée du navigateur. Il est couvert
// de bout en bout par les tests fonctionnels de l'API.

const API = Cypress.env('API_URL');

/** Un identifiant unique par exécution, pour ne rien heurter et tout retrouver. */
const MARQUEUR = `cy${Date.now()}`;

/**
 * Délai laissé à une page pour devenir interactive.
 *
 * Les formulaires restent volontairement désactivés tant que la page n'est pas
 * hydratée : non hydraté, un formulaire part en GET et recopie ses champs -
 * dont le mot de passe - dans l'URL. Attendre cet état fait donc partie du
 * parcours, ce n'est pas un contournement.
 *
 * La valeur est large parce qu'en développement le serveur compile chaque
 * route à la première visite ; en production, l'hydratation est immédiate.
 */
const HYDRATATION = 30000;

interface Fenetre {
  startDate: string;
  endDate: string;
  claimEndDate: string;
}

describe('Parcours complets', () => {
  let jetonAdmin: string;
  let fenetreInitiale: Fenetre;

  /** Ouvre une session par l'API, pour les manipulations hors navigateur. */
  function connexionApi(email: string, password: string) {
    return cy
      .request('POST', `${API}/auth/login`, { email, password })
      .then((r) => r.body.accessToken as string);
  }

  /** Déplace la fenêtre de jeu. Le service refuse un triplet incohérent. */
  function definirFenetre(fenetre: Fenetre) {
    return cy.request({
      method: 'PATCH',
      url: `${API}/game/config`,
      headers: { Authorization: `Bearer ${jetonAdmin}` },
      body: fenetre,
    });
  }

  const jours = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();

  /**
   * Se connecte par le formulaire, comme le ferait un participant.
   *
   * Le bouton reste désactivé tant que la page n'est pas hydratée - un
   * formulaire non hydraté partirait en GET et recopierait le mot de passe
   * dans l'URL. Il faut donc attendre qu'il s'active plutôt que de cliquer
   * aussitôt : en développement, la compilation à la demande repousse
   * l'hydratation bien au-delà des quatre secondes par défaut.
   */
  function connexionNavigateur(email: string, motDePasse: string) {
    cy.visit('/auth/login');
    cy.get('#email', { timeout: HYDRATATION }).type(email);
    cy.get('#password').type(motDePasse);
    // Le délai porte sur la commande : `should` seul retomberait sur le délai
    // par défaut, quatre secondes, très en deçà de ce que met la compilation.
    cy.contains('button', 'Se connecter', { timeout: HYDRATATION })
      .should('not.be.disabled')
      .click();

    // Attendre la redirection ici plutôt que dans chaque test : tant qu'elle
    // n'a pas eu lieu, la session n'est pas établie.
    cy.location('pathname', { timeout: HYDRATATION }).should('not.include', '/auth/login');
  }

  /** Un code réellement jouable, pris dans le stock par l'API d'administration. */
  function codeDuStock() {
    return cy
      .request({
        url: `${API}/tickets/available?count=1`,
        headers: { Authorization: `Bearer ${jetonAdmin}` },
      })
      .then((r) => {
        expect(r.body.codes, 'le stock doit contenir au moins un code jouable').to.have.length(1);
        return r.body.codes[0] as string;
      });
  }

  before(() => {
    connexionApi('admin@thetiptop.fr', 'Test1234!').then((jeton) => {
      jetonAdmin = jeton;

      // La configuration est partagée avec l'environnement de développement :
      // on la relève pour pouvoir la remettre en place ensuite.
      cy.request(`${API}/game/config`).then((r) => {
        fenetreInitiale = {
          startDate: r.body.startDate,
          endDate: r.body.endDate,
          claimEndDate: r.body.claimEndDate,
        };
      });
    });
  });

  after(() => {
    // S'exécute même après un échec : sans quoi le jeu resterait ouvert ou
    // fermé à tort sur l'environnement de développement.
    if (fenetreInitiale) {
      definirFenetre(fenetreInitiale);
    }
  });

  // ===========================================
  // UC-06 - Participer depuis son espace personnel
  // ===========================================
  describe('Participation, de la connexion au lot', () => {
    let code: string;

    beforeEach(() => {
      definirFenetre({ startDate: jours(-1), endDate: jours(1), claimEndDate: jours(30) });

      // Un vrai code, pris dans le stock par l'API d'administration. Il sera
      // réellement consommé : c'est le propre d'un test de bout en bout, et
      // c'est aussi pourquoi il n'en prend qu'un.
      codeDuStock().then((c) => {
        code = c;
      });
    });

    it('mene de la connexion a l affichage du lot, et consomme le ticket', () => {
      // --- Connexion par le formulaire, pas par injection de session ---
      connexionNavigateur('client@test.fr', 'Test1234!');
      cy.location('pathname').should('include', '/dashboard');

      // --- Saisie du code ---
      cy.visit('/dashboard/participate');
      cy.get('#code', { timeout: HYDRATATION }).type(code);
      cy.contains('button', 'Valider mon code', { timeout: HYDRATATION })
        .should('not.be.disabled')
        .click();

      // --- Le lot s'affiche ---
      cy.contains('Félicitations', { timeout: HYDRATATION }).should('be.visible');
      cy.contains('Vous avez gagné').should('be.visible');

      // --- Et il a bien été enregistré côté serveur ---
      // C'est ce que ne dirait aucune réponse simulée : l'écran pourrait
      // afficher un gain sans que rien ne soit écrit.
      cy.request({
        url: `${API}/participations/by-code/${code}`,
        headers: { Authorization: `Bearer ${jetonAdmin}` },
      }).then((r) => {
        expect(r.status).to.eq(200);
        expect(r.body.ticket.isUsed, 'le ticket doit etre consomme').to.be.true;
        expect(r.body.participation, 'une participation doit exister').to.not.be.null;
        expect(r.body.participation.user.email).to.eq('client@test.fr');
      });
    });

    it('refuse un code deja consomme', () => {
      // Le code est consommé par l'API, puis rejoué dans le navigateur.
      connexionApi('client@test.fr', 'Test1234!').then((jetonClient) => {
        cy.request({
          method: 'POST',
          url: `${API}/participations`,
          headers: { Authorization: `Bearer ${jetonClient}` },
          body: { code },
        });
      });

      connexionNavigateur('client@test.fr', 'Test1234!');

      cy.visit('/dashboard/participate');
      cy.get('#code', { timeout: HYDRATATION }).type(code);
      cy.contains('button', 'Valider mon code', { timeout: HYDRATATION })
        .should('not.be.disabled')
        .click();

      cy.contains(/d[ée]j[àa] [ée]t[ée] utilis/i, { timeout: HYDRATATION }).should('be.visible');
      cy.contains('Félicitations').should('not.exist');
    });
  });

  // ===========================================
  // Fenêtre de jeu
  // ===========================================
  describe('Hors periode de jeu', () => {
    it('refuse une participation avant l ouverture', () => {
      definirFenetre({ startDate: jours(10), endDate: jours(20), claimEndDate: jours(50) });

      codeDuStock().then((code) => {

        connexionNavigateur('client@test.fr', 'Test1234!');

        cy.visit('/dashboard/participate');
        cy.get('#code', { timeout: HYDRATATION }).type(code);
        cy.contains('button', 'Valider mon code', { timeout: HYDRATATION })
        .should('not.be.disabled')
        .click();

        cy.contains(/pas encore commenc/i, { timeout: HYDRATATION }).should('be.visible');

        // Le ticket doit rester jouable : un refus ne consomme rien.
        cy.request({
          method: 'POST',
          url: `${API}/tickets/verify`,
          body: { code },
          failOnStatusCode: false,
        }).then((verif) => {
          expect(verif.body.error).to.match(/pas encore commenc/i);
        });
      });
    });
  });

  // ===========================================
  // UC-01 / UC-02 - Créer un compte et s'en servir
  // ===========================================
  describe('Inscription puis espace personnel', () => {
    const email = `${MARQUEUR}@simulation.invalid`;
    const motDePasse = 'Motdepasse1!';
    let idCree: string;

    after(() => {
      // Le compte créé est supprimé : une suite qui laisse des comptes
      // derrière elle pollue les statistiques de l'opération.
      if (idCree) {
        cy.request({
          method: 'DELETE',
          url: `${API}/users/${idCree}`,
          headers: { Authorization: `Bearer ${jetonAdmin}` },
          failOnStatusCode: false,
        });
      }
    });

    it('cree un compte depuis le formulaire et ouvre la session', () => {
      cy.visit('/auth/register');

      cy.get('#firstName', { timeout: HYDRATATION }).type('Camille');
      cy.get('#lastName').type('Martin');
      cy.get('#email').type(email);
      cy.get('#password').type(motDePasse);
      cy.get('#confirmPassword').type(motDePasse);
      cy.get('#birthDate').type('1990-05-15');
      cy.get('#consentData').check({ force: true });

      cy.contains('button', /cr[ée]er mon compte|s.inscrire/i, { timeout: HYDRATATION })
        .should('not.be.disabled')
        .click();

      // La session s'ouvre directement : c'est ce qui évite une seconde saisie.
      cy.location('pathname', { timeout: HYDRATATION }).should('include', '/dashboard');

      cy.request({
        url: `${API}/users?search=${encodeURIComponent(email)}`,
        headers: { Authorization: `Bearer ${jetonAdmin}` },
        failOnStatusCode: false,
      }).then((r) => {
        const liste = Array.isArray(r.body) ? r.body : r.body.data;
        const compte = liste?.find((u: { email: string }) => u.email === email);
        expect(compte, 'le compte doit exister en base').to.exist;
        idCree = compte.id;
      });
    });
  });

  // ===========================================
  // Cloisonnement du back-office
  // ===========================================
  describe('Cloisonnement des roles', () => {
    it('ne laisse pas un client atteindre l espace employe', () => {
      connexionNavigateur('client@test.fr', 'Test1234!');

      cy.visit('/employee', { failOnStatusCode: false });

      // Le middleware lit le role dans le cookie et renvoie ailleurs.
      cy.location('pathname', { timeout: HYDRATATION }).should('not.include', '/employee');

      // Et l'interface de remise des lots - qui existe reellement sur cette
      // page - n'apparait pas. Sans cette seconde assertion, le test passerait
      // aussi si la page etait simplement vide.
      cy.contains(/remise du lot|Espace Employ/i).should('not.exist');
    });

    it('ouvre l espace employe a un employe', () => {
      connexionNavigateur('employe@thetiptop.fr', 'Test1234!');
      cy.location('pathname').should('include', '/employee');
    });
  });
});
