'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StaticImageData } from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import infuseurPremiumImg from '@/img/infuseur_premium.webp';
import boite100gDetoxImg from '@/img/boite_100g_detox.webp';
import boite100gSignatureImg from '@/img/boite_100g_signature.webp';
import coffret39Img from '@/img/coffret_decouverte_39.webp';
import coffret69Img from '@/img/coffret_decouverte_69.webp';
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
 * Ambiance de chaque lot : un dégradé sombre vers medium, plus un halo qui
 * éclaire le fond derrière le visuel détouré.
 *
 * Les cinq familles viennent de la charte - terracotta, mousse, or, noir. Les
 * valeurs sont prises dans le bas de chaque famille : le point le plus clair du
 * fond, halo compris, reste sous une luminance de 0,18, seuil en dessous duquel
 * le texte blanc garde ses 4,5:1 (WCAG AA). Éclaircir un de ces dégradés sans
 * refaire ce calcul rendrait la description illisible.
 */
interface Ambiance {
  de: string;
  a: string;
  halo: string;
}

// L'attribution suit la couleur du produit, pas l'ordre des lots : la boîte
// détox est vert sauge et disparaissait sur le dégradé mousse, qui accueille
// mieux le carton kraft du coffret découverte.
const AMBIANCES: Record<string, Ambiance> = {
  INFUSER: { de: '#5A3202', a: '#8B4D03', halo: '#C8923A' },
  TEA_DETOX: { de: '#141414', a: '#332A20', halo: '#7A6647' },
  TEA_SIGNATURE: { de: '#3D2F18', a: '#5F4B2A', halo: '#C9A96E' },
  GIFT_BOX_39: { de: '#2C3420', a: '#4A5730', halo: '#8FA06A' },
  GIFT_BOX_69: { de: '#46210C', a: '#7A3D14', halo: '#C76C3A' },
};

// Un lot ajouté en base sans ambiance déclarée reste présentable : il reprend
// le terracotta de la marque plutôt que de s'afficher sur un fond vide.
const ambianceDe = (code: string): Ambiance => AMBIANCES[code] ?? AMBIANCES.INFUSER;

const degrade = ({ de, a, halo }: Ambiance) =>
  `radial-gradient(58% 54% at 62% 44%, ${halo}59 0%, transparent 70%), ` +
  `linear-gradient(155deg, ${de} 0%, ${a} 100%)`;

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

  // L'URL distante d'abord : c'est elle qui permet de changer un visuel sans
  // redéployer. L'image empaquetée reste en repli, et couvre trois cas -
  // Cloudinary non configuré, lot absent du catalogue local, ou compte
  // injoignable au moment du rendu.
  const imageSrc = activePrize?.imageUrl ?? activeImgConfig?.src ?? '';
  const imageAlt = activeImgConfig?.alt ?? activePrize?.name ?? '';

  // Le défilement boucle dans les deux sens : au dernier lot, la flèche
  // suivante ramène au premier plutôt que de se désactiver.
  const allerA = (index: number) => setActiveIndex(((index % total) + total) % total);

  return (
    <section id="prizes" className="border-b border-section-line bg-white pb-0 pt-7">
      <div className="container mx-auto px-6 text-center">
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

      {/* Un lot à la fois sur une scène pleine largeur : le fond prend la
          couleur du lot affiché et se fond dans la suivante au changement, le
          visuel détouré flottant par-dessus. La grille des cinq lots ne
          laissait de place ni aux photos ni aux descriptions. */}
      <div className="relative mt-14 overflow-hidden bg-[#5A3202]">
        {isLoading ? (
          <div className="container mx-auto grid items-center gap-10 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:py-20">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10 w-2/3 bg-white/15" />
              <Skeleton className="h-4 w-full bg-white/15" />
              <Skeleton className="h-4 w-5/6 bg-white/15" />
            </div>
            <Skeleton className="h-64 w-full bg-white/10 lg:h-96" />
          </div>
        ) : activePrize && prizes ? (
          <>
            {/* Un calque par ambiance, superposés, seul l'actif étant opaque :
                le navigateur ne sait pas interpoler deux dégradés, un fondu
                entre calques est le seul moyen d'obtenir la transition. */}
            <div aria-hidden="true" className="absolute inset-0">
              {prizes.map((prize, i) => (
                <div
                  key={prize.code}
                  className="absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none"
                  style={{
                    backgroundImage: degrade(ambianceDe(prize.code)),
                    opacity: i === activeIndex ? 1 : 0,
                  }}
                />
              ))}
            </div>

            <div className="container relative mx-auto grid items-center gap-10 px-6 pb-8 pt-16 text-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_auto] lg:gap-12 lg:pt-20">
              <div>
                <p className="font-functional text-[10px] font-bold uppercase leading-[15px] tracking-[2px] text-white/70">
                  Lot {String(activeIndex + 1).padStart(2, '0')} sur{' '}
                  {String(total).padStart(2, '0')}
                </p>
                {/* not-italic : la règle de base met les h3 en italique, ce qui
                    ne vaut que pour les titres d'étapes. */}
                <h3 className="mt-4 font-display text-display not-italic text-white">
                  {activePrize.name}
                </h3>
                <p className="mt-5 max-w-[52ch] text-body leading-[24.5px] text-white/90">
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
                    className="animate-lot-entree max-h-[260px] w-auto object-contain drop-shadow-[0_30px_45px_rgba(0,0,0,0.45)] md:max-h-[340px] lg:max-h-[420px]"
                  />
                )}
              </div>

              <div className="lg:text-right">
                <p className="whitespace-nowrap font-display text-[44px] font-bold leading-none text-white">
                  {activePrize.percentage}&nbsp;%
                </p>
                <p className="mt-2 font-functional text-[10px] font-bold uppercase leading-[15px] tracking-[2px] text-white/70">
                  des tickets
                </p>
                {activePrize.value && (
                  <p className="mt-6 font-functional text-[10px] font-bold uppercase leading-[15px] tracking-[2px] text-white/70">
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
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/15"
                  >
                    <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => allerA(activeIndex + 1)}
                    aria-label="Lot suivant"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/15"
                  >
                    <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {prizes.map((prize, i) => (
                    <button
                      key={prize.code}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      aria-label={`Voir le lot ${i + 1} : ${prize.name}`}
                      aria-current={i === activeIndex}
                      // La pastille ne fait que 10 px de haut ; la marge
                      // transparente porte la zone cliquable à 34 px.
                      className="group -my-3 py-3"
                    >
                      <span
                        className={cn(
                          'block h-[10px] rounded-full transition-all duration-300',
                          i === activeIndex
                            ? 'w-8 bg-white'
                            : 'w-[10px] bg-white/40 group-hover:bg-white/70'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
