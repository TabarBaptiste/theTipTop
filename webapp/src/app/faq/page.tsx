import type { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData } from '@/components/seo/structured-data';

export const metadata: Metadata = {
  // URL de reference : evite qu'un parametre de campagne ou une variante
  // avec barre finale soit traite comme une page distincte.
  alternates: { canonical: '/faq' },
  title: 'FAQ',
  description:
    'Questions fréquentes sur le jeu-concours Thé Tip Top : participation, codes, lots, remise des gains et tirage au sort du grand prix.',
};

const FAQ_ITEMS = [
  {
    question: 'Comment participer au jeu-concours ?',
    answer: `Effectuez un achat supérieur à 49 € en boutique : votre ticket de caisse comporte un
      code unique à 10 caractères. Créez un compte (ou connectez-vous avec Google/Facebook), puis
      saisissez ce code dans votre espace personnel pour découvrir immédiatement votre lot.`,
  },
  {
    question: 'Tous les tickets sont-ils vraiment gagnants ?',
    answer: `Oui, 100 % des tickets sont gagnants. Les lots vont de l'infuseur à thé au coffret
      découverte d'une valeur de 69 €, et chaque participation vous inscrit automatiquement au
      tirage au sort du grand prix : un an de thé d'une valeur de 360 €.`,
  },
  {
    question: "Jusqu'à quand puis-je utiliser mon code ?",
    answer: `Le jeu dure 30 jours. Vous disposez ensuite de 30 jours supplémentaires après la
      clôture du jeu pour tester votre code et réclamer votre lot. Passé ce délai, le lot est
      définitivement perdu.`,
  },
  {
    question: 'Comment récupérer mon lot ?',
    answer: `Présentez-vous en boutique : un employé vérifiera votre gain à partir de votre code et
      vous remettra votre lot. Vous pouvez suivre l'état de vos gains (à récupérer / récupéré)
      depuis votre tableau de bord.`,
  },
  {
    question: 'Mon code ne fonctionne pas, que faire ?',
    answer: `Vérifiez que vous avez saisi les 10 caractères sans espace (les codes ne contiennent
      que des lettres et des chiffres). Si le problème persiste, contactez notre service client à
      contact@thetiptop.fr en joignant une photo de votre ticket de caisse.`,
  },
  {
    question: 'Participer plusieurs fois augmente-t-il mes chances au grand prix ?',
    answer: `Non. Chaque participant ne dispose que d'une seule chance au tirage au sort du grand
      prix, quel que soit son nombre de participations. Le tirage est effectué sous le contrôle de
      Maître Arnaud Rick, huissier de justice.`,
  },
  {
    question: 'Que faites-vous de mes données personnelles ?',
    answer: `Vos données sont utilisées uniquement pour la gestion du jeu-concours et, si vous y
      avez consenti, pour nos communications. Conformément au RGPD, vous pouvez consulter, exporter
      ou supprimer vos données à tout moment depuis votre profil.`,
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-cream">
      {/* Décrit ces questions comme telles aux moteurs, ce que le HTML seul ne
          permet pas. Google peut alors les afficher dépliées dans ses résultats.
          Les réponses sont écrites en littéraux multilignes : leurs retours et
          indentations sont réduits à des espaces simples, un balisage JSON-LD
          devant contenir le texte tel qu'il se lit. */}
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ_ITEMS.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer.replace(/\s+/g, ' ').trim(),
            },
          })),
        }}
      />

      {/* En-tête */}
      <section className="border-b border-warm-beige bg-white">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <p className="font-functional text-ui uppercase tracking-[2px] text-terracotta-600">
            Aide
          </p>
          <h1 className="mt-3 font-display text-h1 text-noir">Questions fréquentes</h1>
          <p className="mt-4 max-w-2xl text-body text-stone-grey">
            Tout ce qu&apos;il faut savoir sur le jeu-concours Thé Tip Top : participation, codes,
            lots et grand prix.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group rounded-card border border-warm-beige bg-white p-6"
            >
              <summary className="cursor-pointer list-none font-display text-lg font-semibold text-noir transition-colors group-open:text-terracotta-600">
                {item.question}
              </summary>
              <p className="mt-3 text-body leading-relaxed text-stone-grey">{item.answer}</p>
            </details>
          ))}

          <div className="rounded-card bg-terracotta-50 p-6 text-center">
            <p className="text-sm text-noir">
              Vous ne trouvez pas votre réponse ? Consultez le{' '}
              <Link href="/reglement" className="font-semibold text-terracotta-600 hover:underline">
                règlement complet
              </Link>{' '}
              ou écrivez-nous à{' '}
              <a
                href="mailto:contact@thetiptop.fr"
                className="font-semibold text-terracotta-600 hover:underline"
              >
                contact@thetiptop.fr
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
