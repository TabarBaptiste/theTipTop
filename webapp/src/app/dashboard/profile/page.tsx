'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AccountSidebar } from '@/components/dashboard/account-sidebar';
import { useAuthStore } from '@/lib/stores/auth-store';
import { api } from '@/lib/api';

// Aligné sur UpdateUserDto du back-end (enum Gender Prisma), à ceci près que
// l'e-mail en est volontairement absent : il identifie le compte et sert à la
// connexion. Le laisser modifiable sans revérification ouvrirait une prise de
// contrôle à quiconque disposerait d'une session ouverte.
const profileSchema = z.object({
  firstName: z.string().min(2, 'Min. 2 caractères'),
  lastName: z.string().min(2, 'Min. 2 caractères'),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY', '']).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Remet le formulaire sur les valeurs enregistrées. Sert à l'initialisation
  // comme au bouton « Annuler » de la maquette.
  const resetToStoredValues = useCallback(() => {
    if (!user) return;
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      // L'API renvoie un ISO datetime, l'input type=date attend YYYY-MM-DD
      birthDate: user.birthDate ? user.birthDate.slice(0, 10) : '',
      gender: (user.gender as ProfileFormData['gender']) || '',
    });
  }, [user, reset]);

  useEffect(() => {
    resetToStoredValues();
  }, [resetToStoredValues]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    setIsUpdating(true);
    try {
      // Ne pas envoyer de chaînes vides : elles échoueraient la validation
      // class-validator (IsDateString, IsEnum) côté API.
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
        birthDate: data.birthDate || undefined,
        gender: data.gender || undefined,
      };
      const response = await api.put(`/users/${user.id}`, payload);
      setUser({ ...user, ...response.data });
      toast.success('Profil mis à jour !');
    } catch (error: any) {
      // Le 409 pour e-mail déjà pris ne peut plus survenir depuis ce
      // formulaire, qui n'envoie plus l'adresse.
      const apiMessage = error?.response?.data?.message;
      const detail = Array.isArray(apiMessage) ? apiMessage[0] : apiMessage;
      toast.error(detail || 'Erreur lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-3.75rem)] bg-white py-8">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            {/* Squelette calé sur la forme réelle : un panneau, pas des lignes
                séparées, sinon la mise en page saute au chargement. */}
            <aside>
              <Skeleton className="h-56 w-full rounded-card" />
            </aside>

            {/* Main content skeleton */}
            <main>
              <Skeleton className="h-8 w-64" />

              <div className="mt-8 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-11 w-40" />
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.75rem)] bg-white py-8">
      <div className="container mx-auto px-6">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <AccountSidebar />

          {/* Main content */}
          <main>
            <h1 className="font-display text-h2 text-noir">Mes informations</h1>

            {/* Grille à deux colonnes de bout en bout, comme la maquette. Les
                champs d'adresse qu'elle montre ne sont pas repris : ils
                n'existent pas au modèle de données. */}
            <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">Prénom*</Label>
                  <Input id="firstName" {...register('firstName')} />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-700">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Nom*</Label>
                  <Input id="lastName" {...register('lastName')} />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-700">{errors.lastName.message}</p>
                  )}
                </div>

                {/* Champ en lecture seule, hors formulaire : la valeur vient du
                    store et n'est jamais soumise. */}
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email ?? ''}
                    readOnly
                    disabled
                    aria-describedby="email-hint"
                    className="cursor-not-allowed bg-cream text-stone-grey"
                  />
                  <p id="email-hint" className="mt-1 text-xs text-stone-grey">
                    Votre adresse identifie votre compte et sert à vous connecter. Écrivez-nous
                    pour la changer.
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" placeholder="06 12 34 56 78" {...register('phone')} />
                </div>

                <div>
                  <Label htmlFor="birthDate">Date de naissance</Label>
                  <Input id="birthDate" type="date" {...register('birthDate')} />
                </div>
                <div>
                  <Label htmlFor="gender">Genre</Label>
                  <select
                    id="gender"
                    className="flex h-10 w-full rounded-soft border-[1.5px] border-warm-beige bg-white px-4 py-2 font-functional text-sm text-noir transition-colors focus:border-terracotta-600 focus:outline-none"
                    {...register('gender')}
                  >
                    <option value="">Sélectionner</option>
                    <option value="MALE">Homme</option>
                    <option value="FEMALE">Femme</option>
                    <option value="OTHER">Autre</option>
                    <option value="PREFER_NOT_TO_SAY">Je préfère ne pas répondre</option>
                  </select>
                </div>
              </div>

              {/* Empilés et pleine largeur sur mobile, alignés à droite dès que
                  la place le permet : la maquette fait les deux. Côte à côte sur
                  un écran étroit, les deux boutons deviendraient trop courts
                  pour être visés au pouce. */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetToStoredValues}
                  disabled={isUpdating}
                  className="w-full sm:w-auto"
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto">
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </Button>
              </div>
            </form>

            {/* Bandeau de réassurance de la maquette. Blanc sur moss : 5.80:1. */}
            <p className="mt-6 rounded-soft bg-moss px-5 py-4 text-sm text-white">
              Vos données personnelles sont sécurisées et ne seront jamais partagées avec des
              tiers.
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
