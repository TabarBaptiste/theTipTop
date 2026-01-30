'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Gift, CheckCircle, Loader2, Package, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { getPrizeName, getPrizeValue, formatDateTime } from '@/lib/utils';

const searchSchema = z.object({
  code: z.string().length(10, 'Le code doit contenir 10 caractères'),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface PendingDelivery {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  ticket: {
    code: string;
    prizeType: string;
  };
  createdAt: string;
}

export default function EmployeePage() {
  const queryClient = useQueryClient();
  const [searchResult, setSearchResult] = useState<PendingDelivery | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  });

  // Récupérer les lots en attente
  const { data: pendingDeliveries, isLoading } = useQuery<PendingDelivery[]>({
    queryKey: ['pending-deliveries'],
    queryFn: async () => {
      const response = await api.get('/gains/pending');
      return response.data;
    },
  });

  // Recherche par code
  const searchMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await api.get(`/gains/by-code/${code}`);
      return response.data;
    },
    onSuccess: (data) => {
      setSearchResult(data);
      if (data.deliveredAt) {
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
      const response = await api.post(`/gains/${participationId}/deliver`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Lot remis avec succès !');
      queryClient.invalidateQueries({ queryKey: ['pending-deliveries'] });
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
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
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
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {searchResult.user.firstName} {searchResult.user.lastName}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchResult.user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Code: {searchResult.ticket.code}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-tea-50 p-4">
                    <div className="flex items-center gap-3">
                      <Gift className="h-8 w-8 text-tea-600" />
                      <div>
                        <p className="font-semibold text-tea-800">
                          {getPrizeName(searchResult.ticket.prizeType)}
                        </p>
                        <p className="text-sm text-tea-600">
                          Valeur: {getPrizeValue(searchResult.ticket.prizeType)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="mt-4 w-full"
                    onClick={() => deliverMutation.mutate(searchResult.id)}
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
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-tea-600" />
                </div>
              ) : pendingDeliveries && pendingDeliveries.length > 0 ? (
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
                          {delivery.ticket.code}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-medium text-tea-600">
                          {getPrizeName(delivery.ticket.prizeType)}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
