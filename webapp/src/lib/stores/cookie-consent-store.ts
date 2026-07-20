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
}

// Nom et durée alignés sur /gestion-cookies (article 3 et 5) : cookie "cookie_consent", 13 mois CNIL.
const COOKIE_NAME = 'cookie_consent';
const COOKIE_EXPIRES_DAYS = 396;

function persistPreferences(preferences: CookiePreferences) {
  Cookies.set(COOKIE_NAME, JSON.stringify(preferences), {
    expires: COOKIE_EXPIRES_DAYS,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
}

export const useCookieConsentStore = create<CookieConsentState>((set) => ({
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

  acceptAll: () => {
    const preferences = { analytics: true };
    persistPreferences(preferences);
    set({ hasConsented: true, preferences, isBannerOpen: false });
  },

  rejectAll: () => {
    const preferences = { analytics: false };
    persistPreferences(preferences);
    set({ hasConsented: true, preferences, isBannerOpen: false });
  },
}));
