import Link from 'next/link';
import Image from 'next/image';

import mainsBolImg from '@/img/mains_bol_infusion.webp';
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
    // Fond blanc et photo collée au bord gauche, comme sur la maquette : le
    // visuel n'y est ni arrondi ni rentré dans la colonne de contenu.
    <section className="border-b border-section-line bg-white">
      <div className="grid items-center lg:grid-cols-2">
        <div className="relative h-72 w-full md:h-96 lg:h-[629px]">
          <Image
            src={mainsBolImg}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="px-6 py-9 lg:pl-[99px] lg:pr-[121px]">
          <h2 className="font-display text-display text-noir">Tout savoir sur le jeu-concours</h2>

          <div className="mt-3 max-w-[501px] space-y-6 text-body leading-[24.5px] text-noir">
            <p>
              Le jeu-concours Thé Tip Top se déroule{' '}
              {formatFrenchDateRange(GAME_START_DATE, GAME_END_DATE).toLowerCase()}, à
              l&apos;occasion de l&apos;ouverture de notre 10e boutique à Nice. Il est ouvert à
              toute personne majeure résidant en France ayant effectué un achat de plus de 49 € dans
              l&apos;une de nos boutiques. Chaque ticket de caisse éligible porte un code unique de
              10 caractères, à saisir sur ce site.
            </p>

            <p>
              <strong className="text-noir">100 % des tickets sont gagnants</strong>, et ce
              n&apos;est pas une formule : le lot est attribué au code dès sa génération, avant même
              le début du jeu. 60 % des tickets donnent un infuseur à thé, 20 % une boîte de thé
              détox ou d&apos;infusion, 10 % une boîte de thé signature. Les 6 % et 4 % restants
              offrent un coffret découverte, d&apos;une valeur de 39 € ou de 69 €. Aucune
              participation ne repart les mains vides.
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
              depuis notre site de vente en ligne. Vous disposez de {CLAIM_DURATION_DAYS} jours
              après la clôture, soit jusqu&apos;au {formatFrenchDate(CLAIM_END_DATE)}, pour réclamer
              votre gain. Les modalités complètes figurent dans le{' '}
              <Link href="/reglement" className="underline underline-offset-2">
                règlement du jeu
              </Link>
              , et les questions les plus fréquentes trouvent leur réponse dans notre{' '}
              <Link href="/faq" className="underline underline-offset-2">
                foire aux questions
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
