'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import { useCookieConsentStore } from '@/lib/stores/cookie-consent-store';

export function ConditionalAnalytics({ gaId }: Readonly<{ gaId: string }>) {
  const hasConsented = useCookieConsentStore((state) => state.hasConsented);
  const analyticsAllowed = useCookieConsentStore((state) => state.preferences.analytics);

  if (!hasConsented || !analyticsAllowed) {
    return null;
  }

  return <GoogleAnalytics gaId={gaId} />;
}
