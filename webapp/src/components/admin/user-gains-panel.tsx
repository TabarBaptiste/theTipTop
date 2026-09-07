'use client';

import { useQuery } from '@tanstack/react-query';
import { Gift, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

const DELIVERY_METHOD_LABELS: Record<string, string> = {
  IN_STORE: 'En boutique',
  ONLINE: 'Envoyé',
};

// Réponse de GET /users/:id/gains
interface UserGain {
  id: string;
  code: string;
  prizeType: string;
  prize?: { name: string; description: string; value: string | null };
  participatedAt: string;
  prizeDelivered: boolean;
  prizeDeliveredAt: string | null;
  deliveryMethod: string | null;
}

interface UserGains {
  user: { id: string; firstName: string; lastName: string; email: string };
  data: UserGain[];
  meta: { total: number; delivered: number };
}

interface UserGainsPanelProps {
  readonly userId: string;
  readonly onClose: () => void;
}

/**
 * Historique de jeu d'un utilisateur : ses participations, le lot de chaque
 * code et l'état de la remise.
 *
 * Le compteur de la liste ne dit que le nombre de participations ; le support
 * a besoin de savoir lesquelles ont donné un lot déjà remis, sans quoi il ne
 * peut pas répondre à « j'ai gagné, je n'ai rien reçu ».
 */
export function UserGainsPanel({ userId, onClose }: UserGainsPanelProps) {
  const { data, isLoading } = useQuery<UserGains>({
    queryKey: ['user-gains', userId],
    queryFn: async () => (await api.get(`/users/${userId}/gains`)).data,
  });

  const gains = data?.data ?? [];

  return (
    <section className="mt-4 rounded-card border border-warm-beige bg-cream p-3 sm:p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-functional text-ui uppercase tracking-[2px] text-stone-grey">
            Gains et participations
          </h3>
          {data && (
            <p className="mt-1 text-sm text-ink">
              {data.meta.total} participation{data.meta.total > 1 ? 's' : ''} ·{' '}
              {data.meta.delivered} lot{data.meta.delivered > 1 ? 's' : ''} remis
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" aria-label="Fermer les gains" onClick={onClose}>
          <X className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </div>

      {isLoading && <SkeletonList count={3} />}

      {!isLoading && gains.length === 0 && (
        <p className="py-6 text-center text-sm text-stone-grey">
          Cet utilisateur n&apos;a encore aucune participation.
        </p>
      )}

      {!isLoading && gains.length > 0 && (
        <ul className="mt-3 space-y-3">
          {gains.map((gain) => (
            <li
              key={gain.id}
              className="flex flex-col gap-2 rounded-card border border-warm-beige bg-surface p-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
                  <Gift className="h-4 w-4 shrink-0 text-tea-600" strokeWidth={1.5} />
                  {gain.prize?.name ?? gain.prizeType}
                  {gain.prize?.value && (
                    <span className="text-sm font-normal text-stone-grey">
                      ({gain.prize.value})
                    </span>
                  )}
                </p>
                <p className="mt-1 truncate text-sm text-stone-grey">
                  Code {gain.code} · joué le {formatDateTime(gain.participatedAt)}
                </p>
              </div>
              <div className="text-sm sm:shrink-0 sm:text-right">
                {gain.prizeDelivered ? (
                  <>
                    <p className="text-emerald-600">✓ Remis</p>
                    {gain.prizeDeliveredAt && (
                      <p className="text-stone-grey">{formatDateTime(gain.prizeDeliveredAt)}</p>
                    )}
                    {gain.deliveryMethod && (
                      <p className="text-stone-grey">
                        {DELIVERY_METHOD_LABELS[gain.deliveryMethod] ?? gain.deliveryMethod}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-stone-grey">En attente de remise</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
