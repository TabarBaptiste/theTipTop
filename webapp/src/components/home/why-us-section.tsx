import Link from 'next/link';

// Ces quatre arguments sont ceux de la maquette : ils portent sur la loyauté
// du jeu-concours, pas sur la marque. Les précédents - bio, mélanges à la
// main, provenance, éco-responsabilité - répondaient à une autre question que
// celle posée par le titre de la section.
const reasons = [
  {
    number: '01',
    description: 'Jeu 100% transparent et équitable pour tous les participants.',
  },
  {
    number: '02',
    description: 'Lots de qualité premium sélectionnés avec soin.',
  },
  {
    number: '03',
    description: 'Tirage certifié par huissier de justice.',
  },
  {
    number: '04',
    description: 'Service client disponible 7j/7 pour vous accompagner.',
  },
];

// L'id « why-us » est la cible du lien « À propos » du footer (/#why-us).
export function WhyUsSection() {
  return (
    <section id="why-us" className="bg-cream py-12">
      <div className="container mx-auto px-6">
        <h2 className="border-b border-section-line pb-[18px] font-display text-h2 leading-[2.4375rem] text-ink">
          Pourquoi nous ?
        </h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <div key={reason.number} className="flex flex-col gap-3">
              <span className="font-display text-[1.375rem] font-bold leading-[2.0625rem] text-accent">
                {reason.number}
              </span>
              <p className="text-[0.6875rem] leading-[1.03125rem] tracking-[0.3px] text-stone-grey">
                {reason.description}
              </p>
            </div>
          ))}
        </div>

        <Link
          href="/reglement"
          className="mt-12 inline-block text-[0.6875rem] leading-[1.03125rem] text-moss underline underline-offset-2"
        >
          Lire la charte de transparence
        </Link>
      </div>
    </section>
  );
}
