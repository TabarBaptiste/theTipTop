'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCookieConsentStore } from '@/lib/stores/cookie-consent-store';

export function CookieConsentBanner() {
  const hydrate = useCookieConsentStore((state) => state.hydrate);
  const isBannerOpen = useCookieConsentStore((state) => state.isBannerOpen);
  const acceptAll = useCookieConsentStore((state) => state.acceptAll);
  const rejectAll = useCookieConsentStore((state) => state.rejectAll);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isBannerOpen) {
    return null;
  }

  return (
    <dialog
      open
      aria-label="Gestion des cookies"
      className="m-0 fixed inset-x-0 bottom-0 z-50 w-full max-w-none border-t border-warm-beige bg-cream px-4 py-5 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone">
          Nous utilisons des cookies de mesure d&apos;audience (Google Analytics). Vous pouvez
          accepter ou refuser, et changer d&apos;avis à tout moment depuis la page{' '}
          <Link
            href="/gestion-cookies"
            className="text-accent underline underline-offset-2 hover:text-terracotta-700"
          >
            Gestion des cookies
          </Link>
          .
        </p>
        <div className="flex flex-wrap gap-3 sm:shrink-0">
          <Button variant="outline" size="sm" onClick={rejectAll}>
            Tout refuser
          </Button>
          <Button size="sm" onClick={acceptAll}>
            Tout accepter
          </Button>
        </div>
      </div>
    </dialog>
  );
}
