'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { landingRouteFor } from '@/lib/landing-route';
import { Skeleton } from '@/components/ui/skeleton';
import { consumePostAuthDestination } from '@/lib/post-auth-redirect';

/**
 * Point d'atterrissage après le flux OAuth (Google / Facebook).
 * Le back-end redirige ici avec les tokens en query params :
 *   /auth/callback?accessToken=...&refreshToken=...
 * On les stocke dans le store, on hydrate le profil, puis on redirige.
 */
function AuthCallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const { handleOAuthCallback } = useAuthStore();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');

    if (error || !accessToken || !refreshToken) {
      toast.error('La connexion a échoué. Veuillez réessayer.');
      router.replace('/auth/login');
      return;
    }

    handleOAuthCallback(accessToken, refreshToken)
      .then(() => {
        toast.success('Connexion réussie !');
        // Deux règles à concilier : revenir là d'où l'utilisateur est parti, et
        // ne pas déposer un admin ou un employé sur /dashboard, qui ne liste que
        // les participations personnelles du compte.
        //
        // consumePostAuthDestination doit être appelée dans tous les cas : elle
        // vide la destination mémorisée. Son défaut étant /dashboard, une
        // demande explicite se reconnaît à ce qu'elle en diffère, et c'est elle
        // qui l'emporte — l'utilisateur a voulu cette page-là. Sinon le rôle
        // tranche, lu dans le store que handleOAuthCallback vient d'hydrater
        // plutôt qu'à une valeur figée au rendu.
        const destination = consumePostAuthDestination();
        router.replace(
          destination === '/dashboard'
            ? landingRouteFor(useAuthStore.getState().user?.role)
            : destination
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
