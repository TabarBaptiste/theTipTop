'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import coffretsImg from '@/img/coffret_boites_lavande.webp';
import { Button } from '@/components/ui/button';
import { SemisDeDoodles, type DoodlePose } from '@/components/decor/botanical-doodles';
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

// Le panneau vert n'avait que du texte. Ces botaniques le meublent sans y
// mettre de photo, dans le prolongement des lisieres du hero.
//
// Deux regimes d'opacite, dictes par le contraste. Le texte du panneau est
// blanc sur le vert mousse, a 5,80:1. Un trait blanc pose derriere lui eclaire
// le fond localement : a 0,10 le rapport tient encore a 4,66:1, a 0,20 il
// tombe a 3,79:1. Les doodles qui debordent hors de la colonne de texte -
// ceux qui sortent par la droite, et ceux du bas sous le bouton - peuvent donc
// monter a 0,16 ; ceux qui la traversent restent a 0,10.
const DOODLES_GRAND_PRIX: DoodlePose[] = [
  { doodle: 'feuille', haut: 10, gauche: 99, taille: 130, rotation: 24, opacite: 0.16 },
  { doodle: 'brindille', haut: 58, gauche: 101, taille: 120, rotation: -14, opacite: 0.16 },
  { doodle: 'camomille', haut: 96, gauche: 92, taille: 84, rotation: 20, opacite: 0.16 },
  { doodle: 'anis', haut: 97, gauche: 8, taille: 76, rotation: 10, opacite: 0.16 },
  { doodle: 'baies', haut: 33, gauche: 84, taille: 54, rotation: -26, opacite: 0.08 },
  { doodle: 'feuille', haut: 4, gauche: 62, taille: 46, rotation: -30, opacite: 0.1 },
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

  const drawResultOrCallToAction = data?.drawn ? (
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
          </strong>, qui remporte un an de thé.
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
    <div className="grid lg:min-h-[29.1875rem] lg:grid-cols-2">
      <div className="relative h-64 md:h-96 lg:h-auto">
        <Image
          src={coffretsImg}
          alt="Coffrets de thés Thé Tip Top"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="photo-attenuee object-cover"
        />
      </div>

      <div className="relative flex flex-col overflow-hidden bg-moss-panel px-6 pb-14 pt-9 text-white md:px-11">
        <SemisDeDoodles poses={DOODLES_GRAND_PRIX} />

        {/* Le même surtitre qu'en tête de page sur la maquette : c'est le
            fil qui relie le hero au grand prix, et non deux annonces
            distinctes. */}
        <p className="relative font-functional text-[0.625rem] font-bold uppercase leading-[0.9375rem] tracking-[2px] text-white">
          Jeu concours exclusif
        </p>

        {/* La valeur du lot appartient au titre sur la maquette. Sortie en
            pastille, elle se lisait comme un prix de vente accolé à
            l'annonce plutot que comme son estimation. */}
        <h2 className="relative mt-5 font-display text-display text-white">
          Un an de thé à gagner d&apos;une valeur de 360&nbsp;€
        </h2>

        <p className="relative mt-5 text-body leading-[1.53125rem] text-white">
          Au-delà du lot garanti par votre ticket, chaque participation vous inscrit
          automatiquement au tirage au sort final. Rien de plus à faire.
        </p>

        <ul className="relative mt-5 list-disc space-y-0 pl-[21px] text-body leading-[1.53125rem] text-white">
          {ATOUTS.map((texte) => (
            <li key={texte}>{texte}</li>
          ))}
        </ul>

        <div className="relative mt-12 flex flex-col items-center gap-3">
          <Button asChild size="xl" className="w-full md:w-auto">
            <Link href="/participate">Participer au tirage</Link>
          </Button>
          {showParticipants && (
            <p className="text-[0.6875rem] text-white/70">
              Déjà {participants.toLocaleString('fr-FR')} participants au tirage
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section id="grand-prize" className="bg-noir text-white">
      {isLoading ? (
        /* Meme silhouette que la section chargee : deux moities, la photo a
           gauche et le panneau vert a droite, avec sa hauteur minimale. Le
           squelette rendait une colonne etroite centree sur le fond noir,
           heritee d'une version anterieure - la page sautait d'un bloc au
           chargement. */
        <div className="grid lg:min-h-[29.1875rem] lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-none bg-surface/5 md:h-96 lg:h-auto" />

          <div className="flex flex-col bg-moss-panel px-6 pb-14 pt-9 md:px-11">
            <Skeleton className="h-[0.9375rem] w-40 bg-surface/20" />
            <Skeleton className="mt-5 h-9 w-4/5 bg-surface/20" />
            <Skeleton className="mt-2 h-9 w-2/5 bg-surface/20" />

            <div className="mt-5 flex flex-col gap-2">
              <Skeleton className="h-4 w-full bg-surface/20" />
              <Skeleton className="h-4 w-11/12 bg-surface/20" />
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <Skeleton className="h-4 w-10/12 bg-surface/20" />
              <Skeleton className="h-4 w-11/12 bg-surface/20" />
              <Skeleton className="h-4 w-9/12 bg-surface/20" />
            </div>

            <div className="mt-12 flex justify-center">
              <Skeleton className="h-16 w-full rounded-full bg-surface/20 md:w-[260px]" />
            </div>
          </div>
        </div>
      ) : (
        drawResultOrCallToAction
      )}
    </section>
  );
}
