import Link from 'next/link';

import {
  GAME_START_DATE,
  GAME_END_DATE,
  CLAIM_END_DATE,
  CLAIM_DURATION_DAYS,
} from '@/lib/game-dates';
import { formatFrenchDate, formatFrenchDateRange } from '@/lib/french-date';

/**
 * Section de clôture de la page d'accueil.
 *
 * Elle répond à trois questions que les visiteurs posent réellement - qui peut
 * jouer, ce qu'on gagne, comment on récupère son lot - et renvoie vers le
 * règlement et la FAQ, qui les traitent en détail.
 *
 * Elle sert aussi le référencement, sans être écrite pour lui : la page
 * d'accueil plafonnait à 270 mots, sous le seuil éditorial de 300 posé par le
 * cahier des charges. Un texte creux bourré de mots-clés aurait desservi les
 * deux objectifs à la fois.
 *
 * Les dates viennent des constantes du projet : ce paragraphe ne peut pas
 * contredire le règlement.
 */
export function AboutContestSection() {
  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="container mx-auto max-w-3xl px-6">
        <h2 className="font-display text-h2 text-noir">Tout savoir sur le jeu-concours</h2>

        <div className="mt-6 space-y-4 text-body leading-relaxed text-stone-grey">
          <p>
            Le jeu-concours Thé Tip Top se déroule{' '}
            {formatFrenchDateRange(GAME_START_DATE, GAME_END_DATE).toLowerCase()}, à
            l&apos;occasion de l&apos;ouverture de notre dixième boutique à Nice. Il est ouvert à
            toute personne majeure résidant en France ayant effectué un achat de plus de 49 € dans
            l&apos;une de nos boutiques. Chaque ticket de caisse éligible porte un code unique de
            dix caractères, à saisir sur ce site.
          </p>

          <p>
            <strong className="text-noir">Cent pour cent des tickets sont gagnants</strong>, et ce
            n&apos;est pas une formule : le lot est attribué au code dès sa génération, avant même
            le début du jeu. Six tickets sur dix donnent un infuseur à thé, deux sur dix une boîte
            de thé détox ou d&apos;infusion, un sur dix une boîte de thé signature. Les six et
            quatre pour cent restants offrent un coffret découverte, d&apos;une valeur de 39 € ou
            de 69 €. Aucune participation ne repart les mains vides.
          </p>

          <p>
            Chaque participant est par ailleurs inscrit au tirage au sort du grand prix - un an de
            thé d&apos;une valeur de 360 € - effectué sous le contrôle de Maître Arnaud Rick,
            commissaire de justice. Jouer plusieurs fois n&apos;augmente pas vos chances à ce
            tirage : chacun y dispose d&apos;une seule chance, quel que soit son nombre de
            participations.
          </p>

          <p>
            Les lots se retirent en boutique sur présentation du code gagnant, ou s&apos;expédient
            depuis notre site de vente en ligne. Vous disposez de {CLAIM_DURATION_DAYS} jours après
            la clôture, soit jusqu&apos;au {formatFrenchDate(CLAIM_END_DATE)}, pour réclamer votre
            gain. Les modalités complètes figurent dans le{' '}
            <Link href="/reglement" className="text-terracotta-600 underline underline-offset-2">
              règlement du jeu
            </Link>
            , et les questions les plus fréquentes trouvent leur réponse dans notre{' '}
            <Link href="/faq" className="text-terracotta-600 underline underline-offset-2">
              foire aux questions
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
