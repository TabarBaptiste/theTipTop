'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Ticket, Gift, Trophy, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/stores/auth-store';
import { AccountSidebar } from '@/components/dashboard/account-sidebar';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

// Aligné sur la réponse réelle de GET /participations/me (structure plate)
interface Participation {
  id: string;
  code: string;
  prizeType: string;
  prize: {
    name: string;
    description: string;
    value: string;
  };
  participatedAt: string;
  prizeDelivered: boolean;
  prizeDeliveredAt: string | null;
  deliveryMethod: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch participations
  const { data: participations, isLoading } = useQuery<Participation[]>({
    queryKey: ['participations'],
    queryFn: async () => {
      const response = await api.get('/participations/me');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-cream py-8">
        <div className="container mx-auto px-4">
          {/* Squelette cale sur la forme reelle, barre laterale comprise : sans
              elle, la mise en page sauterait d'une colonne a deux au moment ou
              les donnees arrivent. */}
          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            <aside>
              <Skeleton className="h-56 w-full rounded-card" />
            </aside>

            <main>
              {/* Header */}
              <div className="mb-8">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="mt-2 h-4 w-80" />
              </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-white">
                <CardContent className="flex items-center gap-4 p-6">
                  <Skeleton className="h-12 w-12 rounded-card" />
                  <div>
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="mt-2 h-6 w-10" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA to participate */}
          <Card className="mb-8">
            <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
              <div>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="mt-2 h-4 w-48" />
              </div>
              <Skeleton className="h-10 w-32 rounded-full" />
            </CardContent>
          </Card>

          {/* Participations List */}
          <Card className="bg-white">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-4 w-72" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-soft border border-warm-beige p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-9 w-9 rounded-soft" />
                      <div>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="mt-2 h-3 w-24" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="ml-auto h-4 w-12" />
                      <Skeleton className="ml-auto mt-2 h-3 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
            </main>
          </div>
        </div>
      </div>
    );
  }

  const totalParticipations = participations?.length || 0;
  const pendingPrizes = participations?.filter((p) => !p.prizeDelivered).length || 0;
  const deliveredPrizes = participations?.filter((p) => p.prizeDelivered).length || 0;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-cream py-8">
      <div className="container mx-auto px-4">
        {/* Meme gabarit que /dashboard/profile et /dashboard/settings : cette
            page etait la seule de l'espace personnel sans sa navigation, ce que
            compensait un bouton « Mon profil » greffe sur le titre. */}
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <AccountSidebar />

          <main>
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-h1 text-noir">
                Bonjour, {user?.firstName} !
              </h1>
              <p className="mt-2 text-stone-grey">
                Bienvenue dans votre espace personnel Thé Tip Top
              </p>
            </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="bg-white">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-card bg-terracotta-50 p-3">
                <Ticket className="h-6 w-6 text-terracotta-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-stone-grey">Participations</p>
                <p className="text-2xl font-bold text-noir">{totalParticipations}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="flex items-center gap-4 p-6">
              {/* gold-800 et non gold-600 : ce dernier ne donne que 2.35:1 sur
                  la pastille, sous le minimum de 3:1 exige pour un pictogramme. */}
              <div className="rounded-card bg-gold-100 p-3">
                <Gift className="h-6 w-6 text-gold-800" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-stone-grey">Lots à récupérer</p>
                <p className="text-2xl font-bold text-noir">{pendingPrizes}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-card bg-moss-50 p-3">
                <Trophy className="h-6 w-6 text-moss" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-stone-grey">Lots récupérés</p>
                <p className="text-2xl font-bold text-noir">{deliveredPrizes}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA to participate.
            Seule carte a garder la teinte native de Card : sur une page ou tout
            le reste est blanc, c'est ce qui la designe comme l'action a mener. */}
        <Card className="mb-8">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
            <div>
              <h2 className="font-display text-h3 text-noir">
                Vous avez un code de participation ?
              </h2>
              <p className="text-stone-grey">
                Entrez-le maintenant pour découvrir votre lot !
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/participate">
                Participer
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Participations List */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Mes participations</CardTitle>
            <CardDescription>
              Historique de vos participations au jeu-concours
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-soft border border-warm-beige p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-9 w-9 rounded-soft" />
                      <div>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="mt-2 h-3 w-24" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="ml-auto h-4 w-12" />
                      <Skeleton className="ml-auto mt-2 h-3 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            ) : participations && participations.length > 0 ? (
              <div className="space-y-4">
                {participations.map((participation) => (
                  <div
                    key={participation.id}
                    className="flex items-center justify-between rounded-soft border border-warm-beige p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-soft p-2 ${
                          participation.prizeDelivered
                            ? 'bg-moss-50'
                            : 'bg-gold-100'
                        }`}
                      >
                        <Gift
                          strokeWidth={1.5}
                          className={`h-5 w-5 ${
                            participation.prizeDelivered
                              ? 'text-moss'
                              : 'text-gold-800'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-noir">
                          {participation.prize.name}
                        </p>
                        <p className="text-sm text-stone-grey">
                          Code : {participation.code}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {/* terracotta-600 et non deep : #BA6905 plafonne a 4.11:1
                          sur blanc, sous le seuil AA pour ce corps de texte. */}
                      <p className="font-medium text-terracotta-600">
                        {participation.prize.value}
                      </p>
                      <p className="text-sm">
                        {participation.prizeDelivered ? (
                          <span className="text-moss">
                            ✓ Récupéré le {formatDate(participation.prizeDeliveredAt!)}
                          </span>
                        ) : (
                          <span className="text-gold-800">
                            À récupérer en boutique
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Ticket className="mx-auto h-12 w-12 text-warm-beige" strokeWidth={1.5} />
                <p className="mt-4 text-stone-grey">
                  Vous n&apos;avez pas encore participé au jeu-concours.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/participate">Participer maintenant</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
