'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Gift, CheckCircle, Loader2, Package, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonList } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { DeliveredPrizesList } from '@/components/gains/delivered-prizes-list';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

const searchSchema = z.object({
  code: z.string().length(10, 'Le code doit contenir 10 caractères'),
});

type SearchFormData = z.infer<typeof searchSchema>;

const PAGE_SIZE = 20;

// Réponse de GET /gains/pending (structure plate)
interface PendingDelivery {
  id: string;
  code: string;
  prizeType: string;
  prize: {
    name: string;
    description: string;
    value: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  participatedAt: string;
}

interface PaginatedPendingDeliveries {
  data: PendingDelivery[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// Réponse de GET /participations/by-code/:code
interface SearchResult {
  ticket: {
    code: string;
    prizeType: string;
    prize: { name: string; description: string; value: string };
    isUsed: boolean;
  };
  participation: {
    id: string;
    user: { firstName: string; lastName: string; email: string };
    participatedAt: string;
    prizeDelivered: boolean;
    prizeDeliveredAt: string | null;
    deliveryMethod: string | null;
  } | null;
}

export default function EmployeePage() {
  const queryClient = useQueryClient();
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [pendingPage, setPendingPage] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  });

  // Lots en attente. La réponse est paginée : sans page ni limite explicites,
  // l'API en renvoyait 20 et tous les suivants restaient hors d'atteinte.
  const { data: pending, isLoading } = useQuery<PaginatedPendingDeliveries>({
    queryKey: ['pending-deliveries', pendingPage],
    queryFn: async () =>
      (await api.get('/gains/pending', { params: { page: pendingPage, limit: PAGE_SIZE } })).data,
    placeholderData: keepPreviousData,
  });

  const pendingDeliveries = pending?.data ?? [];

  // Recherche par code → GET /participations/by-code/:code
  const searchMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await api.get(`/participations/by-code/${code}`);
      return response.data as SearchResult;
    },
    onSuccess: (data) => {
      setSearchResult(data);
      if (data.participation?.prizeDelivered) {
        toast.info('Ce lot a déjà été remis');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Code non trouvé');
      setSearchResult(null);
    },
  });

  // Remettre le lot
  const deliverMutation = useMutation({
    mutationFn: async (participationId: string) => {
      const response = await api.post(`/gains/${participationId}/deliver`, {
        deliveryMethod: 'IN_STORE',
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Lot remis avec succès !');
      queryClient.invalidateQueries({ queryKey: ['pending-deliveries'] });
      // Une remise fait passer le lot d'une liste à l'autre : sans cette
      // invalidation, l'historique restait figé jusqu'au rechargement.
      queryClient.invalidateQueries({ queryKey: ['delivered-prizes'] });
      setSearchResult(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la remise');
    },
  });

  const onSearch = (data: SearchFormData) => {
    searchMutation.mutate(data.code);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Espace Employé
          </h1>
          <p className="mt-2 text-gray-600">
            Gérez la remise des lots aux participants
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recherche par code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Rechercher un code
              </CardTitle>
              <CardDescription>
                Entrez le code du ticket pour vérifier et remettre le lot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSearch)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code du ticket</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      placeholder="ABC123DEF4"
                      className="flex-1 text-center tracking-wider"
                      maxLength={10}
                      {...register('code', {
                        onChange: (e) => {
                          e.target.value = e.target.value.toUpperCase();
                        },
                      })}
                    />
                    <Button type="submit" disabled={searchMutation.isPending}>
                      {searchMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.code && (
                    <p className="text-sm text-red-500">{errors.code.message}</p>
                  )}
                </div>
              </form>

              {/* Résultat de recherche */}
              {searchResult && (
                <div className="mt-6 rounded-lg border p-4">
                  {searchResult.participation ? (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                              {searchResult.participation.user.firstName}{' '}
                              {searchResult.participation.user.lastName}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {searchResult.participation.user.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Code : {searchResult.ticket.code}
                          </p>
                          {searchResult.participation.prizeDelivered && (
                            <p className="mt-1 text-xs text-emerald-600">
                              ✓ Déjà remis le{' '}
                              {formatDateTime(searchResult.participation.prizeDeliveredAt!)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 rounded-lg bg-tea-50 p-4">
                        <div className="flex items-center gap-3">
                          <Gift className="h-8 w-8 text-tea-600" />
                          <div>
                            <p className="font-semibold text-tea-800">
                              {searchResult.ticket.prize.name}
                            </p>
                            <p className="text-sm text-tea-600">
                              Valeur : {searchResult.ticket.prize.value}
                            </p>
                          </div>
                        </div>
                      </div>

                      {!searchResult.participation.prizeDelivered && (
                        <Button
                          className="mt-4 w-full"
                          onClick={() =>
                            deliverMutation.mutate(searchResult.participation!.id)
                          }
                          disabled={deliverMutation.isPending}
                        >
                          {deliverMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Remise en cours...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Confirmer la remise du lot
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-sm text-gray-500">
                        Ce code existe mais n&apos;a pas encore été utilisé par un client.
                      </p>
                      <p className="mt-1 text-sm font-medium text-tea-600">
                        Lot associé : {searchResult.ticket.prize.name} ({searchResult.ticket.prize.value})
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Liste des lots en attente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Lots en attente
              </CardTitle>
              <CardDescription>
                Liste des participants en attente de remise de leur lot
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SkeletonList count={3} />
              ) : pendingDeliveries.length > 0 ? (
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {pendingDeliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {delivery.user.firstName} {delivery.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {delivery.code}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-medium text-tea-600">
                          {delivery.prize.name}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-1"
                          onClick={() => deliverMutation.mutate(delivery.id)}
                          disabled={deliverMutation.isPending}
                        >
                          Remettre
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-emerald-300" />
                  <p className="mt-4 text-gray-500">
                    Aucun lot en attente de remise
                  </p>
                </div>
              )}

              {pending && pending.meta.total > 0 && (
                <Pagination
                  page={pending.meta.page}
                  totalPages={pending.meta.totalPages}
                  total={pending.meta.total}
                  onPageChange={setPendingPage}
                  label="lots en attente"
                />
              )}
            </CardContent>
          </Card>

          {/* Historique des remises, sur toute la largeur : une liste paginée
              respire mal dans une demi-colonne. */}
          <DeliveredPrizesList className="lg:col-span-2" />
        </div>
      </div>
    </div>
  );
}
