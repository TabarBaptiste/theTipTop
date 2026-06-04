import boite100gImg from '@/img/boite_100g.jpeg';
import infuseurPremiumImg from '@/img/Infuseur_premium.jpg';
import coffret5thesImg from '@/img/coffret_5_thes.jpg';
import theiereImg from '@/img/theiere.jpeg';
import boiteMatchaImg from '@/img/boite_matcha.webp';
import weekEndSalon from '@/img/week-end_salon.avif';
import { PrizeCard, type PrizeCategory } from '@/components/ui/card';

const prizes: Array<{
  name: string;
  value: string;
  probability: string;
  category: PrizeCategory;
  image?: string | { src: string };
  imageAlt?: string;
}> = [
  {
    name: 'Boite 100g Thé Détox',
    value: '20€',
    probability: '20%',
    category: 'signature',
    image: boite100gImg,
    imageAlt: 'Boîte 100g Thé',
  },
  {
    name: 'Infuseur premium',
    value: '15€',
    probability: '60%',
    category: 'accessoire',
    image: infuseurPremiumImg,
    imageAlt: 'Infuseur à thé',
  },
  {
    name: 'Coffret découverte',
    value: '39€',
    probability: '6%',
    category: 'signature',
    image: coffret5thesImg,
    imageAlt: 'Coffret 5 thés',
  },
  {
    name: 'Tasse + coffret de thé',
    value: '25€',
    probability: '10%',
    category: 'accessoire',
    image: weekEndSalon,
    imageAlt: 'Week-end salon de thé',
  },
  {
    name: 'Théière japonaise',
    value: '69€',
    probability: '4%',
    category: 'accessoire',
    image: theiereImg,
    imageAlt: 'Théière japonaise',
  },
  {
    name: 'Boite Matcha premium',
    value: '30€',
    probability: '—',
    category: 'signature',
    image: boiteMatchaImg,
    imageAlt: 'Boîte Matcha premium',
  },
];

export function PrizesSection() {
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
          {prizes.map((prize) => (
            <PrizeCard
              key={prize.name}
              image={prize.image}
              imageAlt={prize.imageAlt}
              category={prize.category}
              title={prize.name}
              value={prize.value}
              odds={prize.probability}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
