'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StaticImageData } from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import infuseurPremiumImg from '@/img/infuseur_premium.webp';
import boite100gDetoxImg from '@/img/boite_100g_detox.webp';
import boite100gSignatureImg from '@/img/boite_100g_signature.webp';
import coffret39Img from '@/img/coffret_decouverte_39.webp';
import coffret69Img from '@/img/coffret_decouverte_69.webp';
import { SemisDeDoodles, type DoodlePose } from '@/components/decor/botanical-doodles';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface PrizeApi {
  code: string;
  name: string;
  description: string;
  imageUrl: string | null;
  value: string | null;
  percentage: number;
  displayOrder: number;
}

// Interface pour typer proprement la configuration locale d'une image
interface PrizeImageConfig {
  src: StaticImageData | string;
  alt: string;
}

// Images locales par code de lot (optimisation Next.js)
// La table Prize expose `imageUrl` pour un futur CDN ; en attendant, on mappe ici.
const PRIZE_IMAGES: Record<string, PrizeImageConfig> = {
  INFUSER: { src: infuseurPremiumImg, alt: 'Infuseur à thé' },
  TEA_DETOX: { src: boite100gDetoxImg, alt: 'Boîte de 100 g de thé détox' },
  TEA_SIGNATURE: { src: boite100gSignatureImg, alt: 'Boîte de 100 g de thé signature' },
  GIFT_BOX_39: { src: coffret39Img, alt: 'Coffret découverte à 39 €' },
  GIFT_BOX_69: { src: coffret69Img, alt: 'Coffret découverte à 69 €' },
};

/**
 * Fond de la section, par lot.
 *
 * Les cinq teintes viennent de la charte - beige chaud, or, terracotta pâle,
 * mousse clair - et non de dégradés sombres : la page est écrite sur crème et
 * blanc, un panneau saturé y faisait tache. Chaque lot reçoit la teinte sur
 * laquelle son visuel se détache le mieux : l'infuseur, tout en porcelaine
 * claire et chrome, prend la plus soutenue ; la boîte détox, vert sauge, part
 * sur le rose du terracotta pâle.
 *
 * Le noir du texte reste au-dessus de 10:1 sur les cinq.
 */
const AMBIANCES: Record<string, string> = {
  INFUSER: '#DCCB95',
  TEA_DETOX: '#F2E0D0',
  TEA_SIGNATURE: '#E8D5B0',
  GIFT_BOX_39: '#E0E8D0',
  GIFT_BOX_69: '#F5E9D0',
};

// Un lot ajoute en base sans teinte declaree reste presentable : il reprend le
// beige de la marque plutot que de s'afficher sur un fond vide.
const ambianceDe = (code: string): string => AMBIANCES[code] ?? AMBIANCES.INFUSER;

// Les botaniques entourent le visuel comme les grains de cafe de la reference :
// posees autour du produit, jamais dessus. En vert mousse a un tiers
// d'opacite, le noir du texte reste au-dessus de 7:1 meme la ou un trait passe
// derriere lui.
const DOODLES_LOTS: DoodlePose[] = [
  { doodle: 'feuille', haut: 30, gauche: 34, taille: 74, rotation: -22, opacite: 0.35 },
  { doodle: 'anis', haut: 34, gauche: 67, taille: 64, rotation: 12, opacite: 0.3 },
  { doodle: 'baies', haut: 82, gauche: 31, taille: 70, rotation: 18, opacite: 0.28 },
  { doodle: 'brindille', haut: 86, gauche: 64, taille: 82, rotation: -8, opacite: 0.3 },
  { doodle: 'camomille', haut: 60, gauche: 95, taille: 58, rotation: 24, opacite: 0.22 },
  { doodle: 'feuille', haut: 70, gauche: 5, taille: 54, rotation: 40, opacite: 0.2 },
  // Les petits, plus pres du produit : sans eux le semis se lisait comme
  // quatre icones posees aux angles plutot que comme un eparpillement.
  { doodle: 'baies', haut: 49, gauche: 45, taille: 40, rotation: -35, opacite: 0.24 },
  { doodle: 'anis', haut: 73, gauche: 79, taille: 42, rotation: 20, opacite: 0.22 },
  { doodle: 'brindille', haut: 26, gauche: 56, taille: 46, rotation: 30, opacite: 0.2 },
  { doodle: 'feuille', haut: 55, gauche: 87, taille: 36, rotation: -50, opacite: 0.18 },
  // Deux au-dessus du titre, maintenant que le chapeau partage le fond.
  { doodle: 'camomille', haut: 9, gauche: 12, taille: 62, rotation: -18, opacite: 0.22 },
  { doodle: 'brindille', haut: 11, gauche: 89, taille: 66, rotation: 22, opacite: 0.22 },
];

/** Duree d'affichage d'un lot avant de passer au suivant, en millisecondes. */
const DUREE_PAR_LOT = 6000;

export function PrizesSection() {
  const { data: prizes, isLoading } = useQuery<PrizeApi[]>({
    queryKey: ['prizes'],
    queryFn: async () => {
      const response = await api.get('/tickets/prizes');
      return response.data;
    },
    staleTime: Infinity, // Les lots ne changent pas en cours de session
  });

  // L'onglet actif peut dépasser le nombre de lots si la liste se réduit
  // après un premier affichage : on le ramène dans les bornes plutôt que de
  // planter sur un lot inexistant.
  const [activeIndexRaw, setActiveIndex] = useState(0);
  const total = prizes?.length ?? 0;
  const activeIndex = total ? Math.min(activeIndexRaw, total - 1) : 0;
  const activePrize = prizes?.[activeIndex];
  const activeImgConfig = activePrize ? PRIZE_IMAGES[activePrize.code] : undefined;

  const [defilementActif, setDefilementActif] = useState(true);
  const [survolee, setSurvolee] = useState(false);

  /**
   * Défilement automatique.
   *
   * Il s'interrompt au survol et à la prise de focus - sans quoi le lot change
   * sous le curseur pendant qu'on lit - et définitivement dès qu'on navigue
   * soi-même : reprendre la main puis se la faire reprendre est le pire des
   * deux mondes. Le bouton de pause permet de relancer.
   *
   * Rien ne démarre pour qui a demandé moins de mouvement : le critère 2.3.3
   * vise l'animation, mais un contenu qui se substitue tout seul relève de la
   * même gêne.
   */
  useEffect(() => {
    if (!defilementActif || survolee || total < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const minuteur = setInterval(() => {
      setActiveIndex((precedent) => (Math.min(precedent, total - 1) + 1) % total);
    }, DUREE_PAR_LOT);

    return () => clearInterval(minuteur);
  }, [defilementActif, survolee, total]);

  // L'URL distante d'abord : c'est elle qui permet de changer un visuel sans
  // redéployer. L'image empaquetée reste en repli, et couvre trois cas -
  // Cloudinary non configuré, lot absent du catalogue local, ou compte
  // injoignable au moment du rendu.
  const imageSrc = activePrize?.imageUrl ?? activeImgConfig?.src ?? '';
  const imageAlt = activeImgConfig?.alt ?? activePrize?.name ?? '';

  // Le défilement boucle dans les deux sens : au dernier lot, la flèche
  // suivante ramène au premier plutôt que de se désactiver.
  const allerA = (index: number) => {
    setDefilementActif(false);
    setActiveIndex(((index % total) + total) % total);
  };

  return (
    // Le chapeau et le carrousel partagent le fond : ils étaient séparés par
    // une bande blanche, héritée de la maquette où le panneau était orange vif
    // et devait s'en détacher. Sur une teinte douce, la coupure ne faisait plus
    // que dissocier un titre de ce qu'il annonce.
    <section
      id="prizes"
      className="relative overflow-hidden border-b border-section-line pb-0 pt-16 transition-colors duration-700 ease-out motion-reduce:transition-none"
      style={{ backgroundColor: activePrize ? ambianceDe(activePrize.code) : AMBIANCES.INFUSER }}
      onMouseEnter={() => setSurvolee(true)}
      onMouseLeave={() => setSurvolee(false)}
      onFocus={() => setSurvolee(true)}
      onBlur={() => setSurvolee(false)}
    >
      <SemisDeDoodles poses={DOODLES_LOTS} className="text-moss" />

      <div className="container relative mx-auto px-6 text-center">
        <h2 className="font-display text-display text-noir">Les lots à gagner</h2>
        <div className="mx-auto max-w-[633px] text-body leading-[24.5px] text-noir">
          <p>100% des tickets sont gagnants</p>
          {/* Sans ce rappel, ces cinq lots passent pour tout ce qu'il y a à
              gagner : la section ne mentionnait pas le tirage, alors que la page
              s'organise autour de lui. */}
          <p>
            Et au-dessus de ces lots,{' '}
            <a href="#grand-prize" className="underline underline-offset-2">
              le tirage au sort d&apos;un an de thé
            </a>
            , auquel chaque participation vous inscrit.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="container relative mx-auto grid items-center gap-10 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:py-20">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-2/3 bg-noir/10" />
            <Skeleton className="h-4 w-full bg-noir/10" />
            <Skeleton className="h-4 w-5/6 bg-noir/10" />
          </div>
          <Skeleton className="h-64 w-full bg-noir/5 lg:h-96" />
        </div>
      ) : activePrize && prizes ? (
        <>
          <div className="container relative mx-auto grid items-center gap-10 px-6 pb-8 pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_auto] lg:gap-12 lg:pt-16">
            <div>
              {/* terracotta-800 et non 600 : a 10 px le seuil est de 4,5:1,
                  et le 600 tombe entre 3,08 et 4,12 selon la teinte du lot -
                  le pire etant l'or de l'infuseur. Le 800 tient de 5,58 a
                  7,48 sur les cinq fonds. */}
              <p className="font-functional text-[10px] font-bold uppercase leading-[15px] tracking-[2px] text-terracotta-800">
                Lot {String(activeIndex + 1).padStart(2, '0')} sur {String(total).padStart(2, '0')}
              </p>
              {/* not-italic : la règle de base met les h3 en italique, ce qui
                  ne vaut que pour les titres d'étapes. */}
              <h3 className="mt-4 font-display text-display not-italic text-noir">
                {activePrize.name}
              </h3>
              <p className="mt-5 max-w-[52ch] text-body leading-[24.5px] text-stone-grey">
                {activePrize.description}
              </p>
            </div>

            {/* order-first : sur mobile le visuel passe devant le texte, c'est
                lui qui annonce le lot. L'ordre du DOM garde le titre en
                premier - c'est celui que suit un lecteur d'écran. */}
            <div className="order-first flex justify-center lg:order-none">
              {imageSrc && (
                <img
                  key={activePrize.code}
                  src={typeof imageSrc === 'string' ? imageSrc : imageSrc.src}
                  alt={imageAlt}
                  className="animate-lot-entree max-h-[260px] w-auto object-contain drop-shadow-[0_20px_28px_rgba(74,70,62,0.28)] md:max-h-[340px] lg:max-h-[420px]"
                />
              )}
            </div>

            <div className="lg:text-right">
              <p className="whitespace-nowrap font-display text-[44px] font-bold leading-none text-noir">
                {activePrize.percentage}&nbsp;%
              </p>
              <p className="mt-2 font-functional text-[10px] font-bold uppercase leading-[15px] tracking-[2px] text-stone-grey">
                des tickets
              </p>
              {activePrize.value && (
                <p className="mt-6 font-functional text-[10px] font-bold uppercase leading-[15px] tracking-[2px] text-stone-grey">
                  Valeur {activePrize.value}
                </p>
              )}
            </div>
          </div>

          {total > 1 && (
            <div className="container relative mx-auto flex items-center justify-between gap-6 px-6 pb-12">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => allerA(activeIndex - 1)}
                  aria-label="Lot précédent"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-noir/25 text-noir transition-colors hover:bg-noir/5"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => allerA(activeIndex + 1)}
                  aria-label="Lot suivant"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-noir/25 text-noir transition-colors hover:bg-noir/5"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
                </button>
                {/* Le critere 2.2.2 demande un moyen d'arreter tout contenu qui
                    se met a jour seul au-dela de cinq secondes. Le survol ne
                    suffit pas : il n'existe pas pour qui navigue au clavier. */}
                <button
                  type="button"
                  onClick={() => setDefilementActif((actif) => !actif)}
                  aria-label={
                    defilementActif
                      ? 'Mettre le défilement des lots en pause'
                      : 'Reprendre le défilement des lots'
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-noir/25 text-noir transition-colors hover:bg-noir/5"
                >
                  {defilementActif ? (
                    <Pause className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <Play className="h-4 w-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>

              <div className="flex items-center">
                {prizes.map((prize, i) => (
                  <button
                    key={prize.code}
                    type="button"
                    onClick={() => allerA(i)}
                    aria-label={`Voir le lot ${i + 1} : ${prize.name}`}
                    aria-current={i === activeIndex}
                    // La pastille ne fait que 10 x 10 px. La marge transparente
                    // porte la cible a 26 x 34, au-dela du minimum de 24 px du
                    // critere 2.5.8, et c'est elle qui espace les pastilles
                    // plutot qu'un gap : deux cibles de 24 px separees de 8 px
                    // se recouvriraient, et l'exception d'espacement tomberait
                    // avec.
                    className="group -my-3 px-2 py-3"
                  >
                    <span
                      className={cn(
                        'block h-[10px] rounded-full transition-all duration-300',
                        i === activeIndex
                          ? 'w-8 bg-noir'
                          : 'w-[10px] bg-noir/25 group-hover:bg-noir/50'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
