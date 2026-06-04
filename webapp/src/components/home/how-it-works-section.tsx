import { ShoppingCart, Ticket, Gift } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: ShoppingCart,
    title: 'Faites vos achats',
    description:
      'Effectuez un achat d\'un montant minimum de 49€ dans notre boutique de Nice ou sur notre site internet.',
  },
  {
    number: '02',
    icon: Ticket,
    title: 'Entrez votre code',
    description:
      'Retrouvez le code a 10 caracteres sur votre ticket de caisse et saisissez-le sur notre site.',
  },
  {
    number: '03',
    icon: Gift,
    title: 'Recuperez votre lot',
    description:
      'Decouvrez immediatement votre gain et recuperez-le en boutique ou en ligne !',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-cream py-16 md:py-20">
      <div className="container mx-auto px-6">
        <h2 className="font-display text-h2 text-noir">
          Comment participer ?
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col">
              <span className="font-functional text-ui uppercase tracking-[2px] text-terracotta-deep">
                {step.number}
              </span>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-50">
                  <step.icon className="h-5 w-5 text-terracotta-deep" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-lg font-semibold not-italic text-noir">
                  {step.title}
                </h3>
              </div>
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
