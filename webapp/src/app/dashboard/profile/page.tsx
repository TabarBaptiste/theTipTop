'use client';

import { useEffect, useState } from 'react';
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

// Aligné sur UpdateUserDto du back-end (enum Gender Prisma)
const profileSchema = z.object({
  firstName: z.string().min(2, 'Min. 2 caracteres'),
  lastName: z.string().min(2, 'Min. 2 caracteres'),
  email: z.string().email('Email invalide'),
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

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        // L'API renvoie un ISO datetime, l'input type=date attend YYYY-MM-DD
        birthDate: user.birthDate ? user.birthDate.slice(0, 10) : '',
        gender: (user.gender as ProfileFormData['gender']) || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    setIsUpdating(true);
    try {
      // Ne pas envoyer de chaînes vides : elles échoueraient la validation
      // class-validator (IsDateString, IsEnum) côté API.
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        birthDate: data.birthDate || undefined,
        gender: data.gender || undefined,
      };
      const response = await api.put(`/users/${user.id}`, payload);
      setUser({ ...user, ...response.data });
      toast.success('Profil mis a jour !');
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error('Cet email est deja utilise');
      } else {
        const apiMessage = error?.response?.data?.message;
        const detail = Array.isArray(apiMessage) ? apiMessage[0] : apiMessage;
        toast.error(detail || 'Erreur lors de la mise a jour');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-cream py-8">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            {/* Sidebar skeleton */}
            <aside className="space-y-1">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
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
    <div className="min-h-[calc(100vh-5rem)] bg-cream py-8">
      <div className="container mx-auto px-6">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <AccountSidebar />

          {/* Main content */}
          <main>
            <h1 className="font-display text-h2 text-noir">Mes informations</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">Prenom</Label>
                  <Input id="firstName" {...register('firstName')} />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" {...register('lastName')} />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Telephone</Label>
                  <Input id="phone" type="tel" placeholder="06 12 34 56 78" {...register('phone')} />
                </div>
                <div>
                  <Label htmlFor="birthDate">Date de naissance</Label>
                  <Input id="birthDate" type="date" {...register('birthDate')} />
                </div>
              </div>

              <div>
                <Label htmlFor="gender">Genre</Label>
                <select
                  id="gender"
                  className="flex h-10 w-full rounded-soft border-[1.5px] border-warm-beige bg-white px-4 py-2 font-functional text-sm text-noir transition-colors focus:border-terracotta-deep focus:outline-none"
                  {...register('gender')}
                >
                  <option value="">Selectionner</option>
                  <option value="MALE">Homme</option>
                  <option value="FEMALE">Femme</option>
                  <option value="OTHER">Autre</option>
                  <option value="PREFER_NOT_TO_SAY">Je prefere ne pas repondre</option>
                </select>
              </div>

              <Button type="submit" size="lg" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise a jour...
                  </>
                ) : (
                  'Mettre a jour'
                )}
              </Button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
