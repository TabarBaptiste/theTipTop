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
import { LEGAL_UPDATED_AT } from '@/lib/legal-dates';

export const metadata: Metadata = {
  // URL de reference : evite qu'un parametre de campagne ou une variante
  // avec barre finale soit traite comme une page distincte.
  alternates: { canonical: '/cgu' },
  title: "Conditions Générales d'Utilisation",
  description:
    "Conditions générales d'utilisation du site Thé Tip Top et règlement du jeu-concours.",
};

const ARTICLES = [
  { id: 'editeur', label: "1. Présentation de l'éditeur" },
  { id: 'objet', label: '2. Objet des CGU' },
  { id: 'acceptation', label: '3. Acceptation des CGU' },
  { id: 'acces', label: '4. Accès au site' },
  { id: 'participation', label: '5. Conditions de participation' },
  { id: 'mecanisme', label: '6. Mécanisme du jeu' },
  { id: 'dotations', label: '7. Dotations' },
  { id: 'gagnants', label: '8. Désignation des gagnants' },
  { id: 'remise', label: '9. Remise des lots' },
  { id: 'propriete', label: '10. Propriété intellectuelle' },
  { id: 'responsabilite', label: '11. Responsabilité' },
  { id: 'donnees', label: '12. Données personnelles' },
  { id: 'cookies', label: '13. Cookies' },
  { id: 'droit', label: '14. Droit applicable' },
];

export default function CGUPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-cream">
      {/* En-tête */}
      <section className="border-b border-warm-beige bg-white">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <p className="font-functional text-ui uppercase tracking-[2px] text-terracotta-600">
            Informations légales
          </p>
          <h1 className="mt-3 font-display text-h1 text-noir">
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="mt-4 max-w-2xl text-body text-stone-grey">
            Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et
            l&apos;utilisation du site internet Thé Tip Top ainsi que la participation au
            jeu-concours organisé par la société.
          </p>
          <p className="mt-4 text-sm text-stone-grey/80">
            Dernière mise à jour : {formatFrenchDate(LEGAL_UPDATED_AT.cgu)}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[260px_1fr] lg:gap-12">
          {/* Sommaire */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-card border border-warm-beige bg-white p-6">
              <p className="font-functional text-ui uppercase tracking-[2px] text-stone-grey">
                Sommaire
              </p>
              <nav className="mt-4 space-y-1">
                {ARTICLES.map((a) => (
                  <a
                    key={a.id}
                    href={`#${a.id}`}
                    className="block rounded-soft px-2 py-1.5 text-sm text-stone-grey transition-colors hover:bg-cream hover:text-terracotta-600"
                  >
                    {a.label}
                  </a>
                ))}
              </nav>
              <div className="mt-6 border-t border-warm-beige pt-6">
                <p className="font-functional text-ui uppercase tracking-[2px] text-stone-grey">
                  Voir aussi
                </p>
                <nav className="mt-3 space-y-1">
                  <Link
                    href="/mentions-legales"
                    className="block rounded-soft px-2 py-1.5 text-sm text-stone-grey transition-colors hover:bg-cream hover:text-terracotta-600"
                  >
                    Mentions légales
                  </Link>
                  <Link
                    href="/politique-confidentialite"
                    className="block rounded-soft px-2 py-1.5 text-sm text-stone-grey transition-colors hover:bg-cream hover:text-terracotta-600"
                  >
                    Politique de confidentialité
                  </Link>
                  <Link
                    href="/gestion-cookies"
                    className="block rounded-soft px-2 py-1.5 text-sm text-stone-grey transition-colors hover:bg-cream hover:text-terracotta-600"
                  >
                    Gestion des cookies
                  </Link>
                </nav>
              </div>
            </div>
          </aside>

          {/* Contenu */}
          <article className="space-y-10">
            {/* Article 1 */}
            <section id="editeur" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">
                Article 1 - Présentation de l&apos;éditeur
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Le site internet <strong>thetiptop.dsp5-archi-o24a-4-5-g1.fr</strong>{' '}
                  (ci-après « le Site ») est édité par la société <strong>Thé Tip Top</strong>,
                  Société Anonyme au capital social de 150 000€, entreprise spécialisée dans la
                  vente de thés biologiques et fait main.
                </p>
                <ul className="ml-4 space-y-1 border-l-2 border-warm-beige pl-4">
                  <li>
                    <strong>Siège social :</strong> 18 rue Léon Frot, 75011 Paris - France
                  </li>
                  <li>
                    <strong>Numéro RCS :</strong> Paris B 123 456 789
                  </li>
                  <li>
                    <strong>Numéro SIREN :</strong> 123 456 789
                  </li>
                  <li>
                    <strong>TVA :</strong> FR 01 123456789
                  </li>
                  <li>
                    <strong>Téléphone :</strong> +33 1 23 74 85 96
                  </li>
                  <li>
                    <strong>Email :</strong>{' '}
                    <a
                      href="mailto:contact@thetiptop.fr"
                      className="text-terracotta-600 underline underline-offset-2"
                    >
                      contact@thetiptop.fr
                    </a>
                  </li>
                  <li>
                    <strong>Directeur de la publication :</strong> Éric Bourdon
                  </li>
                  <li>
                    <strong>Hébergeur :</strong> OVHcloud, 2 rue Kellermann, 59100 Roubaix - France
                  </li>
                </ul>
              </div>
            </section>

            {/* Article 2 */}
            <section id="objet" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">Article 2 - Objet des CGU</h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Les présentes CGU ont pour objet de définir les modalités et conditions
                  d&apos;utilisation du Site ainsi que les droits et obligations respectifs de
                  l&apos;éditeur et de l&apos;utilisateur dans ce cadre.
                </p>
                <p>
                  Elles s&apos;appliquent notamment à la participation au <strong>Grand Jeu-Concours
                  Thé Tip Top</strong> organisé à l&apos;occasion de l&apos;ouverture de la boutique
                  de Nice. Le règlement du jeu-concours est déposé auprès du commissaire de
                  justice assermenté. Les CGU constituent un contrat entre l&apos;utilisateur et
                  l&apos;éditeur du Site.
                </p>
                <p>
                  Les présentes CGU sont distinctes des Conditions Générales de Vente (CGV)
                  applicables aux achats réalisés en boutique ou en ligne.
                </p>
              </div>
            </section>

            {/* Article 3 */}
            <section id="acceptation" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">Article 3 - Acceptation des CGU</h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  L&apos;accès au Site et/ou la participation au jeu-concours implique
                  l&apos;acceptation pleine et entière des présentes CGU. Cette acceptation est
                  matérialisée lors de la création du compte participant par le cochage de la case
                  prévue à cet effet. L&apos;utilisateur reconnaît avoir lu et accepté
                  l&apos;intégralité du règlement du jeu-concours disponible sur le site.
                </p>
                <p>
                  L&apos;éditeur se réserve le droit de modifier les présentes CGU à tout moment.
                  Les utilisateurs seront informés de toute modification substantielle. La version
                  en vigueur est celle publiée sur le Site à la date de consultation.
                </p>
                <p>
                  Toute utilisation du Site après modification des CGU vaut acceptation de la
                  nouvelle version.
                </p>
              </div>
            </section>

            {/* Article 4 */}
            <section id="acces" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">Article 4 - Accès au site</h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Le Site est accessible gratuitement depuis tout appareil connecté à internet.
                  L&apos;éditeur met tout en œuvre pour assurer la disponibilité du Site, mais ne
                  saurait être tenu responsable d&apos;une interruption temporaire due à des
                  opérations de maintenance, des problèmes techniques ou des circonstances
                  indépendantes de sa volonté.
                </p>
                <p>L&apos;utilisateur s&apos;engage à :</p>
                <ul className="ml-4 list-disc space-y-1 pl-4">
                  <li>Utiliser le Site conformément à sa destination et aux présentes CGU ;</li>
                  <li>
                    Maintenir la confidentialité de ses identifiants de connexion et ne pas les
                    communiquer à des tiers ;
                  </li>
                  <li>
                    Ne pas tenter de porter atteinte au bon fonctionnement du Site (piratage,
                    tentative d&apos;accès non autorisé, injection de code malveillant, etc.) ;
                  </li>
                  <li>
                    Ne pas créer plusieurs comptes afin de bénéficier d&apos;avantages indus dans
                    le cadre du jeu-concours.
                  </li>
                </ul>
                <p>
                  Tout manquement à ces obligations pourra entraîner la suspension ou la suppression
                  du compte sans préavis ni indemnité.
                </p>
              </div>
            </section>

            {/* Article 5 */}
            <section id="participation" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">
                Article 5 - Conditions de participation au jeu-concours
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  La participation au jeu-concours est ouverte à toute personne physique majeure
                  (18 ans révolus au jour de la participation), résidant en France métropolitaine,
                  à l&apos;exclusion :
                </p>
                <ul className="ml-4 list-disc space-y-1 pl-4">
                  <li>Des salariés et collaborateurs de la société Thé Tip Top ;</li>
                  <li>Des membres de leur foyer fiscal ;</li>
                  <li>
                    Des personnes ayant participé à l&apos;organisation ou à la réalisation du
                    jeu-concours.
                  </li>
                </ul>
                <p>
                  La participation est <strong>strictement personnelle</strong> : un ticket de caisse
                  ne peut être utilisé qu&apos;une seule fois. Tout participant ne peut remporter
                  qu&apos;un lot au cours de la période du jeu-concours.
                </p>
                <p>
                  <strong>Période du jeu-concours :</strong> du{' '}
                  {formatFrenchDate(GAME_START_DATE)} à 00h00 au {formatFrenchDateTime(GAME_END_DATE)}{' '}
                  inclus, soit {GAME_DURATION_DAYS} jours civils. Toute participation en dehors de
                  cette période sera rejetée.
                </p>
                <p>
                  Pour participer, l&apos;utilisateur doit :
                </p>
                <ol className="ml-4 list-decimal space-y-1 pl-4">
                  <li>
                    Effectuer un achat dans la boutique Thé Tip Top et conserver son ticket de
                    caisse ;
                  </li>
                  <li>
                    Créer un compte sur le Site ou se connecter à son compte existant ;
                  </li>
                  <li>
                    Saisir le code unique figurant sur son ticket de caisse dans l&apos;espace dédié.
                  </li>
                </ol>
              </div>
            </section>

            {/* Article 6 */}
            <section id="mecanisme" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">Article 6 - Mécanisme du jeu</h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Le Grand Jeu-Concours Thé Tip Top est un jeu de type <strong>loterie sans achat
                  obligatoire</strong> à l&apos;issue instantanée : chaque ticket de caisse est
                  associé à un lot prédéfini. <strong>100 % des tickets sont gagnants.</strong>
                </p>
                <p>
                  Les codes sont pré-affectés à des lots selon une répartition déterminée avant le
                  début du jeu-concours, sous le contrôle d&apos;un huissier de justice. La
                  répartition des lots est la suivante :
                </p>
                <div
                  // Defilable plutot que coupe : a 375 px ces tableaux depassent
                  // le cadre, et overflow-hidden rendait la derniere colonne
                  // inatteignable. tabIndex rend la zone defilable au clavier,
                  // sans quoi son contenu resterait hors de portee sans souris.
                  tabIndex={0}
                  className="overflow-x-auto rounded-card border border-warm-beige"
                >
                  <table className="w-full text-sm">
                    <thead className="bg-noir text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-functional text-[10px] uppercase tracking-[2px]">
                          Lot
                        </th>
                        <th className="px-4 py-3 text-left font-functional text-[10px] uppercase tracking-[2px]">
                          Valeur indicative
                        </th>
                        <th className="px-4 py-3 text-left font-functional text-[10px] uppercase tracking-[2px]">
                          Probabilité
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warm-beige">
                      {[
                        ['Infuseur à thé', '5,90 €', '60 %'],
                        ['Thé détox ou infusion (100g)', '10,90 €', '20 %'],
                        ['Coffret découverte thé (39,90€)', '39,90 €', '12 %'],
                        ['Boîte thé signature (69,90€)', '69,90 €', '7 %'],
                        ['An de thé offert (360€)', '360,00 €', '1 %'],
                      ].map(([lot, valeur, proba]) => (
                        <tr key={lot} className="bg-white even:bg-cream">
                          <td className="px-4 py-3 text-stone-grey">{lot}</td>
                          <td className="px-4 py-3 text-stone-grey">{valeur}</td>
                          <td className="px-4 py-3 font-medium text-terracotta-600">{proba}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-stone-grey/80">
                  Les probabilités indiquées sont approximatives et données à titre indicatif. Le
                  résultat exact dépend du nombre total de tickets émis et de leur répartition.
                </p>
              </div>
            </section>

            {/* Article 7 */}
            <section id="dotations" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">Article 7 - Dotations</h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Les lots ne peuvent être ni cédés, ni échangés, ni remplacés par leur contre-valeur
                  en espèces. Ils sont attribués en nature dans les conditions prévues à
                  l&apos;article 9.
                </p>
                <p>
                  En cas d&apos;indisponibilité d&apos;un lot au moment de sa remise, l&apos;éditeur
                  se réserve le droit de le remplacer par un lot de valeur équivalente. Le gagnant
                  sera informé de ce remplacement par courrier électronique.
                </p>
                <p>
                  L&apos;éditeur se réserve le droit d&apos;annuler le jeu-concours en cas de
                  force majeure ou de fraude avérée, sans que les participants ne puissent réclamer
                  une quelconque indemnité.
                </p>
              </div>
            </section>

            {/* Article 8 */}
            <section id="gagnants" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">
                Article 8 - Désignation des gagnants
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Le lot associé à chaque ticket est déterminé instantanément lors de la saisie du
                  code sur le Site. Le participant est informé de son gain immédiatement à
                  l&apos;écran et par courrier électronique à l&apos;adresse renseignée lors de
                  son inscription.
                </p>
                <p>
                  En cas de litige concernant la validité d&apos;un code ou d&apos;un gain,
                  l&apos;éditeur procédera à une vérification et sa décision sera définitive et
                  sans appel.
                </p>
                <p>
                  Toute participation frauduleuse (code falsifié, compte multiple, utilisation de
                  robots ou scripts automatisés) entraîne la nullité de la participation et
                  l&apos;annulation du gain.
                </p>
              </div>
            </section>

            {/* Article 9 */}
            <section id="remise" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">Article 9 - Remise des lots</h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Les lots sont à retirer directement en boutique sur présentation :
                </p>
                <ul className="ml-4 list-disc space-y-1 pl-4">
                  <li>D&apos;une pièce d&apos;identité en cours de validité ;</li>
                  <li>Du ticket de caisse original ayant servi à la participation ;</li>
                  <li>De la confirmation de gain reçue par email (version numérique acceptée).</li>
                </ul>
                <p>
                  Les lots doivent être réclamés au plus tard le{' '}
                  <strong>{formatFrenchDateTime(CLAIM_END_DATE)}</strong> ({CLAIM_DURATION_DAYS}{' '}
                  jours après la clôture du jeu). Passé ce délai, une clause de forclusion
                  s&apos;applique automatiquement : les lots standard restent la propriété de la
                  marque, tandis que les lots majeurs sont réintégrés dans un tirage au sort final
                  supervisé par le commissaire de justice.
                </p>
                <p>
                  Le grand lot « Un an de thé offert » fait l&apos;objet d&apos;une remise
                  individuelle après vérification d&apos;identité et signature d&apos;un formulaire
                  de cession de droits à l&apos;image, en cas de communication liée au concours
                  (participation non obligatoire).
                </p>
              </div>
            </section>

            {/* Article 10 */}
            <section id="propriete" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">
                Article 10 - Propriété intellectuelle
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  L&apos;ensemble des éléments constituant le Site (textes, images, logos, marques,
                  graphismes, icônes, sons, logiciels, base de données, etc.) est protégé par le
                  droit de la propriété intellectuelle et appartient à Thé Tip Top ou à ses
                  partenaires.
                </p>
                <p>
                  Toute reproduction, représentation, modification, publication, transmission ou
                  dénaturation, totale ou partielle, du Site ou de son contenu, par quelque procédé
                  que ce soit et sur quelque support que ce soit, est strictement interdite sans
                  l&apos;autorisation écrite préalable de l&apos;éditeur.
                </p>
                <p>
                  L&apos;utilisateur dispose d&apos;un droit de consultation et d&apos;utilisation
                  à titre strictement personnel et non commercial des contenus du Site.
                </p>
              </div>
            </section>

            {/* Article 11 */}
            <section id="responsabilite" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">Article 11 - Responsabilité</h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  L&apos;éditeur s&apos;engage à mettre en œuvre tous les moyens nécessaires pour
                  assurer l&apos;exactitude et la mise à jour des informations disponibles sur le
                  Site. Toutefois, il ne peut garantir l&apos;exhaustivité, la précision ou
                  l&apos;actualité de ces informations.
                </p>
                <p>La responsabilité de l&apos;éditeur ne saurait être engagée :</p>
                <ul className="ml-4 list-disc space-y-1 pl-4">
                  <li>
                    En cas d&apos;indisponibilité temporaire du Site pour des raisons de
                    maintenance ou de force majeure ;
                  </li>
                  <li>
                    En cas de dommages résultant d&apos;une utilisation du Site non conforme aux
                    présentes CGU ;
                  </li>
                  <li>
                    Pour les contenus de sites tiers vers lesquels des liens hypertextes pourraient
                    pointer depuis le Site ;
                  </li>
                  <li>
                    En cas de perte ou de corruption de données résultant d&apos;un accès non
                    autorisé à un compte utilisateur due à la négligence de ce dernier
                    (mot de passe compromis).
                  </li>
                </ul>
                <p>
                  Le participant est seul responsable de la conservation de son ticket de caisse.
                  En aucun cas l&apos;éditeur ne pourra être tenu responsable de la perte ou du vol
                  d&apos;un ticket.
                </p>
              </div>
            </section>

            {/* Article 12 */}
            <section id="donnees" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">
                Article 12 - Protection des données personnelles
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Thé Tip Top collecte et traite des données personnelles dans le cadre de
                  l&apos;utilisation du Site et de la participation au jeu-concours, conformément
                  au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679)
                  et à la loi Informatique et Libertés.
                </p>
                <p>
                  <strong>Données collectées :</strong> nom, prénom, adresse email, date de
                  naissance (pour vérification de majorité), adresse postale (pour la remise de
                  certains lots).
                </p>
                <p>
                  <strong>Finalités :</strong> gestion du compte participant, organisation et
                  gestion du jeu-concours, remise des lots, communication relative au jeu-concours
                  (avec consentement).
                </p>
                <p>
                  <strong>Durée de conservation :</strong> les données sont conservées pour la
                  durée du jeu-concours augmentée d&apos;un délai de 3 ans à des fins probatoires,
                  sauf exercice d&apos;un droit de suppression par l&apos;utilisateur.
                </p>
                <p>Conformément à la réglementation, vous disposez des droits suivants :</p>
                <ul className="ml-4 list-disc space-y-1 pl-4">
                  <li>Droit d&apos;accès à vos données ;</li>
                  <li>Droit de rectification ;</li>
                  <li>Droit à l&apos;effacement (« droit à l&apos;oubli »), sous réserve des
                    obligations légales de conservation ;</li>
                  <li>Droit d&apos;opposition au traitement ;</li>
                  <li>Droit à la portabilité des données ;</li>
                  <li>Droit de définir des directives post-mortem.</li>
                </ul>
                <p>
                  Ces droits peuvent être exercés par email à{' '}
                  <a
                    href="mailto:rgpd@thetiptop.fr"
                    className="text-terracotta-600 underline underline-offset-2"
                  >
                    rgpd@thetiptop.fr
                  </a>{' '}
                  ou par courrier postal à l&apos;adresse du siège social. Pour en savoir plus,
                  consultez notre{' '}
                  <Link
                    href="/politique-confidentialite"
                    className="text-terracotta-600 underline underline-offset-2"
                  >
                    Politique de confidentialité
                  </Link>
                  .
                </p>
              </div>
            </section>

            {/* Article 13 */}
            <section id="cookies" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">Article 13 - Cookies</h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Le Site utilisé des cookies afin d&apos;améliorer l&apos;expérience utilisateur
                  et d&apos;assurer le bon fonctionnement des services proposés. Certains cookies
                  sont strictement nécessaires au fonctionnement du Site (session, authentification) ;
                  d&apos;autres sont utilisés à des fins d&apos;analyse d&apos;audience
                  (Google Analytics) sous réserve de votre consentement.
                </p>
                <p>
                  Vous pouvez configurer vos préférences en matière de cookies à tout moment via
                  notre page de{' '}
                  <Link
                    href="/gestion-cookies"
                    className="text-terracotta-600 underline underline-offset-2"
                  >
                    gestion des cookies
                  </Link>
                  . Le refus des cookies analytiques n&apos;affecte pas votre accès au Site ni
                  votre participation au jeu-concours.
                </p>
              </div>
            </section>

            {/* Article 14 */}
            <section id="droit" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">
                Article 14 - Droit applicable et juridiction compétente
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Les présentes CGU sont soumises au droit français. En cas de litige relatif à
                  leur interprétation ou à leur exécution, les parties s&apos;engagent à rechercher
                  une solution amiable avant toute action judiciaire.
                </p>
                <p>
                  À défaut de résolution amiable dans un délai de 30 jours à compter de la
                  notification du litige, tout différend sera soumis à la compétence exclusive des
                  tribunaux du ressort de Paris, sauf disposition d&apos;ordre public contraire.
                </p>
                <p>
                  Conformément à l&apos;article L.616-1 du Code de la consommation, en cas de
                  litige avec un consommateur, ce dernier peut recourir gratuitement à un médiateur
                  de la consommation. Les coordonnées du médiateur compétent peuvent être obtenues
                  auprès de l&apos;éditeur sur demande.
                </p>
              </div>
            </section>

            {/* Bas de page */}
            <div className="rounded-card border border-warm-beige bg-white p-6">
              <p className="text-sm text-stone-grey">
                Pour toute question relative aux présentes CGU ou au règlement du jeu-concours,
                vous pouvez nous contacter à{' '}
                <a
                  href="mailto:contact@thetiptop.fr"
                  className="font-medium text-terracotta-600 underline underline-offset-2"
                >
                  contact@thetiptop.fr
                </a>{' '}
                ou consulter notre page de{' '}
                <Link
                  href="/mentions-legales"
                  className="font-medium text-terracotta-600 underline underline-offset-2"
                >
                  mentions légales
                </Link>
                .
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
