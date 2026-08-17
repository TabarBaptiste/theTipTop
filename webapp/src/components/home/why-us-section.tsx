import { Leaf, Award, ShieldCheck, Heart } from 'lucide-react';

const reasons = [
  {
    icon: Leaf,
    number: '01',
    title: 'The 100% bio',
    description: 'Tous nos thes sont certifies bio depuis l\'origine de notre marque.',
  },
  {
    icon: Award,
    number: '02',
    title: 'Artisanat unique',
    description: 'Chaque melange est cree a la main par nos maitres theiers.',
  },
  {
    icon: ShieldCheck,
    number: '03',
    title: 'Tracabilite totale',
    description: 'De la plantation a votre tasse, nous garantissons la provenance.',
  },
  {
    icon: Heart,
    number: '04',
    title: 'Engagement RSE',
    description: 'Une demarche eco-responsable a chaque etape de production.',
  },
];

// L'id « why-us » est la cible du lien « À propos » du footer (/#why-us).
export function WhyUsSection() {
  return (
    <section id="why-us" className="bg-cream py-16 md:py-20">
      <div className="container mx-auto px-6">
        <h2 className="font-display text-h2 text-noir">
          Pourquoi nous ?
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <div key={reason.number} className="flex flex-col">
              <span className="font-functional text-ui uppercase tracking-[2px] text-terracotta-deep">
                {reason.number}
              </span>
              <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-full bg-terracotta-50">
                <reason.icon className="h-5 w-5 text-terracotta-deep" strokeWidth={1.5} />
              </div>
              <h3 className="mt-3 font-functional text-sm font-bold text-noir">
                {reason.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-grey">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
