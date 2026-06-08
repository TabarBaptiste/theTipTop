'use client';

import { useQuery } from '@tanstack/react-query';
import { StaticImageData } from 'next/image';
import boite100gImg from '@/img/boite_100g.jpeg';
import infuseurPremiumImg from '@/img/Infuseur_premium.jpg';
import coffret5thesImg from '@/img/coffret_5_thes.jpg';
import theiereImg from '@/img/theiere.jpeg';
import boiteMatchaImg from '@/img/boite_matcha.webp';
import { PrizeCard, type PrizeCategory } from '@/components/ui/card';
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
const PRIZE_IMAGES: Record<string, PrizeImageConfig> = {
  INFUSER:       { src: infuseurPremiumImg, alt: 'Infuseur à thé',              category: 'accessoire' },
  TEA_DETOX:     { src: boite100gImg,       alt: 'Boîte 100g thé détox',        category: 'signature'  },
  TEA_SIGNATURE: { src: boiteMatchaImg,     alt: 'Boîte 100g thé signature',    category: 'signature'  },
  GIFT_BOX_39:   { src: coffret5thesImg,    alt: 'Coffret découverte',          category: 'signature'  },
  GIFT_BOX_69:   { src: theiereImg,         alt: 'Coffret découverte premium',  category: 'accessoire' },
};

export function PrizesSection() {
  const { data: prizes } = useQuery<PrizeApi[]>({
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
          {prizes?.map((prize) => {
            const imgConfig = PRIZE_IMAGES[prize.code];

            // Sécurité : Si le code API n'existe pas localement, on évite le crash en utilisant
            // l'imageUrl de l'API (si disponible) ou un fallback vide.
            const imageSrc = imgConfig?.src ?? prize.imageUrl ?? '';
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
