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

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit faire au moins 8 caracteres')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'Le prenom doit faire au moins 2 caracteres'),
  lastName: z.string().min(2, 'Le nom doit faire au moins 2 caracteres'),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  newsletterOptIn: z.boolean().default(false),
  rgpdConsent: z.literal(true, {
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      newsletterOptIn: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      toast.success('Inscription reussie ! Bienvenue !');
      router.push('/dashboard');
    } catch {
      toast.error('Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'facebook') => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-lg">
        <h1 className="font-display text-h2 text-noir">Creer votre compte</h1>
        <p className="mt-2 text-sm text-stone-grey">
          Inscrivez-vous pour participer au jeu-concours
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          {/* Prenom / Nom */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">Prenom *</Label>
              <Input
                id="firstName"
                placeholder="Jean"
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
              )}
            </div>
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
              placeholder="Min. 8 caracteres"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm */}
          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirmez votre mot de passe"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Date de naissance */}
          <div>
            <Label htmlFor="birthDate">Date de naissance</Label>
            <Input
              id="birthDate"
              type="date"
              {...register('birthDate')}
            />
          </div>

          {/* RGPD */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="rgpdConsent"
                className="mt-1 h-4 w-4 rounded-sharp border-warm-beige text-terracotta-deep accent-terracotta-deep"
                {...register('rgpdConsent')}
              />
              <label htmlFor="rgpdConsent" className="text-xs leading-relaxed text-stone-grey">
                J&apos;accepte les{' '}
                <Link href="/cgu" className="text-terracotta-deep hover:underline">
                  conditions generales
                </Link>{' '}
                et la{' '}
                <Link href="/politique-confidentialite" className="text-terracotta-deep hover:underline">
                  politique de confidentialite
                </Link>{' '}
                *
              </label>
            </div>
            {errors.rgpdConsent && (
              <p className="text-xs text-red-600">{errors.rgpdConsent.message}</p>
            )}

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="newsletterOptIn"
                className="mt-1 h-4 w-4 rounded-sharp border-warm-beige text-terracotta-deep accent-terracotta-deep"
                {...register('newsletterOptIn')}
              />
              <label htmlFor="newsletterOptIn" className="text-xs leading-relaxed text-stone-grey">
                Je souhaite recevoir les offres et nouveautes de The Tip Top
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inscription...
              </>
            ) : (
              'Creer mon compte'
            )}
          </Button>
        </form>

        {/* OAuth */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            className="flex w-full items-center gap-3 rounded-soft border border-warm-beige bg-white px-4 py-3 text-sm font-medium text-noir transition-colors hover:bg-cream"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Se connecter avec SSO
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-stone-grey">
          Deja un compte ?{' '}
          <Link href="/auth/login" className="font-semibold text-terracotta-deep hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
