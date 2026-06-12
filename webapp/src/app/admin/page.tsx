'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, Ticket, Gift, TrendingUp, Trophy,
  Loader2, Calendar, Download, PieChart,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

// ===========================================
// Types alignés sur les réponses réelles de l'API
// ===========================================

// GET /stats
interface GlobalStats {
  tickets: {
    total: number;
    used: number;
    distributed: number;
    available: number;
    usageRate: string | number;
  };
  users: { total: number; participants: number; conversionRate: string | number };
  participations: { total: number; averagePerUser: string | number };
  prizes: { delivered: number; pending: number; deliveryRate: string | number };
  game: {
    phase: 'not_started' | 'active' | 'claim_only' | 'ended';
    daysRemaining: number;
    claimDaysRemaining: number;
    startDate?: string;
    endDate?: string;
    claimEndDate?: string;
    grandPrizeDrawn: boolean;
  };
}

// GET /stats/prizes
interface PrizeStats {
  byType: { type: string; label: string; value: string | null; count: number }[];
  total: number;
  delivered: number;
}

// GET /stats/demographics
interface DemographicsStats {
  byGender: { gender: string; count: number }[];
  byAge: { range: string; count: number }[];
}

// GET /grand-prize/can-draw
interface CanDraw {
  canDraw: boolean;
  reason?: string;
  participantsCount?: number;
}

// GET /stats/emailing
interface EmailingData {
  count: number;
  users: { email: string; firstName: string; lastName: string; participationsCount: number }[];
}

const GENDER_LABELS: Record<string, string> = {
  MALE: 'Hommes',
  FEMALE: 'Femmes',
  OTHER: 'Autre',
  PREFER_NOT_TO_SAY: 'Non précisé',
  NON_RENSEIGNE: 'N/A',
};

function downloadCsv(filename: string, rows: string[][]) {
  // BOM UTF-8 pour qu'Excel ouvre correctement les accents
  const csv = '﻿' + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const queryClient = useQueryClient();

  // Stats globales
  const { data: globalStats, isLoading: loadingGlobal } = useQuery<GlobalStats>({
    queryKey: ['admin-stats-global'],
    queryFn: async () => (await api.get('/stats')).data,
  });

  // Stats par lot
  const { data: prizeStats, isLoading: loadingPrize } = useQuery<PrizeStats>({
    queryKey: ['admin-stats-prizes'],
    queryFn: async () => (await api.get('/stats/prizes')).data,
  });

  // Démographiques
  const { data: demographics, isLoading: loadingDemo } = useQuery<DemographicsStats>({
    queryKey: ['admin-stats-demographics'],
    queryFn: async () => (await api.get('/stats/demographics')).data,
  });

  // Statut du tirage au sort
  const { data: canDraw } = useQuery<CanDraw>({
    queryKey: ['admin-can-draw'],
    queryFn: async () => (await api.get('/grand-prize/can-draw')).data,
  });

  // Tirage au sort du grand prix
  const drawMutation = useMutation({
    mutationFn: async () => (await api.post('/grand-prize/draw')).data,
    onSuccess: (data) => {
      toast.success(
        `Tirage effectué ! Gagnant : ${data.winner?.firstName ?? ''} (${data.winner?.email ?? ''})`,
      );
      queryClient.invalidateQueries({ queryKey: ['admin-can-draw'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats-global'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Le tirage au sort a échoué');
    },
  });

  // Export CSV via GET /stats/emailing
  const handleExportData = async (type: 'participants' | 'newsletter') => {
    try {
      const params = type === 'newsletter' ? { consentEmail: true } : { hasParticipated: true };
      const { data } = await api.get<EmailingData>('/stats/emailing', { params });
      downloadCsv(`${type}-${Date.now()}.csv`, [
        ['Email', 'Prénom', 'Nom', 'Participations'],
        ...data.users.map((u) => [u.email, u.firstName, u.lastName, String(u.participationsCount)]),
      ]);
      toast.success(`${data.count} contacts exportés`);
    } catch {
      toast.error("L'export a échoué");
    }
  };

  const isLoading = loadingGlobal || loadingPrize || loadingDemo;

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-cream">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta-deep" />
      </div>
    );
  }

  const tickets = globalStats?.tickets;
  const usageRate = tickets ? Number(tickets.usageRate) : 0;
  const grandPrizeDrawn = globalStats?.game.grandPrizeDrawn ?? false;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cream py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-h1 text-noir">Tableau de bord Admin</h1>
            <p className="mt-2 text-stone-grey">
              Vue d&apos;ensemble du jeu-concours Thé Tip Top
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExportData('participants')}>
              <Download className="mr-2 h-4 w-4" />
              Export participants
            </Button>
            <Button variant="outline" onClick={() => handleExportData('newsletter')}>
              <Download className="mr-2 h-4 w-4" />
              Export newsletter
            </Button>
          </div>
        </div>

        {/* Stats principales */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-terracotta-50 p-3">
                <Users className="h-6 w-6 text-terracotta-deep" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-stone-grey">Utilisateurs</p>
                <p className="text-2xl font-bold text-noir">
                  {globalStats?.users.total.toLocaleString('fr-FR')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-moss-50 p-3">
                <Ticket className="h-6 w-6 text-moss" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-stone-grey">Participations</p>
                <p className="text-2xl font-bold text-noir">
                  {globalStats?.participations.total.toLocaleString('fr-FR')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-gold-100 p-3">
                <Gift className="h-6 w-6 text-gold-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-stone-grey">Lots remis</p>
                <p className="text-2xl font-bold text-noir">
                  {globalStats?.prizes.delivered.toLocaleString('fr-FR')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-terracotta-100 p-3">
                <TrendingUp className="h-6 w-6 text-terracotta-hover" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-stone-grey">Taux d&apos;utilisation</p>
                <p className="text-2xl font-bold text-noir">{usageRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Répartition des lots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" strokeWidth={1.5} />
                Lots gagnés par type
              </CardTitle>
              <CardDescription>
                {prizeStats?.total.toLocaleString('fr-FR') ?? 0} tickets utilisés ·{' '}
                {prizeStats?.delivered.toLocaleString('fr-FR') ?? 0} lots remis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prizeStats?.byType.length ? (
                  prizeStats.byType.map((prize) => {
                    const percent =
                      prizeStats.total > 0 ? (prize.count / prizeStats.total) * 100 : 0;
                    return (
                      <div key={prize.type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-noir">{prize.label}</span>
                          <span className="text-stone-grey">
                            {prize.count.toLocaleString('fr-FR')}
                            {prize.value ? ` · ${prize.value}` : ''}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-warm-beige/50">
                          <div
                            className="h-2 rounded-full bg-terracotta-deep transition-all"
                            style={{ width: `${percent.toFixed(1)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-stone-grey">Aucun ticket utilisé pour le moment.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Démographiques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" strokeWidth={1.5} />
                Données démographiques
              </CardTitle>
              <CardDescription>Répartition des participants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Genre */}
                <div>
                  <h4 className="mb-3 font-medium text-noir">Par genre</h4>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(demographics?.byGender ?? []).map((g) => (
                      <div key={g.gender} className="rounded-soft bg-terracotta-50 p-3 text-center">
                        <p className="text-lg font-bold text-terracotta-deep">{g.count}</p>
                        <p className="text-xs text-stone-grey">
                          {GENDER_LABELS[g.gender] ?? g.gender}
                        </p>
                      </div>
                    ))}
                    {!demographics?.byGender.length && (
                      <p className="col-span-4 text-sm text-stone-grey">Aucune donnée.</p>
                    )}
                  </div>
                </div>

                {/* Tranches d'âge */}
                <div>
                  <h4 className="mb-3 font-medium text-noir">Par tranche d&apos;âge</h4>
                  <div className="space-y-2">
                    {(demographics?.byAge ?? []).map((group) => (
                      <div key={group.range} className="flex items-center justify-between">
                        <span className="text-sm text-stone-grey">{group.range} ans</span>
                        <span className="font-medium text-noir">{group.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grand tirage */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-gold-500" strokeWidth={1.5} />
                Grand Tirage au Sort
              </CardTitle>
              <CardDescription>
                Tirage du grand prix : 1 an de thé gratuit (360€)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4 rounded-card bg-gradient-to-r from-gold-50 to-terracotta-50 p-8 text-center">
                {globalStats?.game.endDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gold-600" strokeWidth={1.5} />
                    <span className="text-stone-grey">
                      Fin du jeu : <strong>{formatDate(globalStats.game.endDate)}</strong>
                    </span>
                  </div>
                )}
                <p className="text-stone-grey">
                  {canDraw?.participantsCount ?? globalStats?.users.participants ?? 0} participants
                  éligibles
                </p>
                {grandPrizeDrawn ? (
                  <p className="font-semibold text-moss">✓ Le tirage au sort a été effectué</p>
                ) : (
                  <>
                    <Button
                      className="mt-2"
                      disabled={!canDraw?.canDraw || drawMutation.isPending}
                      onClick={() => {
                        if (window.confirm('Effectuer le tirage au sort ? Cette action est définitive.')) {
                          drawMutation.mutate();
                        }
                      }}
                    >
                      {drawMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trophy className="mr-2 h-4 w-4" />
                      )}
                      Effectuer le tirage au sort
                    </Button>
                    {!canDraw?.canDraw && canDraw?.reason && (
                      <p className="text-xs text-stone-grey">{canDraw.reason}</p>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
