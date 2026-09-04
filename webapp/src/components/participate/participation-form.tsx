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
import {
  PASSWORD_HINT,
  birthDateBounds,
  birthDateField,
  genderField,
  nameField,
  passwordField,
  phoneField,
} from '@/lib/validation';

const participationSchema = z
  .object({
    code: z
      .string()
      .length(10, 'Le code doit contenir exactement 10 caractères')
      .regex(/^[A-Z0-9]+$/, 'Le code ne contient que des lettres majuscules et des chiffres'),
    lastName: nameField('nom'),
    firstName: nameField('prénom'),
    email: z.string().email('Adresse email invalide'),
    password: passwordField,
    confirmPassword: z.string(),
    phone: phoneField,
    birthDate: birthDateField,
    gender: genderField,
    consentData: z.literal(true, {
      errorMap: () => ({ message: 'Vous devez accepter pour participer' }),
    }),
    consentEmail: z.boolean().default(false),
    // Piège à robots : invisible à l'écran, donc toujours vide pour un humain.
    website: z.string().max(0).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type ParticipationFormData = z.infer<typeof participationSchema>;

interface Props {
  readonly onSubmit: (data: ParticipationFormData) => void;
  readonly isSubmitting: boolean;
}

export function ParticipationForm({ onSubmit, isSubmitting }: Props) {
  // Tant que la page n'est pas hydratée, React n'intercepte pas la soumission :
  // le navigateur ferait un envoi natif en GET et recopierait email, téléphone
  // et date de naissance dans l'URL. Le bouton reste donc désactivé, ce qui
  // neutralise aussi la validation implicite par la touche Entrée.
  const isHydrated = useIsHydrated();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParticipationFormData>({
    resolver: zodResolver(participationSchema),
    defaultValues: { consentEmail: false, website: '' },
  });

  const birthDateRange = birthDateBounds();

  return (
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="lastName">Nom *</Label>
          <Input id="lastName" placeholder="Dupont" {...register('lastName')} />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="firstName">Prénom *</Label>
          <Input id="firstName" placeholder="Jean" {...register('firstName')} />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Adresse email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="votre@email.com"
          {...register('email')}
        />
        {errors.email ? (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        ) : (
          <p className="mt-1 text-xs text-stone-grey">
            Votre code de confirmation y sera envoyé
          </p>
        )}
      </div>

      {/* Le compte est créé à la confirmation du code. Demander le mot de passe
          ici plutôt qu'après le résultat évite les comptes sans mot de passe,
          que leur titulaire ne pouvait plus retrouver faute de pouvoir s'y
          reconnecter. */}
      <div>
        <Label htmlFor="password">Mot de passe *</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
        />
        {errors.password ? (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        ) : (
          <p className="mt-1 text-xs text-stone-grey">{PASSWORD_HINT}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="border-t border-warm-beige pt-4" />

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
            defaultValue=""
            className="flex h-10 w-full rounded-soft border border-gold-700 bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-terracotta-deep"
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

      <div>
        <Label htmlFor="phone">Téléphone</Label>
        <Input id="phone" placeholder="0612345678" {...register('phone')} />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
      </div>

      <p className="text-xs text-stone-grey">
        Champs facultatifs, collectés uniquement à des fins statistiques.
      </p>

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
            <Link href="/reglement" className="text-accent underline underline-offset-2">
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

      {/* Honeypot : masqué et retiré du parcours clavier et des lecteurs
          d'écran. Un robot qui remplit tout le formulaire le remplira aussi. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="website">Ne pas remplir</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !isHydrated}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          'Participer'
        )}
      </Button>
    </form>
  );
}
