import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mentions Légales',
  description:
    'Mentions légales obligatoires du site The Tip Top - identification de l\'éditeur, hébergeur et informations réglementaires.',
};

const ARTICLES = [
  { id: 'editeur', label: "1. Éditeur du site" },
  { id: 'hebergeur', label: "2. Hébergeur" },
  { id: 'directeur', label: "3. Directeur de la publication" },
  { id: 'activite', label: "4. Activité réglementée" },
  { id: 'propriete', label: "5. Propriété intellectuelle" },
  { id: 'responsabilite', label: "6. Responsabilité" },
  { id: 'liens', label: "7. Liens hypertextes" },
  { id: 'donnees', label: "8. Données personnelles" },
  { id: 'cookies', label: "9. Cookies" },
  { id: 'droit', label: "10. Droit applicable" },
];

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cream">
      {/* En-tête */}
      <section className="border-b border-warm-beige bg-white">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <p className="font-functional text-ui uppercase tracking-[2px] text-terracotta-deep">
            Informations légales
          </p>
          <h1 className="mt-3 font-display text-h1 text-noir">
            Mentions Légales
          </h1>
          <p className="mt-4 max-w-2xl text-body text-stone-grey">
            Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance
            en l&apos;économie numérique (LCEN), les présentes mentions légales identifient
            l&apos;éditeur du site internet Thé Tip Top.
          </p>
          <p className="mt-4 text-sm text-stone-grey/70">
            Dernière mise à jour : 9 juin 2026
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
                    className="block rounded-soft px-2 py-1.5 text-sm text-stone-grey transition-colors hover:bg-cream hover:text-terracotta-deep"
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
                    href="/cgu"
                    className="block rounded-soft px-2 py-1.5 text-sm text-stone-grey transition-colors hover:bg-cream hover:text-terracotta-deep"
                  >
                    CGU
                  </Link>
                  <Link
                    href="/politique-confidentialite"
                    className="block rounded-soft px-2 py-1.5 text-sm text-stone-grey transition-colors hover:bg-cream hover:text-terracotta-deep"
                  >
                    Politique de confidentialité
                  </Link>
                  <Link
                    href="/gestion-cookies"
                    className="block rounded-soft px-2 py-1.5 text-sm text-stone-grey transition-colors hover:bg-cream hover:text-terracotta-deep"
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
                Article 1 - Éditeur du site
              </h2>
              <div className="mt-4 space-y-4 text-body text-stone-grey">
                <p>
                  Le site internet accessible à l&apos;adresse{' '}
                  <strong>thetiptop.dsp5-archi-o24a-4-5-g1.fr</strong> est édité par :
                </p>
                <div className="overflow-hidden rounded-card border border-warm-beige bg-white">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-warm-beige">
                      {[
                        ['Raison sociale', 'Thé Tip Top'],
                        ['Forme juridique', 'Société Anonyme (SA)'],
                        ['Capital social', '150 000€'],
                        ['Siège social', '18 rue Léon Frot, 75011 Paris - France'],
                        ['Numéro SIREN', '123 456 789'],
                        ['Numéro SIRET', '123 456 789 00010'],
                        ['Numéro RCS', 'Paris B 123 456 789'],
                        ['Numéro de TVA intracommunautaire', 'FR 01 123456789'],
                        ['Téléphone', '+33 1 23 74 85 96'],
                        ['Email', 'contact@thetiptop.fr'],
                      ].map(([label, value]) => (
                        <tr key={label} className="even:bg-cream">
                          <td className="px-4 py-3 font-medium text-noir">{label}</td>
                          <td className="px-4 py-3 text-stone-grey">
                            {label === 'Email' ? (
                              <a
                                href="mailto:contact@thetiptop.fr"
                                className="text-terracotta-deep underline underline-offset-2"
                              >
                                {value}
                              </a>
                            ) : (
                              value
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="rounded-soft border border-gold-100 bg-gold-50 px-4 py-3 text-sm text-stone-grey">
                  <strong>Note :</strong> Conformément à l&apos;article 2 de la loi Toubon du
                  4 août 1994, les présentes mentions légales sont rédigées en langue française.
                </p>
              </div>
            </section>

            {/* Article 2 */}
            <section id="hebergeur" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">Article 2 - Hébergeur</h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>Le site est hébergé par :</p>
                <div className="overflow-hidden rounded-card border border-warm-beige bg-white">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-warm-beige">
                      {[
                        ['Société', 'OVHcloud'],
                        ['Adresse', '2 rue Kellermann, 59100 Roubaix - France'],
                        ['Téléphone client', '1007'],
                        ['Site web', 'www.ovhcloud.com'],
                      ].map(([label, value]) => (
                        <tr key={label} className="even:bg-cream">
                          <td className="px-4 py-3 font-medium text-noir">{label}</td>
                          <td className="px-4 py-3 text-stone-grey">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-stone-grey/80">
                  OVHcloud garantit la mise à disposition de l&apos;infrastructure technique permettant
                  l&apos;hébergement du site ainsi que la sécurité et la disponibilité des données. Les
                  données sont hébergées au sein de l&apos;Union européenne, conformément aux exigences
                  du RGPD.
                </p>
              </div>
            </section>

            {/* Article 3 */}
            <section id="directeur" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">
                Article 3 - Directeur de la publication
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Le directeur de la publication est <strong>Éric Bourdon</strong>, représentant légal de
                  la société Thé Tip Top.
                </p>
                <p>
                  Pour tout contact relatif au contenu éditorial du site :{' '}
                  <a
                    href="mailto:contact@thetiptop.fr"
                    className="text-terracotta-deep underline underline-offset-2"
                  >
                    contact@thetiptop.fr
                  </a>
                </p>
              </div>
            </section>

            {/* Article 4 */}
            <section id="activite" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">
                Article 4 - Activité réglementée
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Thé Tip Top exerce une activité de vente au détail de thés, infusions et produits
                  dérivés biologiques et artisanaux. Cette activité n&apos;est pas soumise à une
                  autorisation administrative préalable spécifique au sens de l&apos;article 19 de
                  la LCEN.
                </p>
                <p>
                  Le jeu-concours organisé sur ce site est conforme à la réglementation française
                  relative aux jeux promotionnels et loteries commerciales, et est déposé auprès du
                  commissaire de justice assermenté. Son règlement complet est consultable{' '}
                  <Link
                    href="/reglement"
                    className="text-terracotta-deep underline underline-offset-2"
                  >
                    ici
                  </Link>
                  .
                </p>
              </div>
            </section>

            {/* Article 5 */}
            <section id="propriete" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">
                Article 5 - Propriété intellectuelle
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  L&apos;ensemble du contenu de ce site (textes, images, photographies, vidéos,
                  logos, icônes, sons, logiciels, mise en page, charte graphique et tout autre
                  élément composant le site) est la propriété exclusive de Thé Tip Top ou de ses
                  partenaires, et est protégé par les lois françaises et internationales relatives
                  à la propriété intellectuelle.
                </p>
                <p>
                  Toute reproduction, représentation, modification, publication, adaptation,
                  traduction ou exploitation, totale ou partielle, des éléments du site, par
                  quelque moyen ou procédé que ce soit, est interdite sans l&apos;autorisation
                  écrite préalable de Thé Tip Top, sous peine de poursuites judiciaires.
                </p>
                <p>
                  Les marques et logos reproduits sur le site sont déposés par les sociétés qui
                  en sont propriétaires. Toute reproduction non autorisée de ces marques et logos
                  engage la responsabilité de son auteur.
                </p>
              </div>
            </section>

            {/* Article 6 */}
            <section id="responsabilite" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">Article 6 - Responsabilité</h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Thé Tip Top met tout en œuvre pour offrir aux utilisateurs des informations
                  disponibles et vérifiées. Cependant, l&apos;éditeur ne peut garantir
                  l&apos;exactitude, la complétude, l&apos;actualité des informations diffusées
                  sur le site.
                </p>
                <p>
                  En conséquence, l&apos;utilisateur reconnaît utiliser ces informations sous sa
                  responsabilité exclusive. L&apos;éditeur ne pourra être tenu responsable :
                </p>
                <ul className="ml-4 list-disc space-y-1 pl-4">
                  <li>
                    De tout dommage direct ou indirect causé à l&apos;utilisateur résultant de
                    l&apos;accès ou de l&apos;utilisation du site ;
                  </li>
                  <li>
                    De toute interruption ou indisponibilité du site pour quelque raison que ce
                    soit (maintenance, panne technique, force majeure) ;
                  </li>
                  <li>
                    De l&apos;intrusion d&apos;un tiers ayant entraîné une modification des
                    informations mises à disposition sur le site ;
                  </li>
                  <li>
                    Plus généralement, de tout événement qualifiable de cas de force majeure.
                  </li>
                </ul>
              </div>
            </section>

            {/* Article 7 */}
            <section id="liens" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">Article 7 - Liens hypertextes</h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Le site peut contenir des liens hypertextes vers d&apos;autres sites internet.
                  Thé Tip Top n&apos;exerce aucun contrôle sur ces sites et décline toute
                  responsabilité quant à leur contenu ou leur politique de confidentialité.
                </p>
                <p>
                  La création de liens hypertextes vers le site Thé Tip Top est autorisée sous
                  réserve que ces liens ne soient pas utilisés à des fins commerciales ou
                  publicitaires et qu&apos;ils n&apos;induisent pas en erreur l&apos;internaute
                  sur la nature ou l&apos;origine du contenu. Toute demande d&apos;autorisation
                  doit être adressée à{' '}
                  <a
                    href="mailto:contact@thetiptop.fr"
                    className="text-terracotta-deep underline underline-offset-2"
                  >
                    contact@thetiptop.fr
                  </a>
                  .
                </p>
              </div>
            </section>

            {/* Article 8 */}
            <section id="donnees" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">
                Article 8 - Données personnelles
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Thé Tip Top collecte et traite des données à caractère personnel dans le strict
                  respect du Règlement Général sur la Protection des Données (RGPD - Règlement
                  UE 2016/679) et de la loi Informatique et Libertés du 6 janvier 1978 modifiée.
                </p>
                <p>
                  Pour toute information relative au traitement de vos données personnelles,
                  consultez notre{' '}
                  <Link
                    href="/politique-confidentialite"
                    className="text-terracotta-deep underline underline-offset-2"
                  >
                    Politique de confidentialité
                  </Link>
                  .
                </p>
                <p>
                  Vous pouvez exercer vos droits (accès, rectification, suppression, opposition,
                  portabilité) en contactant :{' '}
                  <a
                    href="mailto:rgpd@thetiptop.fr"
                    className="text-terracotta-deep underline underline-offset-2"
                  >
                    rgpd@thetiptop.fr
                  </a>
                </p>
                <p>
                  En cas de réclamation non résolue, vous disposez du droit de saisir la{' '}
                  <strong>CNIL</strong> - Commission Nationale de l&apos;Informatique et des
                  Libertés, 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07
                  (<a
                    href="https://www.cnil.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-terracotta-deep underline underline-offset-2"
                  >
                    www.cnil.fr
                  </a>).
                </p>
              </div>
            </section>

            {/* Article 9 */}
            <section id="cookies" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">Article 9 - Cookies</h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Le site utilise des cookies afin d&apos;assurer son bon fonctionnement et
                  d&apos;améliorer l&apos;expérience utilisateur. Certains cookies sont
                  strictement nécessaires (session, authentification) ; d&apos;autres sont soumis
                  à votre consentement préalable (mesure d&apos;audience via Google Analytics).
                </p>
                <p>
                  Vous pouvez configurer ou révoquer vos préférences à tout moment via notre
                  page de{' '}
                  <Link
                    href="/gestion-cookies"
                    className="text-terracotta-deep underline underline-offset-2"
                  >
                    gestion des cookies
                  </Link>
                  .
                </p>
              </div>
            </section>

            {/* Article 10 */}
            <section id="droit" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-noir">
                Article 10 - Droit applicable et médiation
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Le présent site est soumis au droit français. Tout litige relatif à
                  l&apos;utilisation du site relève de la compétence exclusive des tribunaux
                  français, sous réserve des règles d&apos;ordre public applicables aux
                  consommateurs.
                </p>
                <p>
                  Conformément à l&apos;article L.616-1 du Code de la consommation et au
                  Règlement européen n° 524/2013, tout consommateur a le droit de recourir
                  gratuitement à un médiateur de la consommation en vue de la résolution amiable
                  d&apos;un litige. Les coordonnées du médiateur compétent peuvent être obtenues
                  sur simple demande à{' '}
                  <a
                    href="mailto:contact@thetiptop.fr"
                    className="text-terracotta-deep underline underline-offset-2"
                  >
                    contact@thetiptop.fr
                  </a>
                  .
                </p>
              </div>
            </section>

            {/* Mention projet pédagogique */}
            <section className="rounded-card border-2 border-gold-200 bg-gold-50 p-6">
              <h3 className="font-display text-h3 text-noir">
                Mention relative au projet pédagogique
              </h3>
              <p className="mt-3 text-sm text-stone-grey">
                Ce site internet a été réalisé dans le cadre d&apos;un projet pédagogique lié à la
                formation <strong>Expert en Stratégie et Transformation Digitale</strong>. Les
                informations, contenus et fonctionnalités présentés ont uniquement une vocation
                démonstrative. <strong>Aucun achat réel ne peut être effectué via cette
                plateforme.</strong>
              </p>
            </section>

            {/* Pied de page article */}
            <div className="rounded-card border border-warm-beige bg-white p-6">
              <p className="text-sm text-stone-grey">
                Pour toute question relative aux présentes mentions légales, contactez-nous à{' '}
                <a
                  href="mailto:contact@thetiptop.fr"
                  className="font-medium text-terracotta-deep underline underline-offset-2"
                >
                  contact@thetiptop.fr
                </a>
                . Consultez également nos{' '}
                <Link
                  href="/cgu"
                  className="font-medium text-terracotta-deep underline underline-offset-2"
                >
                  CGU
                </Link>{' '}
                et notre{' '}
                <Link
                  href="/politique-confidentialite"
                  className="font-medium text-terracotta-deep underline underline-offset-2"
                >
                  Politique de confidentialité
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
