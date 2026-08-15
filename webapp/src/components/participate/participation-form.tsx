'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

// Miroir du DTO côté API : toute règle assouplie ici serait de toute façon
// refusée par le serveur, autant le dire tout de suite à l'utilisateur.
const participationSchema = z.object({
  code: z
    .string()
    .length(10, 'Le code doit contenir exactement 10 caractères')
    .regex(/^[A-Z0-9]+$/, 'Le code ne contient que des lettres majuscules et des chiffres'),
  lastName: z.string().min(2, 'Le nom doit faire au moins 2 caractères'),
  firstName: z.string().min(2, 'Le prénom doit faire au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^(\+33|0)[1-9](\d{2}){4}$/.test(v), 'Numéro de téléphone invalide'),
  birthDate: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Date invalide (AAAA-MM-JJ)')
    .refine((v) => !v || getAge(new Date(v)) >= MIN_AGE, 'Vous devez être majeur pour participer')
    .refine((v) => !v || getAge(new Date(v)) <= MAX_AGE, 'Date de naissance invalide'),
  gender: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  ),
  consentData: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter pour participer' }),
  }),
  consentEmail: z.boolean().default(false),
  pixelTrackingConsent: z.boolean().default(false),
  // Piège à robots : invisible à l'écran, donc toujours vide pour un humain.
  website: z.string().max(0).optional(),
});

export type ParticipationFormData = z.infer<typeof participationSchema>;

interface Props {
  onSubmit: (data: ParticipationFormData) => void;
  isSubmitting: boolean;
}

export function ParticipationForm({ onSubmit, isSubmitting }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParticipationFormData>({
    resolver: zodResolver(participationSchema),
    defaultValues: { consentEmail: false, pixelTrackingConsent: false, website: '' },
  });

  const today = new Date();
  const maxBirthDate = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];
  const minBirthDate = new Date(today.getFullYear() - MAX_AGE, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
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

      <div className="border-t border-warm-beige pt-4" />

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
            defaultValue=""
            className="flex h-10 w-full rounded-soft border border-warm-beige bg-white px-3 text-sm text-noir focus:outline-none focus:ring-2 focus:ring-terracotta-deep"
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
            <Link href="/reglement" className="text-terracotta-deep hover:underline">
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

        {/* Consentement distinct du précédent : recommandation CNIL du
            14/04/2026. Accepter la newsletter ne vaut pas accepter le suivi. */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="pixelTrackingConsent"
            className="mt-1 h-4 w-4 rounded-sharp border-warm-beige accent-terracotta-deep"
            {...register('pixelTrackingConsent')}
          />
          <label htmlFor="pixelTrackingConsent" className="text-xs leading-relaxed text-stone-grey">
            J&apos;accepte la mesure d&apos;ouverture des emails qui me sont adressés
          </label>
        </div>
      </div>

      {/* Honeypot : masqué et retiré du parcours clavier et des lecteurs
          d'écran. Un robot qui remplit tout le formulaire le remplira aussi. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="website">Ne pas remplir</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
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
