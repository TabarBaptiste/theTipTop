import Cookies from 'js-cookie';

import { useCookieConsentStore, removeAnalyticsCookies } from './cookie-consent-store';

/** Efface tout, y compris le cookie de consentement, entre deux cas. */
function viderLesCookies() {
  for (const nom of Object.keys(Cookies.get())) {
    Cookies.remove(nom);
  }
}

describe('consentement aux cookies', () => {
  beforeEach(() => {
    viderLesCookies();
    useCookieConsentStore.setState({
      hasConsented: false,
      isBannerOpen: false,
      preferences: { analytics: false },
    });
  });

  describe('acceptation', () => {
    it('mémorise le choix dans un cookie', () => {
      useCookieConsentStore.getState().acceptAll();

      expect(useCookieConsentStore.getState().preferences.analytics).toBe(true);
      expect(JSON.parse(Cookies.get('cookie_consent') as string)).toEqual({ analytics: true });
    });
  });

  describe('retrait', () => {
    // Le coeur de cette correction : la page de gestion promettait un retour en
    // arriere qui n'existait pas.
    it('permet de revenir sur une acceptation', () => {
      useCookieConsentStore.getState().acceptAll();
      useCookieConsentStore.getState().setAnalytics(false);

      expect(useCookieConsentStore.getState().preferences.analytics).toBe(false);
      expect(JSON.parse(Cookies.get('cookie_consent') as string)).toEqual({ analytics: false });
    });

    // Cesser d'emettre ne suffit pas : l'identifiant qui permet de reconnaitre
    // le visiteur doit disparaitre de sa machine.
    it('supprime les cookies de mesure d’audience déjà déposés', () => {
      Cookies.set('_ga', 'GA1.1.123456789.1700000000');
      Cookies.set('_ga_ABC123', 'GS1.1.1700000000');
      Cookies.set('_gid', 'GA1.1.987654321');

      useCookieConsentStore.getState().setAnalytics(false);

      expect(Cookies.get('_ga')).toBeUndefined();
      expect(Cookies.get('_ga_ABC123')).toBeUndefined();
      expect(Cookies.get('_gid')).toBeUndefined();
    });

    it('épargne les cookies étrangers à la mesure d’audience', () => {
      Cookies.set('_ga', 'GA1.1.123');
      Cookies.set('panier', 'trois-thes');

      removeAnalyticsCookies();

      expect(Cookies.get('_ga')).toBeUndefined();
      expect(Cookies.get('panier')).toBe('trois-thes');
    });

    // Le cookie de consentement lui-meme est necessaire au fonctionnement du
    // site : le supprimer ferait reapparaitre le bandeau a chaque page, et
    // redemander un choix deja exprime.
    it('conserve le cookie de consentement', () => {
      useCookieConsentStore.getState().acceptAll();
      Cookies.set('_ga', 'GA1.1.123');

      useCookieConsentStore.getState().setAnalytics(false);

      expect(Cookies.get('cookie_consent')).toBeDefined();
    });
  });

  describe('hydratation', () => {
    it('restitue un choix précédent sans rouvrir le bandeau', () => {
      Cookies.set('cookie_consent', JSON.stringify({ analytics: true }));

      useCookieConsentStore.getState().hydrate();

      const etat = useCookieConsentStore.getState();
      expect(etat.hasConsented).toBe(true);
      expect(etat.preferences.analytics).toBe(true);
      expect(etat.isBannerOpen).toBe(false);
    });

    it('rouvre le bandeau quand aucun choix n’a été exprimé', () => {
      useCookieConsentStore.getState().hydrate();

      expect(useCookieConsentStore.getState().isBannerOpen).toBe(true);
    });
  });
});
