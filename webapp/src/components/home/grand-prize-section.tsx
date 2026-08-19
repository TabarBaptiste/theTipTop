'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Scale, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

// En dessous de ce seuil, le compteur dessert l'argument qu'il est censé
// servir : « 2 participants » décourage au lieu de rassurer. On l'affiche
// seulement quand le nombre parle de lui-même.
const SOCIAL_PROOF_THRESHOLD = 50;

interface GrandPrizeInfo {
  drawn: boolean;
  participantsCount?: number;
  totalParticipants?: number;
  winner?: { firstName: string; lastName: string } | null;
  drawnAt?: string;
}

export function GrandPrizeSection() {
  const { data, isLoading } = useQuery<GrandPrizeInfo>({
    queryKey: ['grand-prize'],
    queryFn: async () => (await api.get('/grand-prize')).data,
    // Le tirage n'a lieu qu'une fois : inutile de réinterroger l'API à chaque
    // montage du composant.
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const participants = data?.participantsCount ?? data?.totalParticipants ?? 0;
  const showParticipants = participants >= SOCIAL_PROOF_THRESHOLD;

  return (
    <section id="grand-prize" className="bg-noir py-16 text-white md:py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-functional text-ui uppercase tracking-[2px] text-gold-500">
            Tirage au sort final
          </p>

          {isLoading ? (
            <div className="mt-6 flex flex-col items-center gap-4">
              <Skeleton className="h-12 w-64 bg-white/10" />
              <Skeleton className="h-4 w-80 bg-white/10" />
            </div>
          ) : data?.drawn ? (
            // Après le tirage, annoncer « à gagner » serait faux. La section
            // bascule sur le résultat, ce qui referme l'opération et prouve
            // qu'elle a bien eu lieu.
            <>
              <h2 className="mt-4 font-display text-h1 text-white">
                Le grand prix a trouvé son gagnant
              </h2>
              {data.winner && (
                <p className="mt-4 text-lg text-white/80">
                  Félicitations à{' '}
                  <strong className="text-gold-500">
                    {data.winner.firstName} {data.winner.lastName}
                  </strong>
                  , qui remporte un an de thé.
                </p>
              )}
              <p className="mt-4 text-sm text-white/60">
                Tirage effectué sous le contrôle de Maître Arnaud Rick, huissier de justice
                {data.totalParticipants
                  ? `, parmi ${data.totalParticipants.toLocaleString('fr-FR')} participants.`
                  : '.'}
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-4 font-display text-h1 text-white">
                Un an de thé à gagner
              </h2>
              <p className="mt-3 font-functional text-3xl font-bold text-gold-500">360 €</p>

              <p className="mt-6 text-base leading-relaxed text-white/80">
                Au-delà du lot garanti par votre ticket, chaque participation vous inscrit
                <strong className="text-white"> automatiquement </strong>
                au tirage au sort final. Rien de plus à faire.
              </p>

              <div className="mt-10 grid gap-6 text-left sm:grid-cols-3">
                <div className="flex gap-3">
                  <Sparkles className="h-5 w-5 shrink-0 text-gold-500" strokeWidth={1.5} />
                  <p className="text-sm leading-relaxed text-white/70">
                    Inscription automatique dès votre première participation
                  </p>
                </div>
                <div className="flex gap-3">
                  <Users className="h-5 w-5 shrink-0 text-gold-500" strokeWidth={1.5} />
                  <p className="text-sm leading-relaxed text-white/70">
                    Une chance par personne, quel que soit le nombre de codes saisis
                  </p>
                </div>
                <div className="flex gap-3">
                  <Scale className="h-5 w-5 shrink-0 text-gold-500" strokeWidth={1.5} />
                  <p className="text-sm leading-relaxed text-white/70">
                    Tirage sous le contrôle de Maître Arnaud Rick, huissier de justice
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-col items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/participate">Participer</Link>
                </Button>
                {showParticipants && (
                  <p className="text-xs text-white/50">
                    Déjà {participants.toLocaleString('fr-FR')} participants au tirage
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
