// ===========================================
// Règles de saisie partagées
// ===========================================
// Miroir des DTO côté API : toute règle assouplie ici serait de toute façon
// refusée par le serveur, autant le dire tout de suite à l'utilisateur.
//
// Elles vivaient jusqu'ici recopiées dans chaque formulaire — inscription,
// participation, choix du mot de passe. Trois copies d'une même règle, c'est
// trois occasions de n'en corriger que deux.

import { z } from 'zod';
import { toDateInputValue } from '@/lib/utils';

export const MIN_AGE = 18;
export const MAX_AGE = 120;

export function getAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthdayThisYear =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  if (beforeBirthdayThisYear) age--;
  return age;
}

/**
 * Bornes du sélecteur de date natif.
 *
 * toDateInputValue lit les composants en heure locale. toISOString() convertit
 * en UTC, où minuit heure de Paris devient la veille : la borne tombait un jour
 * trop tôt et bloquait la personne ayant 18 ans le jour même.
 */
export function birthDateBounds(): { min: string; max: string } {
  const today = new Date();
  return {
    max: toDateInputValue(
      new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate()),
    ),
    min: toDateInputValue(
      new Date(today.getFullYear() - MAX_AGE, today.getMonth(), today.getDate()),
    ),
  };
}

/** Majorité requise, format AAAA-MM-JJ. Facultatif : collecté à fin statistique. */
export const birthDateField = z
  .string()
  .optional()
  .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Date invalide (AAAA-MM-JJ)')
  .refine(
    (v) => !v || getAge(new Date(v)) >= MIN_AGE,
    `Vous devez être majeur (${MIN_AGE} ans minimum) pour vous inscrire`,
  )
  .refine((v) => !v || getAge(new Date(v)) <= MAX_AGE, 'Date de naissance invalide');

export const phoneField = z
  .string()
  .optional()
  .refine((v) => !v || /^(\+33|0)[1-9](\d{2}){4}$/.test(v), 'Numéro de téléphone invalide');

export const genderField = z.preprocess(
  (v) => (v === '' ? undefined : v),
  z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
);

/**
 * Mêmes exigences partout : le compte ouvert depuis le tunnel de participation
 * n'est pas un compte de seconde zone, les deux parcours peuplent la même table.
 */
export const passwordField = z
  .string()
  .min(8, 'Le mot de passe doit faire au moins 8 caractères')
  .regex(/[A-Z]/, 'Il doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Il doit contenir au moins une minuscule')
  .regex(/\d/, 'Il doit contenir au moins un chiffre')
  .regex(/[@$!%*?&#]/, 'Il doit contenir au moins un caractère spécial (@$!%*?&#)');

/** Repris tel quel sous chaque champ mot de passe, en l'absence d'erreur. */
export const PASSWORD_HINT = 'Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial';

export const nameField = (label: string) =>
  z.string().min(2, `Le ${label} doit faire au moins 2 caractères`);
