'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { PackageCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonList } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

const PAGE_SIZE = 20;

const DELIVERY_METHOD_LABELS: Record<string, string> = {
  IN_STORE: 'En boutique',
  ONLINE: 'Envoyé',
};

// Réponse de GET /gains/history
interface DeliveredPrize {
  id: string;
  code: string;
  prizeType: string;
  prize?: { name: string; description: string; value: string | null };
  user: { id: string; email: string; firstName: string; lastName: string };
  prizeDeliveredAt: string | null;
  deliveredBy: string | null;
  deliveryMethod: string | null;
}

interface PaginatedDeliveries {
  data: DeliveredPrize[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

/**
 * Historique des lots remis, partagé par les espaces Employé et Admin.
 *
 * L'endpoint `/gains/history` est ouvert aux deux rôles et renvoie exactement
 * les mêmes données : une seule implémentation suffit.
 */
export function DeliveredPrizesList({ className }: { className?: string }) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedDeliveries>({
    queryKey: ['delivered-prizes', page],
    queryFn: async () =>
      (await api.get('/gains/history', { params: { page, limit: PAGE_SIZE } })).data,
    // Conserve la page précédente pendant le chargement de la suivante. Sans
    // cela, la liste se vide à chaque clic et la hauteur de la carte saute.
    placeholderData: keepPreviousData,
  });

  const deliveries = data?.data ?? [];
  const meta = data?.meta;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageCheck className="h-5 w-5" strokeWidth={1.5} />
          Lots distribués
        </CardTitle>
        <CardDescription>Historique des remises, de la plus récente à la plus ancienne</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SkeletonList count={4} />
        ) : deliveries.length === 0 ? (
          <p className="py-8 text-center text-sm text-stone-grey">
            Aucun lot n&apos;a encore été remis.
          </p>
        ) : (
          <ul className="space-y-3">
            {deliveries.map((delivery) => (
              <li
                key={delivery.id}
                className="flex items-start justify-between gap-4 rounded-soft border border-warm-beige p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-noir">
                    {delivery.user.firstName} {delivery.user.lastName}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-stone-grey">{delivery.code}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-terracotta-deep">
                    {delivery.prize?.name ?? delivery.prizeType}
                  </p>
                  {delivery.prizeDeliveredAt && (
                    <p className="mt-0.5 text-xs text-stone-grey">
                      {formatDateTime(delivery.prizeDeliveredAt)}
                    </p>
                  )}
                  <p className="text-xs text-stone-grey">
                    {delivery.deliveryMethod
                      ? (DELIVERY_METHOD_LABELS[delivery.deliveryMethod] ?? delivery.deliveryMethod)
                      : 'Méthode non précisée'}
                    {delivery.deliveredBy ? ` · ${delivery.deliveredBy}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Liste vide : le message suffit, un « 0 lots remis » le répéterait. */}
        {meta && meta.total > 0 && (
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            onPageChange={setPage}
            label="lots remis"
          />
        )}
      </CardContent>
    </Card>
  );
}
