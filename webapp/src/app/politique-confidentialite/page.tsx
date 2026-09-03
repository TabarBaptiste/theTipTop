import type { Metadata } from 'next';
import Link from 'next/link';
import { formatFrenchDate } from '@/lib/french-date';
import { LEGAL_UPDATED_AT } from '@/lib/legal-dates';

export const metadata: Metadata = {
  // URL de reference : evite qu'un parametre de campagne ou une variante
  // avec barre finale soit traite comme une page distincte.
  alternates: { canonical: '/politique-confidentialite' },
  title: 'Politique de confidentialité',
  description:
    'Politique de confidentialité et protection des données personnelles du site Thé Tip Top - RGPD, droits des utilisateurs, cookies.',
};

const ARTICLES = [
  { id: 'responsable', label: '1. Responsable du traitement' },
  { id: 'donnees', label: '2. Données collectées' },
  { id: 'finalites', label: '3. Finalités des traitements' },
  { id: 'base-legale', label: '4. Base légale' },
  { id: 'conservation', label: '5. Durée de conservation' },
  { id: 'destinataires', label: '6. Destinataires' },
  { id: 'transferts', label: '7. Transferts hors UE' },
  { id: 'droits', label: '8. Vos droits' },
  { id: 'cookies', label: '9. Cookies et traceurs' },
  { id: 'securite', label: '10. Sécurité' },
  { id: 'cnil', label: '11. Réclamation auprès de la CNIL' },
  { id: 'modification', label: '12. Modification de la politique' },
];

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-[calc(100vh-3.75rem)] bg-cream">
      {/* En-tête */}
      <section className="border-b border-warm-beige bg-surface">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <p className="font-functional text-ui uppercase tracking-[2px] text-accent">
            Informations légales
          </p>
          <h1 className="mt-3 font-display text-h1 text-ink">
            Politique de confidentialité
          </h1>
          <p className="mt-4 max-w-2xl text-body text-stone-grey">
            Thé Tip Top s&apos;engage à protéger vos données personnelles. La présente politique
            décrit comment nous collectons, utilisons et protégeons vos informations dans le
            respect du Règlement Général sur la Protection des Données (RGPD - UE 2016/679) et
            de la loi Informatique et Libertés.
          </p>
          <p className="mt-4 text-sm text-stone-grey/80">
            Dernière mise à jour : {formatFrenchDate(LEGAL_UPDATED_AT.politiqueConfidentialite)}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[260px_1fr] lg:gap-12">
          {/* Sommaire */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-card border border-warm-beige bg-surface p-6">
              <p className="font-functional text-ui uppercase tracking-[2px] text-stone-grey">
                Sommaire
              </p>
              <nav className="mt-4 space-y-1">
                {ARTICLES.map((a) => (
                  <a
                    key={a.id}
                    href={`#${a.id}`}
                    className="block rounded-soft px-2 py-1.5 text-sm text-stone-grey transition-colors hover:bg-cream hover:text-accent"
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
                    className="block rounded-soft px-2 py-1.5 text-sm text-stone-grey transition-colors hover:bg-cream hover:text-accent"
                  >
                    CGU
                  </Link>
                  <Link
                    href="/mentions-legales"
                    className="block rounded-soft px-2 py-1.5 text-sm text-stone-grey transition-colors hover:bg-cream hover:text-accent"
                  >
                    Mentions légales
                  </Link>
                  <Link
                    href="/gestion-cookies"
                    className="block rounded-soft px-2 py-1.5 text-sm text-stone-grey transition-colors hover:bg-cream hover:text-accent"
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
            <section id="responsable" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">
                Article 1 - Responsable du traitement
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>Le responsable du traitement des données personnelles collectées sur ce site est :</p>
                <div
                  // Defilable plutot que coupe : a 375 px ces tableaux depassent
                  // le cadre, et overflow-hidden rendait la derniere colonne
                  // inatteignable. tabIndex rend la zone defilable au clavier,
                  // sans quoi son contenu resterait hors de portee sans souris.
                  tabIndex={0}
                  className="overflow-x-auto rounded-card border border-warm-beige bg-surface"
                >
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-warm-beige">
                      {[
                        ['Responsable', 'Thé Tip Top - Société Anonyme (SA)'],
                        ['Adresse', '18 rue Léon Frot, 75011 Paris - France'],
                        ['Email contact', 'contact@thetiptop.fr'],
                        ['Email RGPD', 'rgpd@thetiptop.fr'],
                        ['Téléphone', '+33 1 23 74 85 96'],
                      ].map(([label, value]) => (
                        <tr key={label} className="even:bg-cream">
                          <td className="px-4 py-3 font-medium text-ink">{label}</td>
                          <td className="px-4 py-3 text-stone-grey">
                            {label === 'Email contact' ? (
                              <a
                                href="mailto:contact@thetiptop.fr"
                                className="text-accent underline underline-offset-2"
                              >
                                {value}
                              </a>
                            ) : label === 'Email RGPD' ? (
                              <a
                                href="mailto:rgpd@thetiptop.fr"
                                className="text-accent underline underline-offset-2"
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
                <p className="text-sm text-stone-grey/80">
                  En l&apos;absence d&apos;un délégué à la protection des données (DPO) désigné
                  formellement, toute demande relative à la protection des données peut être
                  adressée directement à l&apos;email ci-dessus.
                </p>
              </div>
            </section>

            {/* Article 2 */}
            <section id="donnees" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">
                Article 2 - Données collectées
              </h2>
              <div className="mt-4 space-y-4 text-body text-stone-grey">
                <p>
                  Selon la manière dont vous utilisez le site et participez au jeu-concours, nous
                  pouvons être amenés à collecter les catégories de données suivantes :
                </p>
                <div className="space-y-3">
                  {[
                    {
                      title: 'Données d\'identification',
                      items: ['Nom et prénom', 'Adresse email', 'Date de naissance (vérification de majorité)'],
                    },
                    {
                      title: 'Données de contact',
                      items: ['Adresse postale (remise de lots)', 'Numéro de téléphone (optionnel)'],
                    },
                    {
                      title: 'Données de connexion',
                      items: ['Adresse IP', 'Données de navigation (pages visitées, durée de session)', 'Type de navigateur et système d\'exploitation'],
                    },
                    {
                      title: 'Données liées au jeu-concours',
                      items: ['Codes tickets saisis', 'Lots attribués', 'Date et heure de participation'],
                    },
                  ].map((cat) => (
                    <div
                      key={cat.title}
                      className="rounded-card border border-warm-beige bg-surface p-4"
                    >
                      <p className="font-medium text-ink">{cat.title}</p>
                      <ul className="mt-2 ml-4 list-disc space-y-0.5 pl-2 text-sm text-stone-grey">
                        {cat.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-stone-grey/80">
                  Aucune donnée sensible (santé, origine ethnique, convictions religieuses ou
                  politiques, etc.) n&apos;est collectée sur ce site.
                </p>
              </div>
            </section>

            {/* Article 3 */}
            <section id="finalites" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">
                Article 3 - Finalités des traitements
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>Vos données sont traitées pour les finalités suivantes :</p>
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
                        <th className="px-4 py-3 text-left font-functional text-[0.625rem] uppercase tracking-[2px]">Finalité</th>
                        <th className="px-4 py-3 text-left font-functional text-[0.625rem] uppercase tracking-[2px]">Base légale</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warm-beige bg-surface">
                      {[
                        ['Création et gestion du compte participant', 'Exécution du contrat'],
                        ['Organisation et gestion du jeu-concours', 'Exécution du contrat'],
                        ['Attribution et remise des lots', 'Exécution du contrat'],
                        ['Envoi des confirmations de participation par email', 'Exécution du contrat'],
                        ['Prévention de la fraude (multi-comptes, codes falsifiés)', 'Intérêt légitime'],
                        ['Mesure d\'audience et amélioration du site (Google Analytics)', 'Consentement'],
                        ['Envoi de communications commerciales (newsletter)', 'Consentement'],
                        ['Respect des obligations légales et comptables', 'Obligation légale'],
                      ].map(([finalite, base]) => (
                        <tr key={finalite} className="even:bg-cream">
                          <td className="px-4 py-3 text-stone-grey">{finalite}</td>
                          <td className="px-4 py-3 font-medium text-accent">{base}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Article 4 */}
            <section id="base-legale" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">Article 4 - Base légale</h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>Conformément à l&apos;article 6 du RGPD, les traitements reposent sur :</p>
                <ul className="ml-4 space-y-2 pl-4">
                  <li>
                    <strong>L&apos;exécution du contrat</strong> - pour la gestion de votre compte
                    et votre participation au jeu-concours ;
                  </li>
                  <li>
                    <strong>L&apos;intérêt légitime</strong> - pour la sécurisation du site et la
                    prévention des fraudes ;
                  </li>
                  <li>
                    <strong>Le consentement</strong> - pour les cookies analytiques et les
                    communications commerciales (consentement librement donné, spécifique,
                    éclairé et révocable à tout moment) ;
                  </li>
                  <li>
                    <strong>L&apos;obligation légale</strong> - pour la conservation des données
                    à des fins comptables et probatoires.
                  </li>
                </ul>
              </div>
            </section>

            {/* Article 5 */}
            <section id="conservation" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">
                Article 5 - Durée de conservation
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
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
                        <th className="px-4 py-3 text-left font-functional text-[0.625rem] uppercase tracking-[2px]">Catégorie</th>
                        <th className="px-4 py-3 text-left font-functional text-[0.625rem] uppercase tracking-[2px]">Durée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warm-beige bg-surface">
                      {[
                        ['Compte participant (actif)', 'Durée de vie du compte + 3 ans après clôture'],
                        ['Données du jeu-concours', '3 ans à compter de la fin du jeu (fins probatoires)'],
                        ['Logs de connexion / adresses IP', '1 an (sécurité informatique)'],
                        ['Données de mesure d\'audience', '25 mois (paramétrage Google Analytics)'],
                        ['Données comptables', '10 ans (obligation légale)'],
                        ['Consentements enregistrés', '3 ans à compter du recueil'],
                      ].map(([cat, duree]) => (
                        <tr key={cat} className="even:bg-cream">
                          <td className="px-4 py-3 text-stone-grey">{cat}</td>
                          <td className="px-4 py-3 text-stone-grey">{duree}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-stone-grey/80">
                  Au-delà de ces délais, les données sont supprimées de manière sécurisée ou
                  anonymisées à des fins statistiques.
                </p>
              </div>
            </section>

            {/* Article 6 */}
            <section id="destinataires" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">Article 6 - Destinataires</h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Vos données personnelles sont strictement confidentielles. Elles ne sont
                  communiquées qu&apos;aux destinataires suivants, dans la limite de leurs
                  attributions respectives :
                </p>
                <ul className="ml-4 list-disc space-y-1 pl-4">
                  <li>
                    <strong>L&apos;équipe Thé Tip Top</strong> - gestion des comptes participants
                    et remise des lots ;
                  </li>
                  <li>
                    <strong>L&apos;hébergeur du site</strong> - dans le cadre de la fourniture
                    de l&apos;infrastructure technique (accès limité aux données nécessaires) ;
                  </li>
                  <li>
                    <strong>Google LLC</strong> - uniquement si vous avez consenti à Google
                    Analytics (données de navigation anonymisées) ou si vous utilisez
                    l&apos;authentification Google ;
                  </li>
                  <li>
                    <strong>Les autorités compétentes</strong> - si requis par une obligation
                    légale ou réglementaire.
                  </li>
                </ul>
                <p>
                  Vos données ne sont <strong>jamais vendues</strong> ni cédées à des tiers à des
                  fins commerciales.
                </p>
              </div>
            </section>

            {/* Article 7 */}
            <section id="transferts" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">
                Article 7 - Transferts hors Union européenne
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Les données sont hébergées au sein de l&apos;Union européenne. Toutefois,
                  l&apos;utilisation de Google Analytics implique un transfert de données vers
                  les États-Unis (Google LLC). Ce transfert est encadré par les Clauses
                  Contractuelles Types (CCT) approuvées par la Commission européenne et par le
                  cadre adéquat UE-États-Unis (Data Privacy Framework).
                </p>
                <p>
                  L&apos;utilisation de la connexion via un compte Google ou Facebook peut
                  également impliquer des transferts vers des pays tiers, soumis aux mêmes
                  garanties contractuelles.
                </p>
              </div>
            </section>

            {/* Article 8 */}
            <section id="droits" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">Article 8 - Vos droits</h2>
              <div className="mt-4 space-y-4 text-body text-stone-grey">
                <p>
                  Conformément au RGPD, vous disposez des droits suivants sur vos données
                  personnelles :
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      droit: 'Droit d\'accès',
                      desc: 'Obtenir la confirmation que vos données sont traitées et en recevoir une copie.',
                    },
                    {
                      droit: 'Droit de rectification',
                      desc: 'Faire corriger des données inexactes ou compléter des données incomplètes.',
                    },
                    {
                      droit: 'Droit à l\'effacement',
                      desc: 'Demander la suppression de vos données, sous réserve des obligations légales de conservation.',
                    },
                    {
                      droit: 'Droit d\'opposition',
                      desc: 'Vous opposer au traitement de vos données fondé sur l\'intérêt légitime ou à des fins de prospection.',
                    },
                    {
                      droit: 'Droit à la limitation',
                      desc: 'Suspendre temporairement le traitement de vos données dans certains cas.',
                    },
                    {
                      droit: 'Droit à la portabilité',
                      desc: 'Recevoir vos données dans un format structuré et lisible par machine.',
                    },
                  ].map(({ droit, desc }) => (
                    <div
                      key={droit}
                      className="rounded-card border border-warm-beige bg-surface p-4"
                    >
                      <p className="font-medium text-ink">{droit}</p>
                      <p className="mt-1 text-sm text-stone-grey">{desc}</p>
                    </div>
                  ))}
                </div>
                <p>
                  Pour exercer l&apos;un de ces droits, envoyez votre demande par email à{' '}
                  <a
                    href="mailto:rgpd@thetiptop.fr"
                    className="text-accent underline underline-offset-2"
                  >
                    rgpd@thetiptop.fr
                  </a>{' '}
                  ou par courrier à : Thé Tip Top, 18 rue Léon Frot, 75011 Paris - France.
                </p>
                <p className="text-sm text-stone-grey/80">
                  Nous nous engageons à répondre dans un délai d&apos;un mois à compter de la
                  réception de votre demande. En cas de demande complexe ou nombreuse, ce délai
                  peut être prolongé de deux mois supplémentaires, avec information préalable.
                  Une pièce d&apos;identité peut être demandée pour vérifier votre identité.
                </p>
              </div>
            </section>

            {/* Article 9 */}
            <section id="cookies" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">Article 9 - Cookies et traceurs</h2>
              <div className="mt-4 space-y-4 text-body text-stone-grey">
                <p>
                  Un cookie est un petit fichier texte déposé sur votre appareil lors de la
                  consultation du site. Nous utilisons trois types de cookies :
                </p>
                <div className="space-y-3">
                  {[
                    {
                      type: 'Cookies strictement nécessaires',
                      color: 'border-moss-100 bg-moss-50',
                      badge: 'Toujours actifs',
                      badgeColor: 'bg-moss-100 text-moss-500',
                      desc: 'Indispensables au fonctionnement du site (gestion de session, authentification, sécurité CSRF). Ils ne peuvent pas être désactivés sans altérer le fonctionnement du site.',
                      exemples: ['session_token', 'csrf_token', 'auth_state'],
                    },
                    {
                      type: 'Cookies analytiques',
                      color: 'border-gold-100 bg-gold-50',
                      badge: 'Soumis au consentement',
                      badgeColor: 'bg-gold-100 text-gold-900',
                      desc: 'Permettent de mesurer l\'audience du site et d\'analyser le comportement des visiteurs afin d\'améliorer nos services (Google Analytics). Aucune donnée personnellement identifiable n\'est transmise à Google si l\'anonymisation IP est activée.',
                      exemples: ['_ga', '_gid', '_gat'],
                    },
                    {
                      type: 'Cookies tiers (authentification sociale)',
                      color: 'border-warm-beige bg-cream',
                      badge: 'Soumis au consentement',
                      badgeColor: 'bg-warm-beige text-stone-grey',
                      desc: 'Déposés par Google ou Facebook si vous utilisez ces services pour vous connecter. Leur politique de confidentialité propre s\'applique.',
                      exemples: ['G_AUTHUSER_H', 'fr (Facebook)'],
                    },
                  ].map(({ type, color, badge, badgeColor, desc, exemples }) => (
                    <div key={type} className={`rounded-card border p-4 ${color}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-ink">{type}</p>
                        <span className={`rounded-pill px-2 py-0.5 text-xs font-medium ${badgeColor}`}>
                          {badge}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-stone-grey">{desc}</p>
                      <p className="mt-2 text-xs text-stone-grey/80">
                        Exemples : {exemples.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
                <p>
                  Vous pouvez gérer vos préférences à tout moment via notre page de{' '}
                  <Link
                    href="/gestion-cookies"
                    className="text-accent underline underline-offset-2"
                  >
                    gestion des cookies
                  </Link>
                  . Vous pouvez également désactiver les cookies directement depuis les
                  paramètres de votre navigateur (Firefox, Chrome, Safari, Edge).
                </p>
                <p className="text-sm text-stone-grey/80">
                  Le refus des cookies analytiques n&apos;affecte pas votre accès au site ni
                  votre participation au jeu-concours.
                </p>
              </div>
            </section>

            {/* Article 10 */}
            <section id="securite" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">Article 10 - Sécurité</h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Thé Tip Top met en œuvre les mesures techniques et organisationnelles
                  appropriées pour protéger vos données contre toute perte, destruction,
                  altération, accès non autorisé ou divulgation accidentelle.
                </p>
                <ul className="ml-4 list-disc space-y-1 pl-4">
                  <li>Chiffrement des communications via HTTPS (TLS 1.3) ;</li>
                  <li>Stockage des mots de passe sous forme hachée (bcrypt) ;</li>
                  <li>Accès aux données restreint au personnel habilité ;</li>
                  <li>Journalisation des accès et surveillance des anomalies ;</li>
                  <li>Sauvegardes régulières et chiffrées des bases de données.</li>
                </ul>
                <p className="text-sm text-stone-grey/80">
                  En cas de violation de données susceptible d&apos;engendrer un risque pour
                  vos droits et libertés, nous nous engageons à en informer la CNIL dans les
                  72 heures et les personnes concernées dans les meilleurs délais, conformément
                  à l&apos;article 33 du RGPD.
                </p>
              </div>
            </section>

            {/* Article 11 */}
            <section id="cnil" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">
                Article 11 - Réclamation auprès de la CNIL
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Si vous estimez que le traitement de vos données personnelles ne respecte pas
                  la réglementation en vigueur, vous avez le droit d&apos;introduire une
                  réclamation auprès de l&apos;autorité de contrôle compétente, la{' '}
                  <strong>Commission Nationale de l&apos;Informatique et des Libertés (CNIL)</strong> :
                </p>
                <div className="rounded-card border border-warm-beige bg-surface p-4 text-sm">
                  <p className="font-medium text-ink">CNIL</p>
                  <p className="mt-1 text-stone-grey">3 Place de Fontenoy, TSA 80715</p>
                  <p className="text-stone-grey">75334 Paris Cedex 07</p>
                  <p className="mt-2">
                    <a
                      href="https://www.cnil.fr/fr/vous-souhaitez-contacter-la-cnil"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline underline-offset-2"
                    >
                      www.cnil.fr
                    </a>
                  </p>
                </div>
                <p className="text-sm text-stone-grey/80">
                  Nous vous encourageons à nous contacter en premier lieu à{' '}
                  <a
                    href="mailto:rgpd@thetiptop.fr"
                    className="text-accent underline underline-offset-2"
                  >
                    rgpd@thetiptop.fr
                  </a>{' '}
                  afin de tenter de résoudre toute réclamation de manière amiable.
                </p>
              </div>
            </section>

            {/* Article 12 */}
            <section id="modification" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">
                Article 12 - Modification de la politique
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Thé Tip Top se réserve le droit de modifier la présente politique de
                  confidentialité à tout moment, notamment pour se conformer à toute évolution
                  législative, réglementaire, jurisprudentielle ou technologique.
                </p>
                <p>
                  En cas de modification substantielle affectant vos droits, vous en serez
                  informé par email (si vous avez un compte) ou par une notification visible sur
                  le site. La date de mise à jour figure en haut de cette page. La version en
                  vigueur est toujours celle accessible sur le site.
                </p>
              </div>
            </section>

            {/* Pied de page article */}
            <div className="rounded-card border border-warm-beige bg-surface p-6">
              <p className="text-sm text-stone-grey">
                Pour toute question relative à vos données personnelles, contactez-nous à{' '}
                <a
                  href="mailto:rgpd@thetiptop.fr"
                  className="font-medium text-accent underline underline-offset-2"
                >
                  rgpd@thetiptop.fr
                </a>
                . Consultez également nos{' '}
                <Link
                  href="/mentions-legales"
                  className="font-medium text-accent underline underline-offset-2"
                >
                  Mentions légales
                </Link>{' '}
                et nos{' '}
                <Link
                  href="/cgu"
                  className="font-medium text-accent underline underline-offset-2"
                >
                  CGU
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
