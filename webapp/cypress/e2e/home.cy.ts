// ===========================================
// Test E2E - Page d'accueil
// ===========================================

describe('Page d\'accueil', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('affiche le titre principal', () => {
    cy.contains('Bienvenue au jeu-concours').should('be.visible');
    cy.contains('The Tip Top').should('be.visible');
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
    cy.get('header').within(() => {
      cy.contains('Le jeu').should('be.visible');
      cy.contains('Lots').should('be.visible');
      cy.contains('Règlement').should('be.visible');
      cy.contains('FAQ').should('be.visible');
    });
  });

  it('affiche les boutons d\'authentification', () => {
    cy.get('header').contains('Connexion').should('be.visible');
    cy.get('header').contains('Jouer').should('be.visible');
  });

  it('redirige vers la page d\'inscription depuis le CTA du hero', () => {
    cy.contains('Participer maintenant').first().click();
    cy.url().should('include', '/auth/register');
  });

  it('affiche le footer avec les liens légaux', () => {
    cy.get('footer').within(() => {
      cy.contains('Règlement du jeu').should('have.attr', 'href', '/reglement');
      cy.contains('Mentions légales').should('have.attr', 'href', '/mentions-legales');
    });
  });
});
