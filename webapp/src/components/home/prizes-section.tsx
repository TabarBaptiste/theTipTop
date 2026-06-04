import { Leaf } from 'lucide-react';

const prizes = [
  {
    name: 'Boite 100g Thé Détox',
    value: '20€',
    probability: '20%',
  },
  {
    name: 'Infuseur premium',
    value: '15€',
    probability: '60%',
  },
  {
    name: 'Coffret decouverte',
    value: '39€',
    probability: '6%',
  },
  {
    name: 'Tasse + coffret de the',
    value: '25€',
    probability: '10%',
  },
  {
    name: 'Theiere japonaise',
    value: '69€',
    probability: '4%',
  },
  {
    name: 'Boite Matcha premium',
    value: '30€',
    probability: '—',
  },
];

export function PrizesSection() {
  return (
    <section id="prizes" className="bg-white py-16 md:py-20">
      <div className="container mx-auto px-6">
        <h2 className="font-display text-h2 text-noir">
          Les lots a gagner
        </h2>
        <p className="mt-2 text-sm text-stone-grey">
          100% des tickets sont gagnants
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {prizes.map((prize) => (
            <div
              key={prize.name}
              className="group overflow-hidden rounded-card border border-warm-beige transition-all duration-200 hover:shadow-[0_8px_24px_rgba(186,105,5,0.12)] hover:-translate-y-0.5"
            >
              {/* Image placeholder */}
              <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-terracotta-50 to-warm-beige/50">
                <Leaf className="h-10 w-10 text-terracotta-300 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-functional text-sm font-semibold text-noir">
                  {prize.name}
                </h3>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-functional text-xs text-stone-grey">
                    Valeur : {prize.value}
                  </span>
                  {prize.probability !== '—' && (
                    <span className="rounded-pill bg-terracotta-50 px-2 py-0.5 font-functional text-[10px] font-semibold text-terracotta-deep">
                      {prize.probability}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
