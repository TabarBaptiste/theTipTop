const steps = [
  {
    number: '01',
    title: 'Trouve ton code',
    description: 'Repère le code unique imprimé sur ton ticket de caisse.',
  },
  {
    number: '02',
    title: 'Saisis ton code',
    description:
      'En cliquant sur participer pour découvrir immédiatement ce que tu as gagné.',
  },
  {
    number: '03',
    title: 'Rends-toi en boutique avec ton code',
    description: 'Notre équipe te remettra ton lot sur place.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-b border-section-line bg-cream py-12">
      <div className="container mx-auto px-6">
        <h2 className="border-b border-section-line pb-[18px] font-display text-h2 leading-[2.4375rem] text-ink">
          Comment participer ?
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col">
              {/* Les numéros sont en Playfair sur la maquette, à la taille d'un
                  sous-titre : ils ouvrent l'étape au lieu de la surtitrer. */}
              <span className="font-display text-[1.75rem] font-bold leading-[2.625rem] text-accent">
                {step.number}
              </span>
              {/* italic est volontaire : les titres d'etapes sont en italique
                  sur la maquette Figma, contrairement au reste du site. */}
              <h3 className="mt-[18px] font-display text-[1.25rem] font-medium italic leading-[1.875rem] text-ink">
                {step.title}
              </h3>
              <p className="mt-3 text-[0.6875rem] leading-[1.03125rem] tracking-[0.3px] text-stone-grey">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
