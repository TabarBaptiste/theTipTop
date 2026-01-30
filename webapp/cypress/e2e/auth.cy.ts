// ===========================================
// Test E2E - Authentification
// ===========================================

describe('Authentification', () => {
  describe('Inscription', () => {
    beforeEach(() => {
      cy.visit('/auth/register');
    });

    it('affiche le formulaire d\'inscription', () => {
      cy.get('input[name="firstName"]').should('be.visible');
      cy.get('input[name="lastName"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="confirmPassword"]').should('be.visible');
    });

    it('affiche les boutons OAuth', () => {
      cy.contains('Google').should('be.visible');
      cy.contains('Facebook').should('be.visible');
    });

    it('valide les champs obligatoires', () => {
      cy.get('button[type="submit"]').click();
      cy.contains('Le prénom doit faire au moins 2 caractères').should('be.visible');
    });

    it('valide le format email', () => {
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('button[type="submit"]').click();
      cy.contains('Email invalide').should('be.visible');
    });

    it('valide le mot de passe', () => {
      cy.get('input[name="password"]').type('weak');
      cy.get('button[type="submit"]').click();
      cy.contains('Le mot de passe doit faire au moins 8 caractères').should('be.visible');
    });

    it('vérifie la correspondance des mots de passe', () => {
      cy.get('input[name="password"]').type('Password123');
      cy.get('input[name="confirmPassword"]').type('DifferentPass123');
      cy.get('button[type="submit"]').click();
      cy.contains('Les mots de passe ne correspondent pas').should('be.visible');
    });

    it('requiert l\'acceptation des CGU', () => {
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('Password123');
      cy.get('input[name="confirmPassword"]').type('Password123');
      cy.get('button[type="submit"]').click();
      cy.contains('Vous devez accepter les conditions').should('be.visible');
    });
  });

  describe('Connexion', () => {
    beforeEach(() => {
      cy.visit('/auth/login');
    });

    it('affiche le formulaire de connexion', () => {
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').contains('Se connecter').should('be.visible');
    });

    it('affiche les boutons OAuth', () => {
      cy.contains('Continuer avec Google').should('be.visible');
      cy.contains('Continuer avec Facebook').should('be.visible');
    });

    it('affiche le lien mot de passe oublié', () => {
      cy.contains('Mot de passe oublié').should('be.visible');
    });

    it('affiche le lien vers l\'inscription', () => {
      cy.contains('Pas encore de compte').should('be.visible');
      cy.contains('S\'inscrire').should('be.visible');
    });

    it('valide les champs obligatoires', () => {
      cy.get('button[type="submit"]').click();
      cy.contains('Email invalide').should('be.visible');
    });
  });
});
