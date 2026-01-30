// ===========================================
// Test E2E - Page d'accueil
// ===========================================

describe('Page d\'accueil', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('affiche le titre principal', () => {
    cy.contains('Grand Jeu Concours').should('be.visible');
    cy.contains('Thé Tip Top').should('be.visible');
  });

  it('affiche le compte à rebours', () => {
    cy.get('[class*="countdown"]').should('exist');
  });

  it('affiche les lots à gagner', () => {
    cy.contains('Les lots à gagner').should('be.visible');
    cy.contains('Infuseur à thé').should('be.visible');
    cy.contains('Thé détox').should('be.visible');
    cy.contains('1 an de thé gratuit').should('be.visible');
  });

  it('affiche les étapes de participation', () => {
    cy.contains('Comment participer').should('be.visible');
    cy.contains('Achetez pour 49€').should('be.visible');
    cy.contains('Recevez votre ticket').should('be.visible');
  });

  it('contient les liens de navigation', () => {
    cy.get('header').within(() => {
      cy.contains('Accueil').should('be.visible');
      cy.contains('Comment jouer').should('be.visible');
      cy.contains('Les lots').should('be.visible');
      cy.contains('Règlement').should('be.visible');
    });
  });

  it('affiche les boutons d\'inscription', () => {
    cy.contains('Créer un compte').should('be.visible');
    cy.contains('Participer maintenant').should('be.visible');
  });

  it('redirige vers la page d\'inscription', () => {
    cy.contains('Créer un compte').click();
    cy.url().should('include', '/auth/register');
  });
});
