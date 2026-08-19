'use client';

import { useQuery } from '@tanstack/react-query';
import { StaticImageData } from 'next/image';
import infuseurPremiumImg from '@/img/infuseur_premium.webp';
import boite100gDetoxImg from '@/img/boite_100g_detox.webp';
import boite100gSignatureImg from '@/img/boite_100g_signature.webp';
import coffret39Img from '@/img/coffret_decouverte_39.webp';
import coffret69Img from '@/img/coffret_decouverte_69.webp';
import { PrizeCard, type PrizeCategory } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
  category: PrizeCategory;
}

// Images locales par code de lot (optimisation Next.js)
// La table Prize expose `imageUrl` pour un futur CDN ; en attendant, on mappe ici.
// Chaque visuel est cadré en 4:3, comme les cartes, et pèse moins de 100 Ko.
const PRIZE_IMAGES: Record<string, PrizeImageConfig> = {
  INFUSER:       { src: infuseurPremiumImg,    alt: 'Infuseur à thé',                   category: 'accessoire' },
  TEA_DETOX:     { src: boite100gDetoxImg,     alt: 'Boîte de 100 g de thé détox',      category: 'signature'  },
  TEA_SIGNATURE: { src: boite100gSignatureImg, alt: 'Boîte de 100 g de thé signature',  category: 'signature'  },
  GIFT_BOX_39:   { src: coffret39Img,          alt: 'Coffret découverte à 39 €',        category: 'signature'  },
  GIFT_BOX_69:   { src: coffret69Img,          alt: 'Coffret découverte à 69 €',        category: 'accessoire' },
};

export function PrizesSection() {
  const { data: prizes, isLoading } = useQuery<PrizeApi[]>({
    queryKey: ['prizes'],
    queryFn: async () => {
      const response = await api.get('/tickets/prizes');
      return response.data;
    },
    staleTime: Infinity, // Les lots ne changent pas en cours de session
  });

  return (
    <section id="prizes" className="bg-white py-16 md:py-20">
      <div className="container mx-auto px-6">
        <h2 className="font-display text-h2 text-noir">
          Les lots à gagner
        </h2>
        <p className="mt-2 text-sm text-stone">
          100% des tickets sont gagnants
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col">
                <Skeleton className="aspect-[4/3] w-full rounded-card" />
                <Skeleton className="mt-md h-3 w-1/3" />
                <Skeleton className="mt-2xs h-5 w-2/3" />
                <div className="mt-md flex items-center justify-between border-t border-warm-beige pt-sm">
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-3 w-1/5" />
                </div>
              </div>
            ))}

          {prizes?.map((prize) => {
            const imgConfig = PRIZE_IMAGES[prize.code];

            // L'URL distante d'abord : c'est elle qui permet de changer un
            // visuel sans redéployer. L'image empaquetée reste en repli, et
            // couvre trois cas — Cloudinary non configuré, lot absent du
            // catalogue local, ou compte injoignable au moment du rendu.
            const imageSrc = prize.imageUrl ?? imgConfig?.src ?? '';
            const imageAlt = imgConfig?.alt ?? prize.name;

            return (
              <PrizeCard
                key={prize.code}
                image={imageSrc}
                imageAlt={imageAlt}
                category={imgConfig?.category ?? 'signature'}
                title={prize.name}
                value={prize.value}
                odds={`${prize.percentage}%`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
