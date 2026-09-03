const steps = [
  {
    number: '01',
    title: 'Trouve ton code',
    description:
      'Cherche le code unique sur ton ticket de caisse auprès de ton vendeur Thé Tip Top.',
  },
  {
    number: '02',
    title: 'Saisis ton code',
    description: 'Entre ton code sur cette page et découvre instantanément ton résultat.',
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
    <section id="how-it-works" className="border-b border-section-line bg-cream py-12">
      <div className="container mx-auto px-6">
        <h2 className="border-b border-section-line pb-[18px] font-display text-h2 leading-[39px] text-ink">
          Comment participer ?
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col">
              {/* Les numéros sont en Playfair sur la maquette, à la taille d'un
                  sous-titre : ils ouvrent l'étape au lieu de la surtitrer. */}
              <span className="font-display text-[28px] font-bold leading-[42px] text-accent">
                {step.number}
              </span>
              {/* italic est volontaire : les titres d'etapes sont en italique
                  sur la maquette Figma, contrairement au reste du site. */}
              <h3 className="mt-[18px] font-display text-[20px] font-medium italic leading-[30px] text-ink">
                {step.title}
              </h3>
              <p className="mt-3 text-[11px] leading-[16.5px] tracking-[0.3px] text-stone-grey">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
