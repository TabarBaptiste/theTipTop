// ===========================================
// Tests unitaires - Commande de consentement aux cookies
// ===========================================
// La CNIL exige que le retrait soit aussi simple que l'acceptation. Ces tests
// figent les deux sens, et surtout le rechargement : sans lui, gtag.js reste
// charge en memoire et continue d'emettre apres le retrait — un arret purement
// declaratif.

import { render, screen, fireEvent } from '@testing-library/react';

import { CookiePreferences } from './cookie-preferences';

const mockEtat = jest.fn();
const setAnalytics = jest.fn();
const hydrate = jest.fn();

jest.mock('@/lib/stores/cookie-consent-store', () => ({
  useCookieConsentStore: (selecteur: (etat: unknown) => unknown) => selecteur(mockEtat()),
}));

const mockHydrate = jest.fn(() => true);
jest.mock('@/lib/hooks/use-is-hydrated', () => ({
  useIsHydrated: () => mockHydrate(),
}));

function etat({ hasConsented = true, analytics = false } = {}) {
  mockEtat.mockReturnValue({
    hasConsented,
    preferences: { analytics },
    hydrate,
    setAnalytics,
  });
}

/** Remplace le rechargement, qui n'existe pas dans jsdom. */
function espionnerRechargement() {
  const reload = jest.fn();
  Object.defineProperty(window, 'location', {
    value: { ...window.location, reload },
    writable: true,
  });
  return reload;
}

describe('CookiePreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHydrate.mockReturnValue(true);
  });

  // Afficher « refusé » a quelqu'un ayant accepte serait pire que ne rien
  // afficher : la commande attend donc l'hydratation.
  it('n’affiche pas d’état avant hydratation', () => {
    mockHydrate.mockReturnValue(false);
    etat();
    render(<CookiePreferences />);

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('reflète un consentement accordé', () => {
    etat({ analytics: true });
    render(<CookiePreferences />);

    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByText(/mesure d’audience autorisée/)).toBeInTheDocument();
  });

  it('reflète un consentement refusé', () => {
    etat({ analytics: false });
    render(<CookiePreferences />);

    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.getByText(/mesure d’audience refusée/)).toBeInTheDocument();
  });

  it('enregistre une acceptation sans recharger la page', () => {
    const reload = espionnerRechargement();
    etat({ analytics: false });
    render(<CookiePreferences />);

    fireEvent.click(screen.getByRole('checkbox'));

    expect(setAnalytics).toHaveBeenCalledWith(true);
    // Accepter monte le script par React : aucun rechargement n'est utile.
    expect(reload).not.toHaveBeenCalled();
  });

  // Le coeur de la correction : sans rechargement, l'arret n'est qu'apparent.
  it('recharge la page au retrait, pour arrêter réellement la mesure', () => {
    const reload = espionnerRechargement();
    etat({ analytics: true });
    render(<CookiePreferences />);

    fireEvent.click(screen.getByRole('checkbox'));

    expect(setAnalytics).toHaveBeenCalledWith(false);
    expect(reload).toHaveBeenCalled();
  });

  // La banniere ne s'affiche plus une fois le choix fait : sans cet appel, la
  // page arriverait sur l'etat par defaut.
  it('hydrate le store quand aucun choix n’est connu', () => {
    etat({ hasConsented: false });
    render(<CookiePreferences />);

    expect(hydrate).toHaveBeenCalled();
  });

  it('n’hydrate pas inutilement quand le choix est déjà connu', () => {
    etat({ hasConsented: true });
    render(<CookiePreferences />);

    expect(hydrate).not.toHaveBeenCalled();
  });
});
