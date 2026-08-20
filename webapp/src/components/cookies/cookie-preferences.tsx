'use client';

import { useEffect } from 'react';

import { useCookieConsentStore } from '@/lib/stores/cookie-consent-store';
import { useIsHydrated } from '@/lib/hooks/use-is-hydrated';

/**
 * Commande de consentement à la mesure d'audience.
 *
 * La bannière annonçait qu'on pouvait « changer d'avis à tout moment depuis la
 * page Gestion des cookies », mais cette page était purement informative :
 * aucun retour en arrière n'était possible une fois le consentement donné. La
 * CNIL demande pourtant que le retrait soit aussi simple que l'acceptation.
 */
export function CookiePreferences() {
  const isHydrated = useIsHydrated();
  const hasConsented = useCookieConsentStore((state) => state.hasConsented);
  const analytics = useCookieConsentStore((state) => state.preferences.analytics);
  const hydrate = useCookieConsentStore((state) => state.hydrate);
  const setAnalytics = useCookieConsentStore((state) => state.setAnalytics);

  // La bannière hydrate déjà le store, mais elle ne s'affiche plus une fois le
  // choix fait : sans cet appel, la page arriverait sur l'état par défaut et
  // afficherait « refusé » à quelqu'un ayant accepté.
  useEffect(() => {
    if (!hasConsented) hydrate();
  }, [hasConsented, hydrate]);

  const changer = (autorise: boolean) => {
    const etaitAutorise = analytics;
    setAnalytics(autorise);

    // Retirer le consentement démonte le composant qui injecte le script, mais
    // gtag.js reste chargé en mémoire et continuerait d'émettre jusqu'au
    // prochain chargement. Le rechargement rend l'arrêt effectif.
    if (etaitAutorise && !autorise) {
      window.location.reload();
    }
  };

  if (!isHydrated) {
    return <div className="h-24 rounded-card border border-warm-beige bg-white" />;
  }

  return (
    <div className="rounded-card border border-warm-beige bg-white p-6">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="consentement-analytics"
          checked={analytics}
          onChange={(e) => changer(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-terracotta-600"
        />
        <div>
          <label htmlFor="consentement-analytics" className="font-semibold text-noir">
            Autoriser la mesure d&apos;audience
          </label>
          <p className="mt-1 text-sm text-stone-grey">
            Google Analytics nous indique quelles pages sont consultées et par combien de
            personnes. Ces cookies ne sont déposés qu&apos;avec votre accord, et les retirer
            supprime immédiatement ceux déjà présents sur votre appareil.
          </p>
          <p className="mt-2 text-sm text-stone-grey">
            État actuel :{' '}
            <strong className="text-noir">
              {analytics ? 'mesure d’audience autorisée' : 'mesure d’audience refusée'}
            </strong>
            . Les cookies strictement nécessaires au fonctionnement du site restent actifs dans
            les deux cas : ils ne relèvent pas du consentement.
          </p>
        </div>
      </div>
    </div>
  );
}
