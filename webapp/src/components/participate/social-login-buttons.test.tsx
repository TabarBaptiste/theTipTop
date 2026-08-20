// ===========================================
// Tests unitaires - Boutons de connexion tierce
// ===========================================
// Ces boutons quittent l'application pour le fournisseur. Ce qui compte n'est
// pas leur apparence mais ce qu'ils memorisent avant de partir : sans la
// destination de retour, l'utilisateur revient sur l'espace personnel au lieu
// de la page ou il saisissait son code, et perd sa saisie.

import { render, screen, fireEvent } from '@testing-library/react';

import { SocialLoginButtons } from './social-login-buttons';

const rememberPostAuthDestination = jest.fn();
jest.mock('@/lib/post-auth-redirect', () => ({
  rememberPostAuthDestination: (chemin: string) => rememberPostAuthDestination(chemin),
}));

/** window.location.href n'est pas assignable dans jsdom sans ce remplacement. */
function espionnerNavigation() {
  const cible = { href: '' };
  Object.defineProperty(window, 'location', { value: cible, writable: true });
  return cible;
}

describe('SocialLoginButtons', () => {
  beforeEach(() => jest.clearAllMocks());

  it('propose les deux fournisseurs', () => {
    render(<SocialLoginButtons returnTo="/participate" />);

    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /facebook/i })).toBeInTheDocument();
  });

  it.each([
    ['google', /google/i],
    ['facebook', /facebook/i],
  ])('mémorise la destination avant de partir chez %s', (fournisseur, motif) => {
    const navigation = espionnerNavigation();
    render(<SocialLoginButtons returnTo="/participate" />);

    fireEvent.click(screen.getByRole('button', { name: motif }));

    expect(rememberPostAuthDestination).toHaveBeenCalledWith('/participate');
    expect(navigation.href).toContain(`/auth/${fournisseur}`);
  });

  // Le code deja saisi est sauvegarde par l'appelant juste avant le depart :
  // sans cet appel, l'utilisateur devrait le retaper au retour.
  it('laisse l’appelant sauvegarder son état avant la redirection', () => {
    const avantRedirection = jest.fn();
    espionnerNavigation();
    render(<SocialLoginButtons returnTo="/participate" onBeforeRedirect={avantRedirection} />);

    fireEvent.click(screen.getByRole('button', { name: /google/i }));

    expect(avantRedirection).toHaveBeenCalled();
  });

  it('mémorise la destination réellement demandée', () => {
    espionnerNavigation();
    render(<SocialLoginButtons returnTo="/dashboard" />);

    fireEvent.click(screen.getByRole('button', { name: /facebook/i }));

    expect(rememberPostAuthDestination).toHaveBeenCalledWith('/dashboard');
  });
});
