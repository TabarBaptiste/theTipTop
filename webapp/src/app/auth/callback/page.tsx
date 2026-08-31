'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { landingRouteFor } from '@/lib/landing-route';
import { Skeleton } from '@/components/ui/skeleton';
import { consumePostAuthDestination } from '@/lib/post-auth-redirect';
import { isPlaceholderEmail } from '@/lib/placeholder-email';

/**
 * Point d'atterrissage après le flux OAuth (Google / Facebook).
 *
 * Le back-end redirige ici avec un code à usage unique :
 *   /auth/callback?code=...
 *
 * Ce code est échangé contre les jetons par une requête POST, puis la session
 * est ouverte comme après une connexion classique.
 *
 * Les jetons transitaient auparavant dans cette URL. Une URL de redirection
 * entre dans l'historique du navigateur, part dans l'en-tête Referer vers les
 * ressources tierces de la page, et s'inscrit dans les journaux de chaque
 * intermédiaire traversé. Le jeton de rafraîchissement étant valable
 * longtemps, quiconque l'y récupérait pouvait rouvrir une session — même
 * après une déconnexion. Le corps d'une requête POST ne laisse aucune de ces
 * traces.
 */
function AuthCallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const { handleOAuthCallback } = useAuthStore();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const code = params.get('code');
    const error = params.get('error');

    if (error || !code) {
      toast.error('La connexion a échoué. Veuillez réessayer.');
      router.replace('/auth/login');
      return;
    }

    api
      .post('/auth/oauth/exchange', { code })
      .then(({ data }) => handleOAuthCallback(data.accessToken, data.refreshToken))
      .then(() => {
        toast.success('Connexion réussie !');
        // Deux règles à concilier : revenir là d'où l'utilisateur est parti, et
        // ne pas déposer un admin ou un employé sur /dashboard, qui ne liste que
        // les participations personnelles du compte.
        //
        // consumePostAuthDestination doit être appelée dans tous les cas : elle
        // vide la destination mémorisée. Son défaut étant /dashboard, une
        // demande explicite se reconnaît à ce qu'elle en diffère, et c'est elle
        // qui l'emporte - l'utilisateur a voulu cette page-là. Sinon le rôle
        // tranche, lu dans le store que handleOAuthCallback vient d'hydrater
        // plutôt qu'à une valeur figée au rendu.
        const destination = consumePostAuthDestination();
        const currentUser = useAuthStore.getState().user;

        // Un compte dépourvu d'adresse réelle passe d'abord par le rattachement :
        // en l'état il ne peut recevoir ni annonce de lot ni rappel de délai.
        // La destination mémorisée est consommée quand même, pour qu'elle ne
        // resurgisse pas à une connexion ultérieure.
        if (isPlaceholderEmail(currentUser?.email)) {
          router.replace('/auth/complete-email');
          return;
        }

        router.replace(
          destination === '/dashboard' ? landingRouteFor(currentUser?.role) : destination
        );
      })
      .catch(() => {
        toast.error('Session invalide. Veuillez vous reconnecter.');
        router.replace('/auth/login');
      });
  }, [params, router, handleOAuthCallback]);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-4 bg-cream">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-4 bg-cream">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}
