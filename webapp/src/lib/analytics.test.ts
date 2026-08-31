// ===========================================
// Tests unitaires - Plan de marquage
// ===========================================
// Les noms d'evenements sont un contrat avec Google Analytics : les tableaux de
// bord, les objectifs de conversion et les rapports du cahier des charges s'y
// referent. En renommer un ne casse rien visiblement - la mesure s'arrete
// simplement, et l'historique devient incomparable.

import {
  trackLoginSuccess,
  trackLoginFailure,
  trackRegisterSuccess,
  trackRegisterFailure,
  trackParticipateSubmit,
  trackParticipateSuccess,
  trackParticipateFailure,
  trackCTAClick,
} from './analytics';

const envoyer = jest.fn();
jest.mock('@next/third-parties/google', () => ({
  sendGAEvent: (...args: unknown[]) => envoyer(...args),
}));

describe('plan de marquage', () => {
  beforeEach(() => jest.clearAllMocks());

  // login et sign_up sont des noms reserves par Google Analytics : ils
  // alimentent des rapports predefinis. Les renommer les en sortirait.
  it('emet les evenements normalises de Google pour l’authentification', () => {
    trackLoginSuccess('google');
    trackRegisterSuccess('email');

    expect(envoyer).toHaveBeenNthCalledWith(1, 'event', 'login', { method: 'google' });
    expect(envoyer).toHaveBeenNthCalledWith(2, 'event', 'sign_up', { method: 'email' });
  });

  it('distingue les echecs et en transmet la cause', () => {
    trackLoginFailure('email', 'invalid_credentials');
    trackRegisterFailure('facebook', 'email_already_exists');

    expect(envoyer).toHaveBeenNthCalledWith(1, 'event', 'login_failure', {
      method: 'email',
      reason: 'invalid_credentials',
    });
    expect(envoyer).toHaveBeenNthCalledWith(2, 'event', 'sign_up_failure', {
      method: 'facebook',
      reason: 'email_already_exists',
    });
  });

  // Le tunnel se mesure en trois temps : tentative, succes, echec. Sans les
  // trois, impossible de calculer un taux d'abandon.
  it('couvre les trois etapes du tunnel de participation', () => {
    trackParticipateSubmit();
    trackParticipateSuccess('INFUSER', '0');
    trackParticipateFailure('code_already_used');

    expect(envoyer).toHaveBeenNthCalledWith(1, 'event', 'participate_submit');
    expect(envoyer).toHaveBeenNthCalledWith(2, 'event', 'participate_success', {
      prize_type: 'INFUSER',
      prize_value: '0',
    });
    expect(envoyer).toHaveBeenNthCalledWith(3, 'event', 'participate_failure', {
      reason: 'code_already_used',
    });
  });

  it('situe chaque clic d’appel a l’action', () => {
    trackCTAClick('Participer', 'hero');

    expect(envoyer).toHaveBeenCalledWith('event', 'cta_click', {
      label: 'Participer',
      location: 'hero',
    });
  });
});
