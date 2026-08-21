'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gift, PartyPopper, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

// Mêmes exigences que l'inscription classique : le compte créé ici n'est pas
// un compte de seconde zone.
const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Le mot de passe doit faire au moins 8 caractères')
      .regex(/[A-Z]/, 'Il doit contenir au moins une majuscule')
      .regex(/[a-z]/, 'Il doit contenir au moins une minuscule')
      .regex(/[0-9]/, 'Il doit contenir au moins un chiffre')
      .regex(/[@$!%*?&#]/, 'Il doit contenir au moins un caractère spécial (@$!%*?&#)'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface Props {
  prizeName: string;
  prizeValue?: string;
  code: string;
  /** Option A : le mot de passe est choisi après la validation du code. */
  passwordRequired: boolean;
  userId: string;
}

export function ParticipationResult({
  prizeName,
  prizeValue,
  code,
  passwordRequired,
  userId,
}: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [passwordSet, setPasswordSet] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (data: PasswordFormData) => {
    setIsSaving(true);
    try {
      await api.put(`/users/${userId}`, { password: data.password });
      setPasswordSet(true);
      toast.success('Mot de passe enregistré');
      router.push('/dashboard');
    } catch {
      toast.error("Impossible d'enregistrer le mot de passe. Réessayez.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-terracotta-50">
        <PartyPopper className="h-8 w-8 text-terracotta-600" strokeWidth={1.5} />
      </div>

      <h1 className="mt-6 font-display text-h2 text-noir">Félicitations !</h1>
      <p className="mt-2 text-sm text-stone-grey">Vous avez gagné :</p>

      <div className="mt-6 rounded-card bg-terracotta-50 p-6">
        <Gift className="mx-auto h-10 w-10 text-terracotta-600" strokeWidth={1.5} />
        <h2 className="mt-3 font-display text-xl font-bold text-noir">{prizeName}</h2>
        {prizeValue && (
          <p className="mt-1 font-functional text-lg font-bold text-terracotta-600">
            Valeur : {prizeValue}
          </p>
        )}
      </div>

      <div className="mt-6 rounded-soft bg-cream p-4 text-left">
        <p className="text-xs text-stone-grey">
          <strong>Code utilisé :</strong> {code}
        </p>
        <p className="mt-2 text-xs text-stone-grey">
          <Sparkles className="mr-1 inline h-3 w-3 text-gold-500" />
          Vous êtes automatiquement inscrit au tirage au sort du grand prix.
        </p>
      </div>

      {passwordRequired && !passwordSet ? (
        <div className="mt-8 border-t border-warm-beige pt-6 text-left">
          <h3 className="font-display text-lg text-noir">Sécurisez votre compte</h3>
          <p className="mt-1 text-sm text-stone-grey">
            Choisissez un mot de passe pour retrouver vos participations plus tard.
          </p>

          <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password ? (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              ) : (
                <p className="mt-1 text-xs text-stone-grey">
                  Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer et continuer'
              )}
            </Button>
          </form>

          <p className="mt-3 text-center text-xs text-stone-grey">
            <Link href="/dashboard" className="hover:underline">
              Plus tard
            </Link>
          </p>
        </div>
      ) : (
        <Button asChild className="mt-8 w-full" size="lg">
          <Link href="/dashboard">Voir mes participations</Link>
        </Button>
      )}
    </div>
  );
}
