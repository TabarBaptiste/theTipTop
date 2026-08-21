import { create } from 'zustand';
import Cookies from 'js-cookie';

export interface CookiePreferences {
  analytics: boolean;
}

interface CookieConsentState {
  hasConsented: boolean;
  isBannerOpen: boolean;
  preferences: CookiePreferences;

  hydrate: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  setAnalytics: (enabled: boolean) => void;
}

// Nom et durée alignés sur /gestion-cookies (article 3 et 5) : cookie "cookie_consent", 13 mois CNIL.
const COOKIE_NAME = 'cookie_consent';
const COOKIE_EXPIRES_DAYS = 396;

/**
 * Cookies déposés par Google Analytics. `_ga` porte l'identifiant client,
 * `_ga_<conteneur>` l'état de session, `_gid` et `_gat` sont des reliquats des
 * versions précédentes que d'anciennes visites peuvent avoir laissés.
 */
const ANALYTICS_COOKIE_PREFIXES = ['_ga', '_gid', '_gat'];

function persistPreferences(preferences: CookiePreferences) {
  Cookies.set(COOKIE_NAME, JSON.stringify(preferences), {
    expires: COOKIE_EXPIRES_DAYS,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * Efface les cookies de mesure d'audience.
 *
 * Retirer son consentement doit produire un effet réel : cesser d'envoyer des
 * données ne suffit pas si l'identifiant qui permet de reconnaître le visiteur
 * reste sur sa machine.
 *
 * Les noms sont découverts à l'exécution plutôt que listés : `_ga_<conteneur>`
 * dépend de l'identifiant de mesure, inconnu ici.
 */
export function removeAnalyticsCookies() {
  if (typeof document === 'undefined') return;

  const noms = document.cookie
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter(Boolean);

  const hote = window.location.hostname;

  for (const nom of noms) {
    if (!ANALYTICS_COOKIE_PREFIXES.some((prefixe) => nom.startsWith(prefixe))) continue;

    // Selon la configuration, GA dépose sur l'hôte exact ou sur le domaine
    // parent. Une suppression ne vise qu'une portée : les trois variantes sont
    // tentées, faute de pouvoir lire celle d'origine depuis le navigateur.
    Cookies.remove(nom);
    Cookies.remove(nom, { domain: hote });
    Cookies.remove(nom, { domain: `.${hote}` });
  }
}

export const useCookieConsentStore = create<CookieConsentState>((set) => {
  const appliquer = (analytics: boolean) => {
    const preferences = { analytics };
    persistPreferences(preferences);
    if (!analytics) {
      removeAnalyticsCookies();
    }
    set({ hasConsented: true, preferences, isBannerOpen: false });
  };

  return {
    hasConsented: false,
    isBannerOpen: false,
    preferences: { analytics: false },

    hydrate: () => {
      const raw = Cookies.get(COOKIE_NAME);
      if (raw) {
        try {
          const preferences = JSON.parse(raw) as CookiePreferences;
          set({ hasConsented: true, preferences });
          return;
        } catch {
          // Cookie corrompu : on redemande le consentement.
        }
      }
      set({ isBannerOpen: true });
    },

    acceptAll: () => appliquer(true),
    rejectAll: () => appliquer(false),

    /** Utilisé par la page de gestion, où le choix peut aller dans les deux sens. */
    setAnalytics: (enabled: boolean) => appliquer(enabled),
  };
});
