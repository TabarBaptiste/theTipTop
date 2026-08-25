'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useIsHydrated } from '@/lib/hooks/use-is-hydrated';
import { landingRouteFor } from '@/lib/landing-route';
import { trackLoginSuccess, trackLoginFailure, trackCTAClick } from '@/lib/analytics';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Composant isolé pour useSearchParams - Next.js exige un <Suspense> autour de tout
// composant qui utilise ce hook lors du build (static rendering).
function OAuthErrorHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // facebook_no_email n'est plus émis : un compte sans adresse est désormais
    // accepté sous une adresse de substitution, puis invité à en renseigner une
    // vraie. Seule une panne réelle refuse encore la connexion.
    const error = searchParams.get('error');
    if (error === 'facebook_failed') {
      toast.error('La connexion Facebook a échoué. Veuillez réessayer.');
    }
  }, [searchParams]);

  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  // Tant que React n'a pas pris la main, le formulaire reste un formulaire
  // HTML : le soumettre enverrait email ET mot de passe dans l'URL.
  const isHydrated = useIsHydrated();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      trackLoginSuccess('email');
      toast.success('Connexion réussie !');
      // getState() et non la valeur du hook : le rôle vient tout juste d'être
      // écrit dans le store, celle capturée au rendu serait encore nulle.
      router.push(landingRouteFor(useAuthStore.getState().user?.role));
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        trackLoginFailure('email', 'invalid_credentials');
        toast.error('Email ou mot de passe incorrect');
      } else if (status === 429) {
        trackLoginFailure('email', 'rate_limited');
        toast.error('Trop de tentatives. Réessayez dans quelques instants.');
      } else {
        trackLoginFailure('email', 'server_error');
        toast.error('Erreur lors de la connexion. Réessayez plus tard.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'facebook') => {
    trackCTAClick(`Se connecter avec ${provider}`, 'login_page');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-cream px-4 py-12">
      {/* Gestionnaire d'erreurs OAuth - doit etre dans un Suspense boundary */}
      <Suspense fallback={null}>
        <OAuthErrorHandler />
      </Suspense>

      <div className="w-full max-w-lg sm:rounded-card sm:border sm:border-warm-beige sm:bg-white sm:p-8 sm:shadow-sm">
        <h1 className="font-display text-h2 text-noir">Se connecter</h1>
        <p className="mt-2 text-sm text-stone-grey">
          Ravis de vous revoir !
        </p>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div>
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              {/* Pas de flux "mot de passe oublié" côté API : on oriente vers le support */}
              <a
                href="mailto:contact@thetiptop.fr?subject=Mot%20de%20passe%20oubli%C3%A9"
                className="text-xs text-terracotta-600 hover:underline"
              >
                Mot de passe oublié ?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Votre mot de passe"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading || !isHydrated}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 border-t border-warm-beige"></div>
          <span className="text-sm text-stone-grey">OU</span>
          <div className="flex-1 border-t border-warm-beige"></div>
        </div>

        {/* OAuth */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            className="flex w-full items-center justify-center gap-3 rounded-soft border border-gold-700 bg-white px-4 py-3 text-sm font-medium text-noir transition-colors hover:bg-cream"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Se connecter avec Google
          </button>

          <button
            type="button"
            onClick={() => handleOAuthLogin('facebook')}
            className="flex w-full items-center justify-center gap-3 rounded-soft border border-gold-700 bg-white px-4 py-3 text-sm font-medium text-noir transition-colors hover:bg-cream"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
            </svg>
            Se connecter avec Facebook
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-stone-grey">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="font-semibold text-terracotta-600 hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
