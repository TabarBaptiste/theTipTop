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
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { VerificationStep } from '@/components/participate/verification-step';
import { useIsHydrated } from '@/lib/hooks/use-is-hydrated';
import { trackRegisterSuccess, trackRegisterFailure, trackCTAClick } from '@/lib/analytics';
import {
  PASSWORD_HINT,
  birthDateBounds,
  birthDateField,
  genderField,
  nameField,
  passwordField,
  phoneField,
} from '@/lib/validation';

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: passwordField,
  confirmPassword: z.string(),
  firstName: nameField('prénom'),
  lastName: nameField('nom'),
  phone: phoneField,
  birthDate: birthDateField,
  gender: genderField,
  consentEmail: z.boolean().default(false),
  consentData: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les conditions' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

/** Réponse de POST /auth/register : aucun jeton avant confirmation. */
interface PendingRegistration {
  leadId: string;
  maskedEmail: string;
  expiresAt: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  // L'inscription se fait en deux temps : le formulaire, puis le code reçu par
  // email. Tant qu'il n'est pas saisi, aucun compte n'existe.
  const [pending, setPending] = useState<PendingRegistration | null>(null);
  const [offerEmailCorrection, setOfferEmailCorrection] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
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
      const { confirmPassword: _confirmPassword, ...rest } = data;
      // On évite d'envoyer des champs optionnels vides (sinon échec IsDateString, etc.)
      const { data: response } = await api.post<PendingRegistration>('/auth/register', {
        ...rest,
        phone: rest.phone || undefined,
        birthDate: rest.birthDate || undefined,
      });
      setPending(response);
    } catch (error: unknown) {
      // Le 409 « email déjà utilisé » a disparu : y répondre renseignerait
      // n'importe qui sur les adresses inscrites. Une adresse déjà connue suit
      // désormais le parcours nominal, et son titulaire est prévenu par email.
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 400 || status === 422) {
        trackRegisterFailure('email', 'invalid_data');
        toast.error('Données invalides. Vérifiez le formulaire.');
      } else {
        trackRegisterFailure('email', 'server_error');
        toast.error("Erreur lors de l'inscription");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /** Le compte n'est créé qu'ici, et la session s'ouvre dans la foulée. */
  const onVerify = async (code: string) => {
    setIsVerifying(true);
    try {
      const { data } = await api.post('/auth/register/verify', {
        leadId: pending!.leadId,
        code,
      });
      // L'API renvoie déjà le profil avec les jetons : inutile de rappeler
      // /auth/me, comme le fait le tunnel de participation.
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      trackRegisterSuccess('email');
      toast.success('Bienvenue !');
      router.push('/dashboard');
    } catch {
      toast.error('Code invalide ou expiré');
    } finally {
      setIsVerifying(false);
    }
  };

  const onResend = async (newEmail?: string) => {
    setIsResending(true);
    try {
      const { data } = await api.post('/auth/register/resend', {
        leadId: pending!.leadId,
        ...(newEmail ? { email: newEmail } : {}),
      });
      // maskedEmail et expiresAt changent : le décompte de 60 s repart de zéro.
      setPending((prev) =>
        prev ? { ...prev, maskedEmail: data.maskedEmail, expiresAt: data.expiresAt } : prev,
      );
      setOfferEmailCorrection(data.shouldOfferEmailCorrection);
      toast.success('Un nouveau code vous a été envoyé');
    } catch {
      toast.error("Le renvoi n'a pas abouti");
    } finally {
      setIsResending(false);
    }
  };

  const birthDateRange = birthDateBounds();

  const handleOAuthLogin = (provider: 'google' | 'facebook') => {
    trackCTAClick(`S'inscrire avec ${provider}`, 'register_page');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  if (pending) {
    return (
      <div className="flex min-h-[calc(100vh-3.75rem)] items-center justify-center bg-cream px-4 py-12">
        <div className="w-full max-w-xl sm:rounded-card sm:border sm:border-warm-beige sm:bg-surface sm:p-8 sm:shadow-sm">
          <VerificationStep
            // Un nouvel envoi produit une nouvelle échéance : le composant est
            // remonté, ce qui relance le décompte de 60 s sans effet de bord.
            key={pending.expiresAt}
            maskedEmail={pending.maskedEmail}
            expiresAt={pending.expiresAt}
            isVerifying={isVerifying}
            isResending={isResending}
            offerEmailCorrection={offerEmailCorrection}
            submitLabel="Créer mon compte"
            onVerify={onVerify}
            onResend={onResend}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.75rem)] items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-xl sm:rounded-card sm:border sm:border-warm-beige sm:bg-surface sm:p-8 sm:shadow-sm">
        <h1 className="font-display text-h2 text-ink">Créer votre compte</h1>
        <p className="mt-2 text-sm text-stone-grey">
          Inscrivez-vous pour participer au jeu-concours
        </p>

        <form method="post" noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
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
              <p className="mt-1 text-xs text-stone-grey">{PASSWORD_HINT}</p>
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

          {/* Téléphone - Optionnel */}
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0612345678"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Date de naissance / Genre - Optionnel */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="birthDate">Date de naissance</Label>
              <Input
                id="birthDate"
                type="date"
                min={birthDateRange.min}
                max={birthDateRange.max}
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
                className="flex h-10 w-full rounded-soft border border-gold-700 bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-terracotta-deep"
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
                className="mt-1 h-4 w-4 rounded-sharp border-gold-700 text-accent accent-terracotta-deep"
                {...register('consentData')}
              />
              <label htmlFor="consentData" className="text-xs leading-relaxed text-stone-grey">
                J&apos;accepte les{' '}
                <Link href="/cgu" className="text-accent underline underline-offset-2">
                  Conditions d&apos;utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/politique-confidentialite" className="text-accent underline underline-offset-2">
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
                className="mt-1 h-4 w-4 rounded-sharp border-gold-700 text-accent accent-terracotta-deep"
                {...register('consentEmail')}
              />
              <label htmlFor="consentEmail" className="text-xs leading-relaxed text-stone-grey">
                Je souhaite recevoir les offres et nouveautés de Thé Tip Top
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
            className="flex w-full items-center justify-center gap-3 rounded-soft border border-gold-700 bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-cream"
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
            className="flex w-full items-center justify-center gap-3 rounded-soft border border-gold-700 bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-cream"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
            </svg>
            S&apos;inscrire avec Facebook
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-stone-grey">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="font-semibold text-accent underline underline-offset-2">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
