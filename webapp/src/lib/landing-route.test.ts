// ===========================================
// Tests unitaires - landingRouteFor
// ===========================================

import { landingRouteFor } from './landing-route';

describe('landingRouteFor', () => {
  it('envoie l administrateur sur son back-office', () => {
    expect(landingRouteFor('ADMIN')).toBe('/admin');
  });

  it('envoie l employe sur son espace', () => {
    expect(landingRouteFor('EMPLOYEE')).toBe('/employee');
  });

  it('laisse le client sur son tableau de bord', () => {
    expect(landingRouteFor('CLIENT')).toBe('/dashboard');
  });

  // Repli volontairement prudent : si le role est illisible, mieux vaut la page
  // accessible a tous qu un back-office que le compte n a pas le droit d ouvrir.
  it('retombe sur le tableau de bord quand le role est inconnu', () => {
    expect(landingRouteFor(undefined)).toBe('/dashboard');
  });
});
