'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Ticket, Gift, Trophy, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/auth-store';
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
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 animate-pulse">
            <div className="h-8 w-64 rounded bg-gray-200" />
            <div className="mt-2 h-4 w-80 rounded bg-gray-200" />
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex animate-pulse items-center gap-4 p-6">
                  <div className="h-12 w-12 rounded-xl bg-gray-200" />
                  <div>
                    <div className="h-3 w-24 rounded bg-gray-200" />
                    <div className="mt-2 h-6 w-10 rounded bg-gray-200" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA to participate */}
          <Card className="mb-8 border-tea-200 bg-gradient-to-r from-tea-50 to-emerald-50">
            <CardContent className="flex animate-pulse flex-col items-center justify-between gap-4 p-6 sm:flex-row">
              <div>
                <div className="h-6 w-64 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-48 rounded bg-gray-200" />
              </div>
              <div className="h-10 w-32 rounded-lg bg-gray-200" />
            </CardContent>
          </Card>

          {/* Participations List */}
          <Card>
            <CardHeader className="animate-pulse">
              <div className="h-5 w-40 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-72 rounded bg-gray-200" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex animate-pulse items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-lg bg-gray-200" />
                      <div>
                        <div className="h-4 w-32 rounded bg-gray-200" />
                        <div className="mt-2 h-3 w-24 rounded bg-gray-200" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="ml-auto h-4 w-12 rounded bg-gray-200" />
                      <div className="ml-auto mt-2 h-3 w-28 rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalParticipations = participations?.length || 0;
  const pendingPrizes = participations?.filter((p) => !p.prizeDelivered).length || 0;
  const deliveredPrizes = participations?.filter((p) => p.prizeDelivered).length || 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {user?.firstName} ! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Bienvenue dans votre espace personnel Thé Tip Top
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-tea-100 p-3">
                <Ticket className="h-6 w-6 text-tea-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Participations</p>
                <p className="text-2xl font-bold text-gray-900">{totalParticipations}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-amber-100 p-3">
                <Gift className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Lots à récupérer</p>
                <p className="text-2xl font-bold text-gray-900">{pendingPrizes}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-emerald-100 p-3">
                <Trophy className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Lots récupérés</p>
                <p className="text-2xl font-bold text-gray-900">{deliveredPrizes}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA to participate */}
        <Card className="mb-8 border-tea-200 bg-gradient-to-r from-tea-50 to-emerald-50">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Vous avez un code de participation ?
              </h2>
              <p className="text-gray-600">
                Entrez-le maintenant pour découvrir votre lot !
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/dashboard/participate">
                Participer
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Participations List */}
        <Card>
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
                    className="flex animate-pulse items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-lg bg-gray-200" />
                      <div>
                        <div className="h-4 w-32 rounded bg-gray-200" />
                        <div className="mt-2 h-3 w-24 rounded bg-gray-200" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="ml-auto h-4 w-12 rounded bg-gray-200" />
                      <div className="ml-auto mt-2 h-3 w-28 rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : participations && participations.length > 0 ? (
              <div className="space-y-4">
                {participations.map((participation) => (
                  <div
                    key={participation.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-lg p-2 ${
                          participation.prizeDelivered
                            ? 'bg-emerald-100'
                            : 'bg-amber-100'
                        }`}
                      >
                        <Gift
                          className={`h-5 w-5 ${
                            participation.prizeDelivered
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {participation.prize.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Code : {participation.code}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-tea-600">
                        {participation.prize.value}
                      </p>
                      <p className="text-sm text-gray-500">
                        {participation.prizeDelivered ? (
                          <span className="text-emerald-600">
                            ✓ Récupéré le {formatDate(participation.prizeDeliveredAt!)}
                          </span>
                        ) : (
                          <span className="text-amber-600">
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
                <Ticket className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">
                  Vous n&apos;avez pas encore participé au jeu-concours.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/participate">Participer maintenant</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
