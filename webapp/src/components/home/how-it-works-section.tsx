import { ShoppingCart, Ticket, UserPlus, Gift } from 'lucide-react';

const steps = [
  {
    icon: ShoppingCart,
    title: 'Achetez pour 49€',
    description:
      'Effectuez un achat d\'un montant minimum de 49€ dans notre boutique de Nice ou sur notre site internet.',
    color: 'bg-tea-500',
  },
  {
    icon: Ticket,
    title: 'Recevez votre ticket',
    description:
      'Un ticket avec un code unique à 10 caractères vous sera remis avec votre achat.',
    color: 'bg-emerald-500',
  },
  {
    icon: UserPlus,
    title: 'Inscrivez-vous',
    description:
      'Créez votre compte sur notre site et entrez votre code pour découvrir votre lot.',
    color: 'bg-amber-500',
  },
  {
    icon: Gift,
    title: 'Récupérez votre lot',
    description:
      'Récupérez votre gain dans notre boutique. Vous êtes automatiquement inscrit au tirage du grand prix !',
    color: 'bg-rose-500',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-gray-900 md:text-4xl">
            Comment participer ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Participer au jeu-concours Thé Tip Top, c&apos;est simple comme 
            préparer une tasse de thé !
          </p>
        </div>

        <div className="relative mt-16">
          {/* Ligne de connexion */}
          <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-tea-200 via-tea-300 to-tea-200 lg:block" />

          <div className="space-y-12 lg:space-y-16">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`relative flex flex-col items-center gap-6 lg:flex-row ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Contenu */}
                <div
                  className={`flex-1 ${
                    index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'
                  } text-center`}
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-gray-600 lg:mx-0">
                    {step.description}
                  </p>
                </div>

                {/* Numéro / Icône */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${step.color} text-white shadow-lg`}
                  >
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="mt-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-700 shadow">
                    {index + 1}
                  </div>
                </div>

                {/* Spacer pour l'alignement */}
                <div className="hidden flex-1 lg:block" />
              </div>
            ))}
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-16 rounded-2xl bg-tea-50 p-8">
          <h3 className="text-center text-xl font-bold text-tea-800">
            📅 Dates importantes
          </h3>
          <div className="mt-6 grid gap-4 text-center md:grid-cols-3">
            <div>
              <div className="font-semibold text-tea-700">Début du jeu</div>
              <div className="text-gray-600">1er janvier 2025</div>
            </div>
            <div>
              <div className="font-semibold text-tea-700">Fin du jeu</div>
              <div className="text-gray-600">30 janvier 2025</div>
            </div>
            <div>
              <div className="font-semibold text-tea-700">Tirage au sort</div>
              <div className="text-gray-600">1er mars 2025</div>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-gray-500">
            Vous avez 30 jours après la fin du jeu pour récupérer vos lots en boutique.
          </p>
        </div>
      </div>
    </section>
  );
}
