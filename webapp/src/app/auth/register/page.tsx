'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { trackRegisterSuccess, trackRegisterFailure, trackCTAClick } from '@/lib/analytics';
import { toDateInputValue } from '@/lib/utils';

const MIN_AGE = 18;
const MAX_AGE = 120;

function getAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthdayThisYear =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  if (beforeBirthdayThisYear) age--;
  return age;
}

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit faire au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(
      /[@$!%*?&#]/,
      'Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&#)'
    ),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'Le prénom doit faire au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit faire au moins 2 caractères'),
  phone: z.string().optional(),
  birthDate: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: 'Date invalide (format AAAA-MM-JJ, année sur 4 chiffres)',
    })
    .refine(
      (val) => {
        if (!val) return true;
        const age = getAge(new Date(val));
        return age >= MIN_AGE;
      },
      { message: 'Vous devez être majeur (18 ans minimum) pour vous inscrire' },
    )
    .refine(
      (val) => {
        if (!val) return true;
        const age = getAge(new Date(val));
        return age <= MAX_AGE;
      },
      { message: 'Date de naissance invalide' },
    ),
  gender: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  ),
  consentEmail: z.boolean().default(false),
  consentData: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les conditions' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  // Même risque qu'à la connexion, aggravé : ce formulaire porte le mot de
  // passe, sa confirmation, la date de naissance et le téléphone.
  const isHydrated = useIsHydrated();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      consentEmail: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...rest } = data;
      // On évite d'envoyer des champs optionnels vides (sinon échec IsDateString, etc.)
      await registerUser({
        ...rest,
        phone: rest.phone || undefined,
        birthDate: rest.birthDate || undefined,
      });
      trackRegisterSuccess('email');
      toast.success('Inscription réussie ! Bienvenue !');
      router.push('/dashboard');
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 409) {
        trackRegisterFailure('email', 'email_already_exists');
        toast.error('Un compte existe déjà avec cet email');
      } else if (status === 400 || status === 422) {
        trackRegisterFailure('email', 'invalid_data');
        toast.error('Données invalides. Vérifiez le formulaire.');
      } else {
        trackRegisterFailure('email', 'server_error');
        toast.error('Erreur lors de l\'inscription');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date();
  // toDateInputValue lit les composants en heure locale. toISOString() convertit
  // en UTC, ou minuit heure de Paris devient la veille : la borne tombait un jour
  // trop tot et bloquait la personne ayant 18 ans le jour meme.
  const maxBirthDate = toDateInputValue(
    new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate()),
  );
  const minBirthDate = toDateInputValue(
    new Date(today.getFullYear() - MAX_AGE, today.getMonth(), today.getDate()),
  );

  const handleOAuthLogin = (provider: 'google' | 'facebook') => {
    trackCTAClick(`S'inscrire avec ${provider}`, 'register_page');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-xl sm:rounded-card sm:border sm:border-warm-beige sm:bg-white sm:p-8 sm:shadow-sm">
        <h1 className="font-display text-h2 text-noir">Créer votre compte</h1>
        <p className="mt-2 text-sm text-stone-grey">
          Inscrivez-vous pour participer au jeu-concours
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          {/* Nom / Prenom */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                placeholder="Dupont"
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                placeholder="Jean"
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email *</Label>
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

          {/* Mot de passe */}
          <div>
            <Label htmlFor="password">Mot de passe *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 caractères"
              {...register('password')}
            />
            {errors.password ? (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            ) : (
              <p className="mt-1 text-xs text-stone-grey">
                Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
              </p>
            )}
          </div>

          {/* Confirmer mot de passe */}
          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Retapez votre mot de passe"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Divider optionnel */}
          <div className="border-t border-warm-beige pt-4"></div>

          {/* Date de naissance / Genre - Optionnel */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="birthDate">Date de naissance</Label>
              <Input
                id="birthDate"
                type="date"
                min={minBirthDate}
                max={maxBirthDate}
                {...register('birthDate')}
              />
              {errors.birthDate && (
                <p className="mt-1 text-xs text-red-600">{errors.birthDate.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="gender">Genre</Label>
              <select
                id="gender"
                className="flex h-10 w-full rounded-soft border border-warm-beige bg-white px-3 text-sm text-noir focus:outline-none focus:ring-2 focus:ring-terracotta-deep"
                defaultValue=""
                {...register('gender')}
              >
                <option value="">Sélectionner</option>
                <option value="FEMALE">Femme</option>
                <option value="MALE">Homme</option>
                <option value="OTHER">Autre</option>
                <option value="PREFER_NOT_TO_SAY">Préfère ne pas le dire</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-stone-grey">
            Champs facultatifs collectés uniquement à des fins statistiques pour le jeu-concours.
          </p>

          {/* Divider avant RGPD */}
          <div className="border-t border-warm-beige pt-4"></div>

          {/* RGPD */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consentData"
                className="mt-1 h-4 w-4 rounded-sharp border-warm-beige text-terracotta-deep accent-terracotta-deep"
                {...register('consentData')}
              />
              <label htmlFor="consentData" className="text-xs leading-relaxed text-stone-grey">
                J&apos;accepte les{' '}
                <Link href="/cgu" className="text-terracotta-deep hover:underline">
                  Conditions d&apos;utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/politique-confidentialite" className="text-terracotta-deep hover:underline">
                  Politique de confidentialité
                </Link>{' '}
                *
              </label>
            </div>
            {errors.consentData && (
              <p className="text-xs text-red-600">{errors.consentData.message}</p>
            )}

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consentEmail"
                className="mt-1 h-4 w-4 rounded-sharp border-warm-beige text-terracotta-deep accent-terracotta-deep"
                {...register('consentEmail')}
              />
              <label htmlFor="consentEmail" className="text-xs leading-relaxed text-stone-grey">
                Je souhaite recevoir les offres et nouveautes de The Tip Top
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading || !isHydrated}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inscription...
              </>
            ) : (
              'S\'inscrire'
            )}
          </Button>
        </form>

        {/* OAuth */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            className="flex w-full items-center justify-center gap-3 rounded-soft border border-warm-beige bg-white px-4 py-3 text-sm font-medium text-noir transition-colors hover:bg-cream"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            S&apos;inscrire avec Google
          </button>

          <button
            type="button"
            onClick={() => handleOAuthLogin('facebook')}
            className="flex w-full items-center justify-center gap-3 rounded-soft border border-warm-beige bg-white px-4 py-3 text-sm font-medium text-noir transition-colors hover:bg-cream"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
            </svg>
            S&apos;inscrire avec Facebook
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-stone-grey">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="font-semibold text-terracotta-deep hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
