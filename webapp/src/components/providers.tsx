'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';

/**
 * Vérifie la session au montage de l'app (après hydration Zustand).
 * Sans ce composant, `isLoading` reste `true` (valeur initiale du store,
 * non persistée) après un rechargement de page → spinner infini sur /dashboard.
 */
function AuthInitializer() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      {children}
    </QueryClientProvider>
  );
}
