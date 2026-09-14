'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { birthDateField, genderField, nameField, phoneField } from '@/lib/validation';

// Aligné sur UpdateUserDto, plus le rôle - que l'API traite à part, via
// PUT /users/:id/role. Le mot de passe reste absent : le changer pour autrui
// reviendrait à s'octroyer l'accès au compte, et l'API a un chemin dédié qui
// exige le mot de passe actuel.
const userSchema = z.object({
  firstName: nameField('prénom'),
  lastName: nameField('nom'),
  email: z.string().email('Adresse e-mail invalide'),
  phone: phoneField,
  birthDate: birthDateField,
  gender: genderField,
  role: z.enum(['CLIENT', 'EMPLOYEE', 'ADMIN']),
  consentEmail: z.boolean(),
});

export type UserFormData = z.infer<typeof userSchema>;

export interface EditableUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  gender: string | null;
  birthDate: string | null;
  phone?: string | null;
  consentEmail: boolean;
}

interface UserEditDialogProps {
  readonly user: EditableUser;
  readonly isSaving: boolean;
  readonly onSubmit: (data: UserFormData) => void;
  readonly onCancel: () => void;
}

const GENDER_OPTIONS = [
  { value: '', label: 'Non précisé' },
  { value: 'MALE', label: 'Homme' },
  { value: 'FEMALE', label: 'Femme' },
  { value: 'OTHER', label: 'Autre' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Ne se prononce pas' },
];

const ROLE_OPTIONS = [
  { value: 'CLIENT', label: 'Client' },
  { value: 'EMPLOYEE', label: 'Employé' },
  { value: 'ADMIN', label: 'Administrateur' },
];

const SELECT_CLASS =
  'flex h-10 w-full rounded-soft border-[1.5px] border-gold-700 bg-surface px-4 font-functional text-body text-ink focus:border-accent focus:outline-none';

export function UserEditDialog({ user, isSaving, onSubmit, onCancel }: UserEditDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({ resolver: zodResolver(userSchema) });

  useEffect(() => {
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? '',
      // L'API renvoie un ISO datetime, l'input type=date attend AAAA-MM-JJ.
      birthDate: user.birthDate ? user.birthDate.slice(0, 10) : '',
      gender: (user.gender ?? '') as UserFormData['gender'],
      role: user.role as UserFormData['role'],
      consentEmail: user.consentEmail,
    });
  }, [user, reset]);

  // Échap ferme la modale : sans clavier, le formulaire ne se quitte qu'à la
  // souris, ce qui exclut la navigation au clavier exigée par le RGAA.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <dialog
        open
        aria-modal="true"
        aria-labelledby="titre-edition-utilisateur"
        // static + m-0 : neutralise le position:absolute et le margin:auto
        // par defaut de <dialog>, qui sortaient la modale du centrage flex de
        // l'overlay. text-ink : <dialog> impose un texte noir que l'ancien div
        // heritait de la page, illisible en theme sombre.
        className="static m-0 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-surface p-5 text-ink shadow-lg sm:p-6"
      >
        <h2 id="titre-edition-utilisateur" className="font-display text-h3 text-ink">
          Modifier {user.firstName} {user.lastName}
        </h2>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" {...register('firstName')} />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" {...register('lastName')} />
              {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" {...register('phone')} />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Date de naissance</Label>
              <Input id="birthDate" type="date" {...register('birthDate')} />
              {errors.birthDate && (
                <p className="text-sm text-red-600">{errors.birthDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gender">Genre</Label>
              <select id="gender" {...register('gender')} className={SELECT_CLASS}>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <select id="role" {...register('role')} className={SELECT_CLASS}>
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="consentEmail"
              type="checkbox"
              {...register('consentEmail')}
              className="h-4 w-4 rounded border-gold-700 accent-tea-600"
            />
            <Label htmlFor="consentEmail">Accepte de recevoir des e-mails commerciaux</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
