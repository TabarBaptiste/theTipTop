// ===========================================
// Test E2E - Participation au jeu
// ===========================================

describe('Participation au jeu-concours', () => {
  beforeEach(() => {
    // Compte client créé par le seed (prisma/seed.ts)
    cy.login('client@test.fr', 'Test1234!');
    cy.visit('/dashboard/participate');
  });

  it('affiche le formulaire de participation', () => {
    cy.contains('Participez et gagnez').should('be.visible');
    cy.contains('Soumettre votre code').should('be.visible');
    cy.get('input[name="code"]').should('be.visible');
    cy.contains('Valider mon code').should('be.visible');
  });

  it('affiche l\'aide pour trouver le code', () => {
    cy.contains('ticket de caisse').should('be.visible');
    cy.contains('49€').should('be.visible');
  });

  it('valide le format du code', () => {
    cy.get('input[name="code"]').type('ABC');
    cy.contains('Valider mon code').click();
    cy.contains('Le code doit contenir exactement 10 caracteres').should('be.visible');
  });

  it('convertit le code en majuscules', () => {
    cy.get('input[name="code"]').type('abcdefghij');
    cy.get('input[name="code"]').should('have.value', 'ABCDEFGHIJ');
  });

  it('affiche une erreur pour un code invalide ou déjà utilisé', () => {
    cy.intercept('POST', '**/participations', {
      statusCode: 400,
      body: { message: 'Code invalide' },
    });

    cy.get('input[name="code"]').type('INVALIDC0D');
    cy.contains('Valider mon code').click();
    cy.contains('Code invalide ou deja utilise').should('be.visible');
  });

  it('affiche le résultat gagnant', () => {
    cy.intercept('POST', '**/participations', {
      statusCode: 201,
      body: {
        id: 'participation-1',
        code: 'VALIDC0DE1',
        prizeType: 'INFUSER',
        prize: {
          name: 'Infuseur à thé',
          description: 'Un élégant infuseur à thé',
          value: '12€',
        },
        participatedAt: new Date().toISOString(),
        prizeDelivered: false,
      },
    });

    cy.get('input[name="code"]').type('VALIDC0DE1');
    cy.contains('Valider mon code').click();

    // Écran de félicitations
    cy.contains('Felicitations').should('be.visible');
    cy.contains('Infuseur à thé').should('be.visible');
    cy.contains('12€').should('be.visible');
    cy.contains('tirage au sort').should('be.visible');
  });

  it('permet de saisir un nouveau code après victoire', () => {
    cy.intercept('POST', '**/participations', {
      statusCode: 201,
      body: {
        id: 'participation-1',
        code: 'VALIDC0DE1',
        prizeType: 'INFUSER',
        prize: { name: 'Infuseur à thé', description: '', value: '12€' },
        participatedAt: new Date().toISOString(),
        prizeDelivered: false,
      },
    });

    cy.get('input[name="code"]').type('VALIDC0DE1');
    cy.contains('Valider mon code').click();
    cy.contains('Felicitations').should('be.visible');

    cy.contains('Nouveau code').click();
    cy.get('input[name="code"]').should('be.visible');
  });

  it('affiche la répartition des lots', () => {
    cy.contains('Repartition des lots').should('be.visible');
    cy.contains('500 000 tickets').should('be.visible');
  });
});
