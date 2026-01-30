import { Gift, Package, ShoppingBag, Star, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const prizes = [
  {
    icon: ShoppingBag,
    name: 'Infuseur à thé',
    value: '15€',
    probability: '60%',
    description: 'Un infuseur design pour préparer votre thé',
    color: 'bg-tea-100 text-tea-600',
  },
  {
    icon: Package,
    name: 'Thé détox ou infusion',
    value: '20€',
    probability: '20%',
    description: 'Boîte de 100g de thé détox ou infusion',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Package,
    name: 'Thé signature',
    value: '25€',
    probability: '10%',
    description: 'Boîte de 100g de thé signature',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Gift,
    name: 'Coffret découverte',
    value: '39€',
    probability: '6%',
    description: 'Coffret de 3 thés signature avec accessoires',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Star,
    name: 'Coffret premium',
    value: '69€',
    probability: '4%',
    description: 'Coffret découverte premium complet',
    color: 'bg-rose-100 text-rose-600',
  },
];

const grandPrize = {
  icon: Crown,
  name: '1 an de thé gratuit',
  value: '360€',
  description: 'Tirage au sort parmi tous les participants',
  color: 'bg-gold-100 text-gold-600',
};

export function PrizesSection() {
  return (
    <section id="prizes" className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-gray-900 md:text-4xl">
            Les lots à gagner
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Chaque ticket est gagnant ! Découvrez les lots que vous pouvez 
            remporter lors de notre grand jeu-concours.
          </p>
        </div>

        {/* Grand Prix */}
        <div className="mx-auto mt-12 max-w-2xl">
          <Card className="relative overflow-hidden border-2 border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gold-200 opacity-50" />
            <CardContent className="flex items-center gap-6 p-8">
              <div className={`rounded-2xl p-4 ${grandPrize.color}`}>
                <grandPrize.icon className="h-12 w-12" />
              </div>
              <div className="flex-1">
                <div className="mb-1 text-sm font-medium text-gold-600">
                  ⭐ Grand Prix - Tirage au sort final
                </div>
                <h3 className="font-display text-2xl font-bold text-gray-900">
                  {grandPrize.name}
                </h3>
                <p className="mt-1 text-gray-600">{grandPrize.description}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gold-600">
                  {grandPrize.value}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Autres lots */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {prizes.map((prize) => (
            <Card
              key={prize.name}
              className="transition-shadow hover:shadow-lg"
            >
              <CardContent className="flex items-start gap-4 p-6">
                <div className={`rounded-xl p-3 ${prize.color}`}>
                  <prize.icon className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{prize.name}</h3>
                    <span className="rounded-full bg-tea-100 px-2 py-0.5 text-xs font-medium text-tea-700">
                      {prize.probability}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{prize.description}</p>
                  <div className="mt-2 text-lg font-bold text-tea-600">
                    Valeur : {prize.value}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Note */}
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-gray-500">
          * Les pourcentages indiquent la répartition des lots parmi les 500 000 tickets. 
          Le tirage au sort du grand prix aura lieu le 1er mars 2025.
        </p>
      </div>
    </section>
  );
}
