// ===========================================
// Tests unitaires - Chargement conditionnel d'Analytics
// ===========================================
// Ce composant décide du dépôt des cookies de mesure d'audience. Une erreur ici
// ne produit aucun symptôme visible : le suivi se déclencherait sans
// consentement, et personne ne s'en apercevrait avant un contrôle.

import { render } from '@testing-library/react';

import { ConditionalAnalytics } from './conditional-analytics';

const mockEtatConsentement = jest.fn();
jest.mock('@/lib/stores/cookie-consent-store', () => ({
  useCookieConsentStore: (selecteur: (etat: unknown) => unknown) =>
    selecteur(mockEtatConsentement()),
}));

// Le composant de Google est remplacé par un marqueur : on vérifie la décision
// de le monter, pas ce qu'il fait.
jest.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => <div data-testid="ga" data-ga-id={gaId} />,
}));

function consentement(hasConsented: boolean, analytics: boolean) {
  mockEtatConsentement.mockReturnValue({ hasConsented, preferences: { analytics } });
}

describe('ConditionalAnalytics', () => {
  beforeEach(() => mockEtatConsentement.mockReset());

  it('ne charge rien tant qu’aucun choix n’a été exprimé', () => {
    consentement(false, false);
    const { queryByTestId } = render(<ConditionalAnalytics gaId="G-TEST" />);

    expect(queryByTestId('ga')).not.toBeInTheDocument();
  });

  // Cas le plus important : le bandeau a été vu, la mesure refusée. Charger
  // Analytics ici serait un dépôt de cookies sans base légale.
  it('ne charge rien quand la mesure d’audience est refusée', () => {
    consentement(true, false);
    const { queryByTestId } = render(<ConditionalAnalytics gaId="G-TEST" />);

    expect(queryByTestId('ga')).not.toBeInTheDocument();
  });

  // Un consentement enregistré mais non exprimé pour cette catégorie ne vaut
  // pas accord : les deux conditions doivent être réunies.
  it('ne charge rien si la préférence est vraie sans consentement exprimé', () => {
    consentement(false, true);
    const { queryByTestId } = render(<ConditionalAnalytics gaId="G-TEST" />);

    expect(queryByTestId('ga')).not.toBeInTheDocument();
  });

  it('charge la mesure d’audience une fois les deux conditions réunies', () => {
    consentement(true, true);
    const { getByTestId } = render(<ConditionalAnalytics gaId="G-TEST" />);

    expect(getByTestId('ga')).toHaveAttribute('data-ga-id', 'G-TEST');
  });
});
