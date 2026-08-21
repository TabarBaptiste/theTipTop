'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIsHydrated } from '@/lib/hooks/use-is-hydrated';

// Formulaire du chemin A d'UC-05, une fois l'identité certifiée par le
// fournisseur tiers. Nom, prénom et email viennent du compte : il ne reste
// que le code et les consentements.
const schema = z.object({
  code: z
    .string()
    .length(10, 'Le code doit contenir exactement 10 caractères')
    .regex(/^[A-Z0-9]+$/, 'Le code ne contient que des lettres majuscules et des chiffres'),
  consentData: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter pour participer' }),
  }),
  consentEmail: z.boolean().default(false),
});

export type AuthenticatedParticipationData = z.infer<typeof schema>;

interface Props {
  firstName: string;
  email: string;
  defaultCode?: string;
  isSubmitting: boolean;
  onSubmit: (data: AuthenticatedParticipationData) => void;
}

export function AuthenticatedParticipationForm({
  firstName,
  email,
  defaultCode,
  isSubmitting,
  onSubmit,
}: Props) {
  const isHydrated = useIsHydrated();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthenticatedParticipationData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: defaultCode ?? '',
      consentEmail: false,
    },
  });

  return (
    <>
      <h1 className="font-display text-h2 text-noir">Bonjour {firstName}</h1>
      <p className="mt-2 text-sm text-stone-grey">
        Vous êtes identifié avec <strong className="text-noir">{email}</strong>. Saisissez
        votre code : votre lot sera révélé immédiatement.
      </p>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="code">Code du ticket *</Label>
          <Input
            id="code"
            placeholder="ABCDEFGH23"
            className="mt-1 text-center tracking-[0.3em]"
            maxLength={10}
            autoComplete="off"
            {...register('code', {
              onChange: (e) => {
                e.target.value = e.target.value.toUpperCase();
              },
            })}
          />
          {errors.code ? (
            <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>
          ) : (
            <p className="mt-1 text-xs text-stone-grey">
              Les 10 caractères figurant sur votre ticket de caisse
            </p>
          )}
        </div>

        <div className="border-t border-warm-beige pt-4" />

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consentData"
              className="mt-1 h-4 w-4 rounded-sharp border-warm-beige accent-terracotta-deep"
              {...register('consentData')}
            />
            <label htmlFor="consentData" className="text-xs leading-relaxed text-stone-grey">
              J&apos;accepte le traitement de mes données et le{' '}
              <Link href="/reglement" className="text-terracotta-600 hover:underline">
                règlement du jeu
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
              className="mt-1 h-4 w-4 rounded-sharp border-warm-beige accent-terracotta-deep"
              {...register('consentEmail')}
            />
            <label htmlFor="consentEmail" className="text-xs leading-relaxed text-stone-grey">
              Je souhaite recevoir les offres et nouveautés de Thé Tip Top
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !isHydrated}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Vérification...
            </>
          ) : (
            'Découvrir mon lot'
          )}
        </Button>
      </form>
    </>
  );
}
