'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import coffretsImg from '@/img/coffret_boites_lavande.webp';
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
  'Inscription automatique dès votre première participation',
  'Une chance par personne, quel que soit le nombre de codes saisis',
  'Tirage sous le contrôle de Maître Arnaud Rick, huissier de justice',
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
    <section id="grand-prize" className="bg-noir text-white">
      {isLoading ? (
        <div className="container mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-16 md:py-20">
          <Skeleton className="h-12 w-64 bg-white/10" />
          <Skeleton className="h-4 w-80 bg-white/10" />
        </div>
      ) : data?.drawn ? (
        <div className="container mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
          <p className="font-functional text-ui uppercase tracking-[2px] text-gold-500">
            Tirage au sort final
          </p>
          {/* Après le tirage, annoncer « à gagner » serait faux. La section
              bascule sur le résultat, ce qui referme l'opération et prouve
              qu'elle a bien eu lieu. */}
          <h2 className="mt-4 font-display text-display text-white">
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
        </div>
      ) : (
        // Deux colonnes pleine largeur, photo à gauche / panneau à droite :
        // le lot était jusque-là annoncé par du texte seul sur fond noir, sans
        // rien qui le montre.
        <div className="grid lg:min-h-[467px] lg:grid-cols-2">
          <div className="relative h-64 md:h-96 lg:h-auto">
            <Image
              src={coffretsImg}
              alt="Coffrets de thés Thé Tip Top"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col bg-moss px-6 pb-14 pt-9 md:px-11">
            {/* Le même surtitre qu'en tête de page sur la maquette : c'est le
                fil qui relie le hero au grand prix, et non deux annonces
                distinctes. */}
            <p className="font-functional text-[10px] font-bold uppercase leading-[15px] tracking-[2px] text-white">
              Jeu concours exclusif
            </p>

            {/* La valeur du lot appartient au titre sur la maquette. Sortie en
                pastille, elle se lisait comme un prix de vente accolé à
                l'annonce plutôt que comme son estimation. */}
            <h2 className="mt-5 font-display text-display text-white">
              Un an de thé à gagner d&apos;une valeur de 360&nbsp;€
            </h2>

            <p className="mt-5 text-body leading-[24.5px] text-white">
              Au-delà du lot garanti par votre ticket, chaque participation vous inscrit
              automatiquement au tirage au sort final. Rien de plus à faire.
            </p>

            <ul className="mt-5 list-disc space-y-0 pl-[21px] text-body leading-[24.5px] text-white">
              {ATOUTS.map((texte) => (
                <li key={texte}>{texte}</li>
              ))}
            </ul>

            <div className="mt-12 flex flex-col items-center gap-3">
              <Button asChild size="cta" className="w-full md:w-[246px]">
                <Link href="/participate">Participer au tirage</Link>
              </Button>
              {showParticipants && (
                <p className="text-[11px] text-white/70">
                  Déjà {participants.toLocaleString('fr-FR')} participants au tirage
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
