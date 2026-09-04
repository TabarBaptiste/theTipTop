import type { Metadata } from 'next';
import Link from 'next/link';
import {
  GAME_START_DATE,
  GAME_END_DATE,
  CLAIM_END_DATE,
  GAME_DURATION_DAYS,
  CLAIM_DURATION_DAYS,
} from '@/lib/game-dates';
import { formatFrenchDate, formatFrenchDateTime } from '@/lib/french-date';

export const metadata: Metadata = {
  // URL de reference : evite qu'un parametre de campagne ou une variante
  // avec barre finale soit traite comme une page distincte.
  alternates: { canonical: '/reglement' },
  title: 'Règlement du jeu-concours',
  description:
    'Règlement officiel du jeu-concours Thé Tip Top : conditions de participation, lots, durée, modalités de réclamation et tirage au sort du grand prix.',
};

const ARTICLES = [
  {
    id: 'organisateur',
    title: 'Article 1 - Organisateur',
    content: `La société Thé Tip Top, SA au capital social de 150 000 €, dont le siège social est situé
      18 rue Léon Frot, 75011 Paris, représentée par son gérant M. Eric Bourdon, organise un
      jeu-concours avec obligation d'achat à l'occasion de l'ouverture de sa 10ème boutique à Nice.`,
  },
  {
    id: 'participation',
    title: 'Article 2 - Conditions de participation',
    content: `Le jeu-concours est ouvert à toute personne physique majeure ayant effectué un achat
      d'un montant supérieur à 49 € en boutique. Chaque ticket de caisse ou facture éligible comporte
      un code unique à 10 caractères (chiffres et lettres) permettant une participation sur le présent
      site, après création d'un compte (formulaire classique ou connexion Google/Facebook).`,
  },
  {
    id: 'duree',
    title: 'Article 3 - Durée du jeu',
    content: `Le jeu-concours se déroule du ${formatFrenchDate(GAME_START_DATE)} à 00h00 au
      ${formatFrenchDateTime(GAME_END_DATE)} inclus, soit une période de ${GAME_DURATION_DAYS} jours,
      durant laquelle un maximum de 500 000 tickets pourra être distribué. Les participants
      disposent ensuite de ${CLAIM_DURATION_DAYS} jours supplémentaires à compter de la date de
      clôture, soit jusqu'au ${formatFrenchDateTime(CLAIM_END_DATE)}, pour tester leur(s) code(s) sur
      le site et réclamer leur lot en boutique ou en ligne.`,
  },
  {
    id: 'lots',
    title: 'Article 4 - Dotations',
    content: `100 % des tickets sont gagnants. La répartition des lots est la suivante :
      60 % des tickets offrent un infuseur à thé ; 20 % une boîte de 100 g d'un thé détox ou
      d'infusion ; 10 % une boîte de 100 g d'un thé signature ; 6 % un coffret découverte d'une
      valeur de 39 € ; 4 % un coffret découverte d'une valeur de 69 €. Les lots sont attribués aux
      codes dès leur génération, avant le début du jeu.`,
  },
  {
    id: 'grand-prix',
    title: 'Article 5 - Grand prix',
    content: `À l'issue du jeu-concours, un tirage au sort sera effectué parmi l'ensemble des
      participants afin de désigner le gagnant d'un an de thé d'une valeur de 360 €. Le nombre de
      participations d'un même client n'augmente pas ses chances de gagner : chaque participant ne
      dispose que d'une seule chance au tirage. Le tirage est effectué côté serveur, sous le contrôle
      de Maître Arnaud Rick, huissier de justice.`,
  },
  {
    id: 'remise',
    title: 'Article 6 - Remise des lots',
    content: `Les lots sont à retirer en boutique sur présentation du code gagnant, ou peuvent être
      expédiés via le site de vente en ligne. Tout lot non réclamé au
      ${formatFrenchDateTime(CLAIM_END_DATE)}, soit ${CLAIM_DURATION_DAYS} jours après la clôture du
      jeu, sera définitivement perdu.`,
  },
  {
    id: 'depot',
    title: 'Article 7 - Dépôt du règlement',
    content: `Le présent règlement et les modalités complètes du jeu-concours sont déposés auprès de
      Maître Arnaud Rick, huissier de justice. Une copie est adressée gratuitement à toute personne
      qui en fait la demande écrite auprès de l'organisateur.`,
  },
  {
    id: 'donnees',
    title: 'Article 8 - Données personnelles',
    content: `Les données collectées dans le cadre du jeu-concours sont traitées conformément au
      Règlement Général sur la Protection des Données (RGPD). Chaque participant dispose d'un droit
      d'accès, de rectification, d'export et de suppression de ses données depuis son espace
      personnel.`,
  },
];

export default function ReglementPage() {
  return (
    <div className="min-h-[calc(100vh-3.75rem)] bg-cream">
      {/* En-tête */}
      <section className="border-b border-warm-beige bg-surface">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <p className="font-functional text-ui uppercase tracking-[2px] text-accent">
            Jeu-concours
          </p>
          <h1 className="mt-3 font-display text-h1 text-ink">Règlement du jeu-concours</h1>
          <p className="mt-4 max-w-2xl text-body text-stone-grey">
            Règlement officiel du jeu-concours Thé Tip Top organisé à l&apos;occasion de
            l&apos;ouverture de la 10ème boutique à Nice, déposé auprès de Maître Arnaud Rick,
            huissier de justice.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-3xl space-y-10">
          {ARTICLES.map((article) => (
            <section key={article.id} id={article.id}>
              <h2 className="font-display text-h2 text-ink">{article.title}</h2>
              <p className="mt-3 text-body leading-relaxed text-stone-grey">{article.content}</p>
            </section>
          ))}

          <div className="rounded-card border border-warm-beige bg-surface p-6">
            <p className="text-sm text-stone-grey">
              Pour toute question relative au règlement, consultez notre{' '}
              <Link href="/faq" className="text-accent underline underline-offset-2">
                FAQ
              </Link>{' '}
              ou notre{' '}
              <Link href="/politique-confidentialite" className="text-accent underline underline-offset-2">
                politique de confidentialité
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
