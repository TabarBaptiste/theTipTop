// ===========================================
// Support E2E Cypress
// ===========================================

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
