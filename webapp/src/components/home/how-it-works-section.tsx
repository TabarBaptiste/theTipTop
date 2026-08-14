const steps = [
  {
    number: '01',
    title: 'Trouve ton code',
    description:
      'Cherche le code unique sur ton ticket de caisse auprès de ton vendeur The Tip Top.',
  },
  {
    number: '02',
    title: 'Saisis ton code',
    description:
      'Entre ton code sur cette page et découvre instantanément ton résultat.',
  },
  {
    number: '03',
    title: 'Récupère ton lot',
    description:
      'Présente-toi en boutique avec ton code pour retirer ton lot dans les meilleurs délais.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-cream py-16 md:py-20">
      <div className="container mx-auto px-6">
        <h2 className="border-b border-warm-beige pb-6 font-display text-h2 text-noir">
          Comment participer ?
        </h2>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col">
              <span className="font-functional text-ui uppercase tracking-[2px] text-terracotta-deep">
                {step.number}
              </span>
              {/* italic est volontaire : les titres d'etapes sont en italique
                  sur la maquette Figma, contrairement au reste du site. */}
              <h3 className="mt-3 font-display text-lg font-semibold italic text-noir">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-grey">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
