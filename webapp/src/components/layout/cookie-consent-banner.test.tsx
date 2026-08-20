// ===========================================
// Tests unitaires - Bandeau de consentement
// ===========================================
// Premier ecran vu par tout visiteur. Deux exigences CNIL s'y jouent : refuser
// doit etre aussi accessible qu'accepter, et le bandeau ne doit pas reapparaitre
// une fois le choix exprime.

import { render, screen, fireEvent } from '@testing-library/react';

import { CookieConsentBanner } from './cookie-consent-banner';

const mockEtat = jest.fn();
const hydrate = jest.fn();
const acceptAll = jest.fn();
const rejectAll = jest.fn();

jest.mock('@/lib/stores/cookie-consent-store', () => ({
  useCookieConsentStore: (selecteur: (etat: unknown) => unknown) => selecteur(mockEtat()),
}));

function etat(isBannerOpen: boolean) {
  mockEtat.mockReturnValue({ isBannerOpen, hydrate, acceptAll, rejectAll });
}

describe('CookieConsentBanner', () => {
  beforeEach(() => jest.clearAllMocks());

  // Le choix precedent vit dans un cookie : sans cette lecture au montage, le
  // bandeau redemanderait un consentement deja exprime a chaque visite.
  it('lit le choix précédent au montage', () => {
    etat(false);
    render(<CookieConsentBanner />);

    expect(hydrate).toHaveBeenCalled();
  });

  it('ne s’affiche pas quand un choix a déjà été exprimé', () => {
    etat(false);
    const { container } = render(<CookieConsentBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  // Exigence CNIL : refuser doit demander le meme effort qu'accepter. Les deux
  // commandes sont donc au meme niveau, sans en cacher une derriere un menu.
  it('propose accepter et refuser au même niveau', () => {
    etat(true);
    render(<CookieConsentBanner />);

    expect(screen.getByRole('button', { name: /tout accepter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tout refuser/i })).toBeInTheDocument();
  });

  it('enregistre une acceptation', () => {
    etat(true);
    render(<CookieConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /tout accepter/i }));

    expect(acceptAll).toHaveBeenCalled();
    expect(rejectAll).not.toHaveBeenCalled();
  });

  it('enregistre un refus', () => {
    etat(true);
    render(<CookieConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /tout refuser/i }));

    expect(rejectAll).toHaveBeenCalled();
    expect(acceptAll).not.toHaveBeenCalled();
  });

  // Le bandeau doit renvoyer vers la page ou le choix se revise, faute de quoi
  // le retrait promis serait introuvable.
  it('renvoie vers la page de gestion des cookies', () => {
    etat(true);
    render(<CookieConsentBanner />);

    expect(screen.getByRole('link', { name: /gestion des cookies/i })).toHaveAttribute(
      'href',
      '/gestion-cookies',
    );
  });
});
