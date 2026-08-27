'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Gift, Scale, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

// En dessous de ce seuil, le compteur dessert l'argument qu'il est censé
// servir : « 2 participants » décourage au lieu de rassurer. On l'affiche
// seulement quand le nombre parle de lui-même.
const SOCIAL_PROOF_THRESHOLD = 50;

// Les trois objections que soulève un tirage au sort : faut-il s'inscrire,
// faut-il multiplier les codes, et qui garantit le résultat.
const ATOUTS = [
  { Icone: Sparkles, texte: 'Inscription automatique dès votre première participation' },
  { Icone: Users, texte: 'Une chance par personne, quel que soit le nombre de codes saisis' },
  { Icone: Scale, texte: 'Tirage sous le contrôle de Maître Arnaud Rick, huissier de justice' },
];

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
    <section
      id="grand-prize"
      className="relative overflow-hidden bg-noir py-20 text-white md:py-28"
    >
      {/* Le noir était posé à plat : la section la plus importante de la page
          n'avait aucune profondeur. Ce halo doré la centre sur le titre sans
          rien ajouter à lire. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/20 blur-[130px]"
      />

      <div className="relative container mx-auto px-6">
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
              <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] text-white">
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
              <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] text-white">
                Un an de thé à gagner
              </h2>
              {/* « 360 € » en gros chiffres nus sous le titre se lisait comme
                  un prix de vente. En pastille, la somme redevient ce qu'elle
                  est : l'estimation du lot. */}
              <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-5 py-2 font-functional text-sm font-bold uppercase tracking-[2px] text-gold-400">
                <Gift className="h-4 w-4" strokeWidth={1.5} />
                Une valeur de 360 €
              </p>

              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/80">
                Au-delà du lot garanti par votre ticket, chaque participation vous inscrit
                <strong className="text-white"> automatiquement </strong>
                au tirage au sort final. Rien de plus à faire.
              </p>

              {/* Icône et texte flottaient sur le fond noir, sans rien qui les
                  rattache. Chaque argument tient maintenant dans sa surface. */}
              <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
                {ATOUTS.map(({ Icone, texte }) => (
                  <div
                    key={texte}
                    className="rounded-card border border-white/10 bg-white/[0.04] p-5"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/15">
                      <Icone className="h-5 w-5 text-gold-400" strokeWidth={1.5} />
                    </span>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">{texte}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 flex flex-col items-center gap-4">
                <Button asChild size="xl">
                  <Link href="/participate">Participer au tirage</Link>
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
