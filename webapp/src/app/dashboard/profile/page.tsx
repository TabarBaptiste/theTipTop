'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Gift, Clock, LogOut, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/stores/auth-store';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Min. 2 caracteres'),
  lastName: z.string().min(2, 'Min. 2 caracteres'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', '']).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const sidebarLinks = [
  { name: 'Profil', href: '/dashboard/profile', icon: User },
  { name: 'Mes participations', href: '/dashboard', icon: Gift },
  { name: 'Historique gains', href: '/dashboard', icon: Clock },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuthStore();
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
        birthDate: user.birthDate || '',
        gender: (user.gender as ProfileFormData['gender']) || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true);
    try {
      await api.put('/auth/profile', data);
      toast.success('Profil mis a jour !');
    } catch {
      toast.error('Erreur lors de la mise a jour');
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta-deep" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cream py-8">
      <div className="container mx-auto px-6">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-soft px-4 py-3 text-sm font-medium transition-colors',
                  link.href === '/dashboard/profile'
                    ? 'bg-terracotta-50 text-terracotta-deep'
                    : 'text-noir hover:bg-terracotta-50/50'
                )}
              >
                <link.icon className="h-4 w-4" strokeWidth={1.5} />
                {link.name}
              </Link>
            ))}

            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-soft px-4 py-3 text-sm font-medium text-noir transition-colors hover:bg-terracotta-50/50"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              Deconnexion
            </button>

            <div className="pt-4">
              <button className="flex w-full items-center gap-3 rounded-soft px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                Supprimer le compte
              </button>
            </div>
          </aside>

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
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
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
