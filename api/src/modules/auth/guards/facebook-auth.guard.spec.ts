// ===========================================
// Tests unitaires - FacebookAuthGuard
// ===========================================

import { ExecutionContext } from '@nestjs/common';
import { FacebookAuthGuard } from './facebook-auth.guard';
import { OAuthMissingEmailError } from '../oauth-missing-email.error';

describe('FacebookAuthGuard', () => {
  const contexte = (erreur: Error) => {
    const response = { redirect: jest.fn() };
    const context = {
      switchToHttp: () => ({
        // La presence de `code` marque le retour de callback.
        getRequest: () => ({ query: { code: 'abc' } }),
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;

    const guard = new FacebookAuthGuard();
    jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockRejectedValue(erreur);

    return { guard, response, context };
  };

  afterEach(() => jest.restoreAllMocks());

  // Le cas le plus courant en pratique : compte Facebook sans adresse
  // confirmee, ou permission email refusee a l ecran d autorisation.
  it('redirige avec une explication quand l adresse manque', async () => {
    const { guard, response, context } = contexte(new OAuthMissingEmailError('Facebook'));

    await expect(guard.canActivate(context)).resolves.toBe(false);

    expect(response.redirect).toHaveBeenCalledWith(
      expect.stringContaining('error=facebook_no_email'),
    );
  });

  // Une panne reseau ou un code expire relevent d un message different : on
  // invite a reessayer, pas a changer de moyen de connexion.
  it('redirige avec l erreur generique pour toute autre panne', async () => {
    const { guard, response, context } = contexte(new Error('token expire'));

    await expect(guard.canActivate(context)).resolves.toBe(false);

    expect(response.redirect).toHaveBeenCalledWith(
      expect.stringContaining('error=facebook_failed'),
    );
    expect(response.redirect).not.toHaveBeenCalledWith(
      expect.stringContaining('facebook_no_email'),
    );
  });
});
