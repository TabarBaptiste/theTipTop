// ===========================================
// Test E2E - Participation au jeu
// ===========================================

describe('Participation au jeu-concours', () => {
  beforeEach(() => {
    // Se connecter avant chaque test
    cy.login('test@example.com', 'Password123');
    cy.visit('/dashboard/participate');
  });

  it('affiche le formulaire de participation', () => {
    cy.contains('Participer au jeu-concours').should('be.visible');
    cy.get('input[name="code"]').should('be.visible');
    cy.contains('Valider mon code').should('be.visible');
  });

  it('affiche l\'aide pour trouver le code', () => {
    cy.contains('Où trouver mon code').should('be.visible');
    cy.contains('ticket de caisse').should('be.visible');
  });

  it('valide le format du code', () => {
    cy.get('input[name="code"]').type('ABC');
    cy.contains('Valider mon code').click();
    cy.contains('Le code doit contenir exactement 10 caractères').should('be.visible');
  });

  it('convertit le code en majuscules', () => {
    cy.get('input[name="code"]').type('abcdefghij');
    cy.get('input[name="code"]').should('have.value', 'ABCDEFGHIJ');
  });

  it('affiche une erreur pour un code invalide', () => {
    cy.intercept('POST', '**/participations', {
      statusCode: 404,
      body: { message: 'Code non trouvé' },
    });

    cy.get('input[name="code"]').type('INVALIDCOD');
    cy.contains('Valider mon code').click();
    cy.contains('Code non trouvé').should('be.visible');
  });

  it('affiche une erreur pour un code déjà utilisé', () => {
    cy.intercept('POST', '**/participations', {
      statusCode: 400,
      body: { message: 'Ce code a déjà été utilisé' },
    });

    cy.get('input[name="code"]').type('USEDCODE12');
    cy.contains('Valider mon code').click();
    cy.contains('Ce code a déjà été utilisé').should('be.visible');
  });

  it('affiche le résultat gagnant', () => {
    cy.intercept('POST', '**/participations', {
      statusCode: 201,
      body: {
        participation: {
          id: '1',
          ticket: {
            code: 'VALIDCODE1',
            prizeType: 'INFUSER',
          },
        },
      },
    });

    cy.get('input[name="code"]').type('VALIDCODE1');
    cy.contains('Valider mon code').click();
    
    // Vérifier l'écran de félicitations
    cy.contains('Félicitations').should('be.visible');
    cy.contains('Infuseur à thé').should('be.visible');
    cy.contains('15€').should('be.visible');
    cy.contains('tirage au sort').should('be.visible');
  });

  it('permet de saisir un nouveau code après victoire', () => {
    cy.intercept('POST', '**/participations', {
      statusCode: 201,
      body: {
        participation: {
          id: '1',
          ticket: {
            code: 'VALIDCODE1',
            prizeType: 'INFUSER',
          },
        },
      },
    });

    cy.get('input[name="code"]').type('VALIDCODE1');
    cy.contains('Valider mon code').click();
    cy.contains('Félicitations').should('be.visible');
    
    cy.contains('Nouveau code').click();
    cy.get('input[name="code"]').should('be.visible');
  });
});
