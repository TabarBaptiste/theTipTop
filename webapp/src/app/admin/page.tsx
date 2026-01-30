'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  Users, Ticket, Gift, TrendingUp, Trophy, 
  Loader2, Calendar, Download, PieChart 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface GlobalStats {
  totalUsers: number;
  totalParticipations: number;
  totalTicketsUsed: number;
  totalTicketsRemaining: number;
  totalDelivered: number;
  totalPending: number;
}

interface PrizeStats {
  type: string;
  total: number;
  used: number;
  delivered: number;
}

interface DemographicsStats {
  gender: { male: number; female: number; other: number; unknown: number };
  ageGroups: { [key: string]: number };
}

export default function AdminPage() {
  // Stats globales
  const { data: globalStats, isLoading: loadingGlobal } = useQuery<GlobalStats>({
    queryKey: ['admin-stats-global'],
    queryFn: async () => {
      const response = await api.get('/stats/global');
      return response.data;
    },
  });

  // Stats par lot
  const { data: prizeStats, isLoading: loadingPrize } = useQuery<PrizeStats[]>({
    queryKey: ['admin-stats-prizes'],
    queryFn: async () => {
      const response = await api.get('/stats/prizes');
      return response.data;
    },
  });

  // Démographiques
  const { data: demographics, isLoading: loadingDemo } = useQuery<DemographicsStats>({
    queryKey: ['admin-stats-demographics'],
    queryFn: async () => {
      const response = await api.get('/stats/demographics');
      return response.data;
    },
  });

  const handleExportData = async (type: string) => {
    try {
      const response = await api.get(`/stats/export/${type}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const isLoading = loadingGlobal || loadingPrize || loadingDemo;

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-tea-600" />
      </div>
    );
  }

  const participationRate = globalStats
    ? ((globalStats.totalTicketsUsed / 500000) * 100).toFixed(2)
    : '0';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de bord Admin
            </h1>
            <p className="mt-2 text-gray-600">
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
              <div className="rounded-xl bg-tea-100 p-3">
                <Users className="h-6 w-6 text-tea-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalStats?.totalUsers.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-emerald-100 p-3">
                <Ticket className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Participations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalStats?.totalParticipations.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-amber-100 p-3">
                <Gift className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Lots remis</p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalStats?.totalDelivered.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-blue-100 p-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Taux participation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {participationRate}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Répartition des lots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Répartition des lots
              </CardTitle>
              <CardDescription>
                Statistiques par type de lot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prizeStats?.map((prize) => {
                  const usagePercent = prize.total > 0 
                    ? ((prize.used / prize.total) * 100).toFixed(1)
                    : '0';
                  
                  return (
                    <div key={prize.type} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{prize.type}</span>
                        <span className="text-gray-500">
                          {prize.used.toLocaleString()} / {prize.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-tea-500 transition-all"
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{usagePercent}% utilisés</span>
                        <span>{prize.delivered} remis</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Démographiques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Données démographiques
              </CardTitle>
              <CardDescription>
                Répartition des participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Genre */}
                <div>
                  <h4 className="mb-3 font-medium text-gray-900">Par genre</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="rounded-lg bg-blue-50 p-3 text-center">
                      <p className="text-lg font-bold text-blue-600">
                        {demographics?.gender.male || 0}
                      </p>
                      <p className="text-xs text-gray-500">Hommes</p>
                    </div>
                    <div className="rounded-lg bg-pink-50 p-3 text-center">
                      <p className="text-lg font-bold text-pink-600">
                        {demographics?.gender.female || 0}
                      </p>
                      <p className="text-xs text-gray-500">Femmes</p>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-3 text-center">
                      <p className="text-lg font-bold text-purple-600">
                        {demographics?.gender.other || 0}
                      </p>
                      <p className="text-xs text-gray-500">Autre</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <p className="text-lg font-bold text-gray-600">
                        {demographics?.gender.unknown || 0}
                      </p>
                      <p className="text-xs text-gray-500">N/A</p>
                    </div>
                  </div>
                </div>

                {/* Tranches d'âge */}
                <div>
                  <h4 className="mb-3 font-medium text-gray-900">Par tranche d&apos;âge</h4>
                  <div className="space-y-2">
                    {demographics?.ageGroups && Object.entries(demographics.ageGroups).map(([group, count]) => (
                      <div key={group} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{group}</span>
                        <span className="font-medium">{count}</span>
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
                <Trophy className="h-5 w-5 text-gold-500" />
                Grand Tirage au Sort
              </CardTitle>
              <CardDescription>
                Tirage du grand prix : 1 an de thé gratuit (360€)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-gradient-to-r from-gold-50 to-amber-50 p-8 text-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gold-600" />
                  <span className="text-gray-600">
                    Date du tirage : <strong>1er mars 2025</strong>
                  </span>
                </div>
                <p className="text-gray-600">
                  {globalStats?.totalUsers || 0} participants éligibles
                </p>
                <Button disabled className="mt-2">
                  <Trophy className="mr-2 h-4 w-4" />
                  Effectuer le tirage au sort
                </Button>
                <p className="text-xs text-gray-400">
                  Le tirage sera disponible après la fin du jeu-concours
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
