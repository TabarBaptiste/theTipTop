'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, Ticket, Gift, TrendingUp, Trophy,
  Loader2, Calendar, Download, PieChart, BarChart3,
  Mail, ShieldCheck, Scale, RefreshCw,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeliveredPrizesList } from '@/components/gains/delivered-prizes-list';
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

// GET /stats/timeline
interface TimelineStats {
  timeline: { date: string; count: number }[];
  total: number;
  average: string | number;
}

// GET /grand-prize/can-draw
interface CanDraw {
  canDraw: boolean;
  reason?: string;
  participantsCount?: number;
}

// GET /grand-prize/winner (Admin : coordonnées non masquées)
interface GrandPrizeWinner {
  drawn: boolean;
  drawnAt?: string;
  winner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  totalParticipants?: number;
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

// Segments d'export emailing. Le consentement est TOUJOURS exigé côté serveur
// (RGPD) : ces segments affinent uniquement le ciblage parmi les consentants.
const EMAILING_SEGMENTS = [
  { key: 'all', label: 'Tous les consentants', params: {} as Record<string, boolean> },
  { key: 'participants', label: 'Ont participé', params: { hasParticipated: true } },
  { key: 'inactifs', label: "N'ont pas participé", params: { hasParticipated: false } },
] as const;

type SegmentKey = (typeof EMAILING_SEGMENTS)[number]['key'];

// Rafraîchissement automatique des stats (tableau de bord « en temps réel »)
const REFETCH_INTERVAL = 30_000;

function downloadCsv(filename: string, rows: string[][]) {
  // BOM UTF-8 pour qu'Excel ouvre correctement les accents
  const csv = '\uFEFF' + rows.map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(';')).join('\r\n');
  const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Couleurs du graphique, lues sur le document.
 *
 * Recharts pose ses couleurs en attributs SVG, ou ni `var()` ni une classe
 * Tailwind ne sont resolues - d'ou les valeurs litterales qui figuraient ici.
 * Elles ne suivaient donc pas le theme : en sombre, les graduations tombaient
 * a 1,15:1 sur la carte, et la grille, restee claire, dominait la courbe.
 *
 * On lit donc les variables de theme sur `<html>`, et on relit quand
 * `data-theme` change : le panneau d'accessibilite flotte sur toutes les
 * pages, le theme peut donc basculer alors que le graphique est affiche.
 *
 * Les graduations remontent ainsi a 7,86:1, une fois `--c-terracotta-pale`
 * - dont la carte tire son fond - redefini lui aussi par le theme sombre.
 */
const COULEURS_CLAIRES = {
  graduation: 'rgb(74 70 62)',
  grille: 'rgb(232 213 176)',
  courbe: 'rgb(186 105 5)',
  surface: 'rgb(255 255 255)',
  texte: 'rgb(26 26 26)',
};

function useCouleursGraphique() {
  const [couleurs, setCouleurs] = useState(COULEURS_CLAIRES);

  useEffect(() => {
    const lire = () => {
      const style = getComputedStyle(document.documentElement);
      const canal = (nom: string, secours: string) => {
        const valeur = style.getPropertyValue(nom).trim();
        return valeur ? `rgb(${valeur})` : secours;
      };
      setCouleurs({
        graduation: canal('--c-stone-grey', COULEURS_CLAIRES.graduation),
        grille: canal('--c-warm-beige', COULEURS_CLAIRES.grille),
        courbe: canal('--c-terracotta-500', COULEURS_CLAIRES.courbe),
        surface: canal('--c-surface', COULEURS_CLAIRES.surface),
        texte: canal('--c-ink', COULEURS_CLAIRES.texte),
      });
    };

    lire();
    const observateur = new MutationObserver(lire);
    observateur.observe(document.documentElement, { attributeFilter: ['data-theme'] });
    return () => observateur.disconnect();
  }, []);

  return couleurs;
}

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [segment, setSegment] = useState<SegmentKey>('all');
  const couleurs = useCouleursGraphique();

  // Stats globales
  const { data: globalStats, isLoading: loadingGlobal } = useQuery<GlobalStats>({
    queryKey: ['admin-stats-global'],
    queryFn: async () => (await api.get('/stats')).data,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Stats par lot
  const { data: prizeStats, isLoading: loadingPrize } = useQuery<PrizeStats>({
    queryKey: ['admin-stats-prizes'],
    queryFn: async () => (await api.get('/stats/prizes')).data,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Démographiques
  const { data: demographics, isLoading: loadingDemo } = useQuery<DemographicsStats>({
    queryKey: ['admin-stats-demographics'],
    queryFn: async () => (await api.get('/stats/demographics')).data,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Évolution des participations
  const { data: timeline } = useQuery<TimelineStats>({
    queryKey: ['admin-stats-timeline'],
    queryFn: async () => (await api.get('/stats/timeline', { params: { days: 30 } })).data,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Statut du tirage au sort
  const { data: canDraw } = useQuery<CanDraw>({
    queryKey: ['admin-can-draw'],
    queryFn: async () => (await api.get('/grand-prize/can-draw')).data,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Gagnant du grand prix (coordonnées en clair, réservées à l'admin)
  const { data: grandPrizeWinner } = useQuery<GrandPrizeWinner>({
    queryKey: ['admin-grand-prize-winner'],
    queryFn: async () => (await api.get('/grand-prize/winner')).data,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Aperçu du segment emailing sélectionné (contacts consentants uniquement)
  const activeSegment = EMAILING_SEGMENTS.find((s) => s.key === segment) ?? EMAILING_SEGMENTS[0];
  const { data: emailingData, isFetching: loadingEmailing } = useQuery<EmailingData>({
    queryKey: ['admin-emailing', segment],
    queryFn: async () => (await api.get('/stats/emailing', { params: activeSegment.params })).data,
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
      queryClient.invalidateQueries({ queryKey: ['admin-grand-prize-winner'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Le tirage au sort a échoué');
    },
  });

  // Export CSV du segment consentant sélectionné
  const handleExport = () => {
    if (!emailingData) return;
    downloadCsv(`emailing-${activeSegment.key}-${Date.now()}.csv`, [
      ['Email', 'Prénom', 'Nom', 'Participations'],
      ...emailingData.users.map((u) => [
        u.email,
        u.firstName,
        u.lastName,
        String(u.participationsCount),
      ]),
    ]);
    toast.success(`${emailingData.count} contacts consentants exportés`);
  };

  const isLoading = loadingGlobal || loadingPrize || loadingDemo;

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.75rem)] flex-col items-center justify-center gap-8 bg-cream px-6">
        <div className="w-full max-w-4xl space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const tickets = globalStats?.tickets;
  const usageRate = tickets ? Number(tickets.usageRate) : 0;
  // /stats/global passe par le cache Redis : l'endpoint gagnant, lui, lit la
  // base directement et fait donc foi dès la seconde qui suit le tirage.
  const grandPrizeDrawn = grandPrizeWinner?.drawn ?? globalStats?.game.grandPrizeDrawn ?? false;

  return (
    <div className="min-h-[calc(100vh-3.75rem)] bg-surface py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-h1 text-ink">Tableau de bord Admin</h1>
            <p className="mt-2 text-stone-grey">
              Vue d&apos;ensemble du jeu-concours Thé Tip Top
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/admin/utilisateurs">
                <Users className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Gérer les utilisateurs
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-sm text-stone-grey">
              <RefreshCw
                className="h-4 w-4 animate-spin [animation-duration:3s]"
                strokeWidth={1.5}
              />
              Actualisation automatique
            </div>
          </div>
        </div>

        {/* Stats principales */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-terracotta-50 p-3">
                <Users className="h-6 w-6 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-stone-grey">Utilisateurs</p>
                <p className="text-2xl font-bold text-ink">
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
                <p className="text-2xl font-bold text-ink">
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
                <p className="text-2xl font-bold text-ink">
                  {globalStats?.prizes.delivered.toLocaleString('fr-FR')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-terracotta-100 p-3">
                <TrendingUp className="h-6 w-6 text-terracotta-700" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-stone-grey">Taux d&apos;utilisation</p>
                <p className="text-2xl font-bold text-ink">{usageRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Détail tickets distribués / utilisés */}
        {tickets && (
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-stone-grey">Tickets distribués</p>
                <p className="text-xl font-bold text-ink">
                  {tickets.distributed.toLocaleString('fr-FR')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-stone-grey">Tickets utilisés</p>
                <p className="text-xl font-bold text-ink">
                  {tickets.used.toLocaleString('fr-FR')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-stone-grey">Tickets restants</p>
                <p className="text-xl font-bold text-ink">
                  {(tickets.total - tickets.used).toLocaleString('fr-FR')}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Évolution des participations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" strokeWidth={1.5} />
              Évolution des participations
            </CardTitle>
            <CardDescription>
              30 derniers jours · {timeline?.total.toLocaleString('fr-FR') ?? 0} participations ·
              moyenne {timeline?.average ?? 0}/jour
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timeline?.timeline.length ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timeline.timeline}
                    margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="fillParticipations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={couleurs.courbe} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={couleurs.courbe} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={couleurs.grille} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d: string) => format(parseISO(d), 'dd/MM', { locale: fr })}
                      tick={{ fontSize: 11, fill: couleurs.graduation }}
                      interval="preserveStartEnd"
                      minTickGap={24}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: couleurs.graduation }}
                      width={40}
                    />
                    <Tooltip
                      labelFormatter={(d: string) =>
                        format(parseISO(d), 'EEEE d MMMM', { locale: fr })
                      }
                      formatter={(value: number) => [value, 'Participations']}
                      contentStyle={{
                        borderRadius: 8,
                        border: `1px solid ${couleurs.grille}`,
                        backgroundColor: couleurs.surface,
                        color: couleurs.texte,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={couleurs.courbe}
                      strokeWidth={2}
                      fill="url(#fillParticipations)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-stone-grey">Aucune participation sur la période.</p>
            )}
          </CardContent>
        </Card>

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
                          <span className="font-medium text-ink">{prize.label}</span>
                          <span className="text-stone-grey">
                            {prize.count.toLocaleString('fr-FR')}
                            {prize.value ? ` · ${prize.value}` : ''}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-warm-beige/50">
                          <div
                            className="h-2 rounded-full bg-terracotta-600 transition-all"
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
              <CardDescription>
                Répartition des participants gagnants (100 % des tickets sont gagnants) · RGPD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Genre */}
                <div>
                  <h4 className="mb-3 font-medium text-ink">Par genre</h4>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(demographics?.byGender ?? []).map((g) => (
                      <div key={g.gender} className="rounded-soft bg-terracotta-50 p-3 text-center">
                        <p className="text-lg font-bold text-accent">{g.count}</p>
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
                  <h4 className="mb-3 font-medium text-ink">Par tranche d&apos;âge</h4>
                  <div className="space-y-2">
                    {(demographics?.byAge ?? []).map((group) => (
                      <div key={group.range} className="flex items-center justify-between">
                        <span className="text-sm text-stone-grey">{group.range} ans</span>
                        <span className="font-medium text-ink">{group.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <DeliveredPrizesList className="lg:col-span-2" />

          {/* Module emailing - export segmenté et consentant (RGPD) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" strokeWidth={1.5} />
                Exploitation des données - Emailing
              </CardTitle>
              <CardDescription>
                Export des contacts pour vos campagnes, segmenté par comportement de participation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-start gap-2 rounded-soft bg-moss-50 p-3 text-sm text-moss">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span>
                  Conformité RGPD : seuls les contacts ayant explicitement consenti sont inclus. Les
                  non-consentants sont exclus automatiquement, quel que soit le segment.
                </span>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {EMAILING_SEGMENTS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSegment(s.key)}
                      className={`rounded-pill border px-4 py-2 text-sm transition-colors ${
                        segment === s.key
                          ? 'border-accent bg-terracotta-600 text-white'
                          : 'border-warm-beige bg-surface text-stone-grey hover:border-accent'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-stone-grey">
                    {loadingEmailing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <strong className="text-ink">
                          {emailingData?.count.toLocaleString('fr-FR') ?? 0}
                        </strong>{' '}
                        contacts consentants
                      </>
                    )}
                  </span>
                  <Button onClick={handleExport} disabled={!emailingData?.count}>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter en CSV
                  </Button>
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
                  {grandPrizeWinner?.totalParticipants ??
                    canDraw?.participantsCount ??
                    globalStats?.users.participants ??
                    0}{' '}
                  participants éligibles · 1 chance par participant
                </p>
                {grandPrizeDrawn ? (
                  <div className="space-y-3">
                    <p className="font-semibold text-moss">✓ Le tirage au sort a été effectué</p>
                    {grandPrizeWinner?.winner ? (
                      <div className="rounded-card bg-white/70 p-4 text-left">
                        <p className="text-xs uppercase tracking-wide text-stone-grey">Gagnant</p>
                        <p className="font-display text-h3 text-ink">
                          {grandPrizeWinner.winner.firstName} {grandPrizeWinner.winner.lastName}
                        </p>
                        <p className="text-sm text-stone-grey">{grandPrizeWinner.winner.email}</p>
                        {grandPrizeWinner.winner.phone && (
                          <p className="text-sm text-stone-grey">
                            {grandPrizeWinner.winner.phone}
                          </p>
                        )}
                        {grandPrizeWinner.drawnAt && (
                          <p className="mt-2 text-xs text-stone-grey">
                            Tirage du {formatDate(grandPrizeWinner.drawnAt)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-grey">
                        Coordonnées du gagnant indisponibles.
                      </p>
                    )}
                  </div>
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
                <div className="mt-2 flex items-center gap-2 text-xs text-stone-grey">
                  <Scale className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  <span>
                    Tirage effectué côté serveur, horodaté et archivé, sous le contrôle de Maître
                    Arnaud Rick, huissier de justice.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
