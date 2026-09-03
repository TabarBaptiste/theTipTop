'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
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

const PAGE_SIZE = 20;

// Réponse de GET /users/search : le strict nécessaire pour identifier une
// personne au comptoir.
interface ClientMatch {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  _count: { participations: number };
}

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

  // Deux états distincts : la saisie en cours, et le terme effectivement
  // soumis. Interroger l'API à chaque frappe multiplierait les requêtes sur une
  // recherche qui balaie trois colonnes.
  const [terme, setTerme] = useState('');
  const [clientQuery, setClientQuery] = useState('');

  const { data: clientResults, isFetching: clientsLoading } = useQuery<{
    data: ClientMatch[];
    total: number;
  }>({
    queryKey: ['client-search', clientQuery],
    queryFn: async () => (await api.get('/users/search', { params: { q: clientQuery } })).data,
    // Le service refuse déjà les termes trop courts ; ne pas l'appeler du tout
    // évite un aller-retour inutile.
    enabled: clientQuery.trim().length >= 2,
  });

  const clients = clientResults?.data ?? [];
  const clientTotal = clientResults?.total ?? 0;

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
      setTerme('');
      setClientQuery('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la remise');
    },
  });

  // Un code fait dix caracteres alphanumeriques, sans espace ni arobase. Une
  // saisie de dix lettres pouvant aussi etre un nom, les deux recherches
  // partent dans ce cas plutot que d'arbitrer a la place de l'employe.
  const ressembleAUnCode = (valeur: string) => /^[A-Za-z0-9]{10}$/.test(valeur);

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const valeur = terme.trim();
    if (valeur.length < 2) return;

    setSearchResult(null);

    if (ressembleAUnCode(valeur)) {
      searchMutation.mutate(valeur.toUpperCase());
    }
    setClientQuery(valeur);
  };

  return (
    <div className="min-h-[calc(100vh-3.75rem)] bg-cream py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink">
            Espace Employé
          </h1>
          <p className="mt-2 text-stone-grey">
            Gérez la remise des lots aux participants
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recherche unique.

              L'employé au comptoir n'a qu'une tâche : retrouver le lot d'un
              client. Le code et le nom ne sont que deux portes vers ce même
              but. Deux blocs distincts l'obligeaient à choisir sa porte avant
              de chercher, c'est-à-dire à porter une distinction qui relève de
              notre implémentation et non de son métier - alors qu'il sait
              seulement ce que le client lui tend.

              Un champ unique donc, et c'est la saisie qui décide : ce qui a la
              forme d'un code interroge le ticket, le reste cherche parmi les
              clients. Une saisie de dix lettres pouvant être l'un ou l'autre,
              les deux recherches partent alors et les deux résultats
              s'affichent. */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Rechercher
              </CardTitle>
              <CardDescription>
                Un code de ticket, ou le nom, prénom ou e-mail du client s&apos;il ne l&apos;a pas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form noValidate onSubmit={onSearch} className="space-y-2">
                <Label htmlFor="recherche">Code, nom ou e-mail</Label>
                <div className="flex gap-2">
                  <Input
                    id="recherche"
                    placeholder="ABC123DEF4, Dupont, jean@email.fr…"
                    className="flex-1"
                    value={terme}
                    onChange={(e) => setTerme(e.target.value)}
                  />
                  <Button
                    type="submit"
                    disabled={terme.trim().length < 2 || searchMutation.isPending}
                  >
                    {searchMutation.isPending || clientsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-stone-grey">
                  Un code comporte dix caractères. Toute autre saisie est cherchée parmi les
                  clients.
                </p>
              </form>

              {/* Résultat de recherche */}
              {searchResult && (
                <div className="mt-6 rounded-lg border p-4">
                  {searchResult.participation ? (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-stone-grey" />
                            <span className="font-medium">
                              {searchResult.participation.user.firstName}{' '}
                              {searchResult.participation.user.lastName}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-stone-grey">
                            {searchResult.participation.user.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-stone-grey">
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
                      <p className="text-sm text-stone-grey">
                        Ce code existe mais n&apos;a pas encore été utilisé par un client.
                      </p>
                      <p className="mt-1 text-sm font-medium text-tea-600">
                        Lot associé : {searchResult.ticket.prize.name} ({searchResult.ticket.prize.value})
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Clients correspondants, sous le ticket : les deux reponses a
                  une meme recherche se lisent d'affilee. */}
              {clientQuery && !clientsLoading && (
                <div className="mt-6">
                  {clients.length === 0 ? (
                    !searchResult && (
                      <p className="text-sm text-stone-grey">
                        Aucun résultat pour « {clientQuery} ».
                      </p>
                    )
                  ) : (
                    <>
                      <h3 className="font-functional text-ui uppercase tracking-[2px] text-stone-grey">
                        Clients correspondants
                      </h3>
                      <ul className="mt-3 space-y-3">
                        {clients.map((client) => (
                          <li
                            key={client.id}
                            className="flex items-center justify-between rounded-lg border border-gold-400 bg-surface p-3"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">
                                {client.firstName} {client.lastName}
                              </p>
                              <p className="truncate text-sm text-stone-grey">{client.email}</p>
                            </div>
                            <p className="ml-4 shrink-0 text-sm text-stone-grey">
                              {client._count.participations}{' '}
                              {client._count.participations > 1 ? 'participations' : 'participation'}
                            </p>
                          </li>
                        ))}
                      </ul>

                      {clientTotal > clients.length && (
                        <p className="mt-3 text-sm text-stone-grey">
                          {clients.length} résultats affichés sur {clientTotal}. Affinez votre
                          recherche.
                        </p>
                      )}
                    </>
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
                      // Fond blanc au repos, et non seulement au survol : sans
                      // lui, la carte se confondait avec le fond de la liste et
                      // ne se distinguait qu'au passage de la souris - donc
                      // jamais sur un écran tactile.
                      className="flex items-center justify-between rounded-lg border border-gold-400 bg-surface p-3 hover:bg-cream"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {delivery.user.firstName} {delivery.user.lastName}
                        </p>
                        <p className="text-sm text-stone-grey">
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
                  <p className="mt-4 text-stone-grey">
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
