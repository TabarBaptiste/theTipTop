// ===========================================
// Test E2E - Page d'accueil
// ===========================================

describe('Page d\'accueil', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('affiche le titre principal', () => {
    // Le titre porte l'argument différenciant, pas une formule de bienvenue :
    // c'est ce qui remonte dans les résultats de recherche.
    //
    // Le titre sépare « 100 » de « % » par une espace insécable, sans quoi la
    // ligne se coupe entre les deux. Elle est normalisée avant comparaison :
    // cette espace relève de la typographie et non du contenu, et l'écrire
    // littéralement dans le spec y glisserait un caractère invisible que la
    // relecture ne distingue pas d'une espace ordinaire.
    cy.get('h1').should(($titre) => {
      const texte = $titre.text().replace(/\u00a0/g, ' ');
      expect(texte).to.contain('Jeu-concours');
      expect(texte).to.contain('100 % des tickets gagnants');
    });
  });

  it('affiche le bandeau de temps restant (ou de fin de jeu)', () => {
    cy.contains(/Temps restant pour participer|jeu-concours est termine/).should('exist');
  });

  it('affiche la section des lots à gagner', () => {
    cy.contains('Les lots à gagner').should('be.visible');
    cy.contains('100% des tickets sont gagnants').should('be.visible');
  });

  it('affiche les étapes de participation', () => {
    cy.contains('Comment participer ?').should('be.visible');
    cy.contains('Trouve ton code').should('be.visible');
    cy.contains('Saisis ton code').should('be.visible');
    cy.contains('Récupère ton lot').should('be.visible');
  });

  it('contient les liens de navigation', () => {
    // La navigation publique ne porte que du contenu accessible à tous : les
    // destinations personnelles se rangent sous le contrôle de compte.
    cy.get('header').within(() => {
      cy.contains('Le jeu').should('be.visible');
      cy.contains('Lots').should('be.visible');
      cy.contains('Règlement').should('be.visible');
      cy.contains('FAQ').should('be.visible');
    });
  });

  it('affiche les boutons d\'authentification', () => {
    cy.get('header').contains('Participer').should('be.visible');

    // Délai allongé : ce bouton n'apparaît qu'une fois la page hydratée, et la
    // compilation à la demande du serveur de développement repousse
    // l'hydratation bien au-delà du délai par défaut. En production, où les
    // bundles sont précompilés, elle est immédiate.
    cy.get('header').contains('Connexion', { timeout: 30000 }).should('be.visible');
  });

  it('mene au parcours de participation depuis le CTA du hero', () => {
    // Le CTA ouvre le tunnel sans compte : exiger une inscription avant même
    // d'avoir saisi son code ajouterait une friction que le parcours évite.
    cy.contains('Participer maintenant').first().click();

    // Délai allongé : la navigation passe par le routeur client, qui attend la
    // compilation de la route côté serveur en développement.
    cy.url({ timeout: 30000 }).should('include', '/participate');
  });

  it('affiche le footer avec les liens légaux', () => {
    cy.get('footer').within(() => {
      cy.contains('Règlement du jeu').should('have.attr', 'href', '/reglement');
      cy.contains('Mentions légales').should('have.attr', 'href', '/mentions-legales');
    });
  });
});
