import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock, BarChart2 } from 'lucide-react';
import { CookiePreferences } from '@/components/cookies/cookie-preferences';
import { formatFrenchDate } from '@/lib/french-date';
import { LEGAL_UPDATED_AT } from '@/lib/legal-dates';

export const metadata: Metadata = {
  // URL de reference : evite qu'un parametre de campagne ou une variante
  // avec barre finale soit traite comme une page distincte.
  alternates: { canonical: '/gestion-cookies' },
  title: 'Gestion des cookies',
  description:
    'Politique de gestion des cookies du site Thé Tip Top - types de cookies utilisés, durée de conservation, gestion de vos préférences.',
};

const ARTICLES = [
  { id: 'definition', label: "1. Qu'est-ce qu'un cookie ?" },
  { id: 'types', label: '2. Types de cookies utilisés' },
  { id: 'liste', label: '3. Liste détaillée des cookies' },
  { id: 'consentement', label: '4. Gestion du consentement' },
  { id: 'duree', label: '5. Durée de conservation' },
  { id: 'navigateur', label: '6. Paramètres du navigateur' },
  { id: 'contact', label: '7. Contact' },
];

const COOKIES_LIST = [
  {
    category: 'Cookies strictement nécessaires',
    badge: 'Toujours actifs',
    badgeClass: 'bg-moss-500/20 text-moss-900',
    headerClass: 'bg-moss-50 border-moss-100',
    items: [
      {
        name: 'refreshToken',
        emetteur: 'Thé Tip Top',
        finalite: 'Maintien de la session utilisateur authentifié',
        durée: '7 jours',
        type: 'Fonctionnel',
      },
      {
        name: 'cookie_consent',
        emetteur: 'Thé Tip Top',
        finalite: 'Mémorisation de vos préférences de consentement',
        durée: '13 mois',
        type: 'Fonctionnel',
      },
    ],
    description:
      "Ces cookies sont indispensables au bon fonctionnement du site. Ils permettent de gérer votre session, de sécuriser votre connexion et d'assurer la navigation. Ils ne peuvent pas être désactivés sans altérer les fonctionnalités essentielles du service.",
  },
  {
    category: "Cookies de mesure d'audience",
    badge: 'Soumis au consentement',
    badgeClass: 'bg-gold-500/20 text-gold-900',
    headerClass: 'bg-gold-50 border-gold-100',
    items: [
      {
        name: '_ga',
        emetteur: 'Google Analytics',
        finalite: 'Distinguer les utilisateurs uniques',
        durée: '2 ans',
        type: 'Analytique',
      },
      {
        name: '_ga_XXXXXXXX',
        emetteur: 'Google Analytics',
        finalite: 'Maintenir l\'état de la session Analytics',
        durée: '2 ans',
        type: 'Analytique',
      },
      {
        name: '_gid',
        emetteur: 'Google Analytics',
        finalite: 'Distinguer les utilisateurs sur courte durée',
        durée: '24 heures',
        type: 'Analytique',
      },
      {
        name: '_gat',
        emetteur: 'Google Analytics',
        finalite: 'Limiter le taux de requêtes vers les serveurs',
        durée: '1 minute',
        type: 'Analytique',
      },
    ],
    description:
      "Ces cookies permettent de mesurer l'audience du site et d'analyser le comportement des visiteurs (pages consultées, durée de navigation, origine du trafic) afin d'améliorer nos services. Ils ne sont déposés que si vous donnez votre consentement.",
  },
];

const NAVIGATEURS = [
  {
    name: 'Google Chrome',
    lien: 'https://support.google.com/chrome/answer/95647',
    instruction:
      'Paramètres → Confidentialité et sécurité → Cookies et autres données des sites',
  },
  {
    name: 'Mozilla Firefox',
    lien: 'https://support.mozilla.org/fr/kb/activer-desactiver-cookies',
    instruction: 'Paramètres → Vie privée et sécurité → Cookies et données de sites',
  },
  {
    name: 'Microsoft Edge',
    lien: 'https://support.microsoft.com/fr-fr/windows/supprimer-et-g%C3%A9rer-les-cookies',
    instruction: 'Paramètres → Confidentialité, recherche et services → Cookies',
  },
  {
    name: 'Apple Safari',
    lien: 'https://support.apple.com/fr-fr/guide/safari/sfri11471/mac',
    instruction: 'Préférences → Confidentialité → Cookies et données des sites web',
  },
];

export default function GestionCookiesPage() {
  return (
    <div className="min-h-[calc(100vh-3.75rem)] bg-cream">
      {/* En-tête */}
      <section className="border-b border-warm-beige bg-surface">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <p className="font-functional text-ui uppercase tracking-[2px] text-accent">
            Informations légales
          </p>
          <h1 className="mt-3 font-display text-h1 text-ink">Gestion des cookies</h1>
          <p className="mt-4 max-w-2xl text-body text-stone-grey">
            Lors de votre navigation sur le site Thé Tip Top, des cookies peuvent être déposés
            sur votre appareil. Cette page vous explique ce que sont ces cookies, lesquels nous
            utilisons et comment gérer vos préférences.
          </p>
          <p className="mt-4 text-sm text-stone-grey/80">
            Dernière mise à jour : {formatFrenchDate(LEGAL_UPDATED_AT.gestionCookies)}
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
                    href="/politique-confidentialite"
                    className="block rounded-soft px-2 py-1.5 text-sm text-stone-grey transition-colors hover:bg-cream hover:text-accent"
                  >
                    Politique de confidentialité
                  </Link>
                  <Link
                    href="/mentions-legales"
                    className="block rounded-soft px-2 py-1.5 text-sm text-stone-grey transition-colors hover:bg-cream hover:text-accent"
                  >
                    Mentions légales
                  </Link>
                </nav>
              </div>
            </div>
          </aside>

          {/* Contenu */}
          <article className="space-y-10">
            {/* Article 1 */}
            <section id="definition" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">
                Article 1 - Qu&apos;est-ce qu&apos;un cookie ?
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur,
                  tablette, smartphone) lors de la consultation d&apos;un site internet. Il
                  permet au site de mémoriser certaines informations sur votre visite pour
                  améliorer votre expérience de navigation.
                </p>
                <p>
                  Les cookies peuvent être déposés par le site lui-même (cookies
                  « propriétaires ») ou par des services tiers intégrés au site (cookies
                  « tiers »). Certains sont indispensables au fonctionnement du service,
                  d&apos;autres nécessitent votre consentement préalable.
                </p>
                <p>
                  Conformément aux recommandations de la{' '}
                  <strong>
                    Commission Nationale de l&apos;Informatique et des Libertés (CNIL)
                  </strong>{' '}
                  et au RGPD, les cookies non essentiels ne sont déposés qu&apos;après recueil
                  de votre consentement explicite. La simple poursuite de la navigation ne vaut
                  pas consentement.
                </p>
              </div>
            </section>

            {/* Article 2 */}
            <section id="types" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">
                Article 2 - Types de cookies utilisés
              </h2>
              <div className="mt-4 space-y-4 text-body text-stone-grey">
                <p>
                  Le site Thé Tip Top utilisé deux catégories de cookies selon leur finalité
                  et leur base légale :
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-card border border-moss-100 bg-moss-50 p-5">
                    <Lock
                      className="h-5 w-5 text-moss-500"
                      strokeWidth={1.5}
                    />
                    <p className="mt-3 font-functional text-ui uppercase tracking-[2px] text-moss-500">
                      Nécessaires
                    </p>
                    <p className="mt-2 text-sm text-stone-grey">
                      Indispensables au fonctionnement du site. Toujours actifs, non
                      désactivables.
                    </p>
                  </div>
                  <div className="rounded-card border border-gold-200 bg-gold-50 p-5">
                    <BarChart2
                      className="h-5 w-5 text-gold-600"
                      strokeWidth={1.5}
                    />
                    <p className="mt-3 font-functional text-ui uppercase tracking-[2px] text-gold-900">
                      Analytiques
                    </p>
                    <p className="mt-2 text-sm text-stone-grey">
                      Mesure d&apos;audience via Google Analytics. Activés avec votre
                      consentement.
                    </p>
                  </div>
                </div>
                <p className="text-sm text-stone-grey/80">
                  Aucun cookie marketing ou publicitaire (ex. Meta Pixel) n&apos;est déposé par le
                  site à ce jour.
                </p>
              </div>
            </section>

            {/* Article 3 */}
            <section id="liste" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">
                Article 3 - Liste détaillée des cookies
              </h2>
              <div className="mt-4 space-y-6">
                {COOKIES_LIST.map((cat) => (
                  <div
                    key={cat.category}
                    className="overflow-hidden rounded-card border border-warm-beige"
                  >
                    {/* En-tête catégorie */}
                    <div
                      className={`flex flex-wrap items-center gap-3 border-b border-warm-beige px-5 py-4 ${cat.headerClass}`}
                    >
                      <h3 className="font-functional text-ui uppercase tracking-[2px] text-ink">
                        {cat.category}
                      </h3>
                      <span
                        className={`rounded-pill px-3 py-0.5 font-functional text-[0.625rem] font-semibold uppercase tracking-[1.5px] ${cat.badgeClass}`}
                      >
                        {cat.badge}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="border-b border-warm-beige bg-surface px-5 py-3">
                      <p className="text-sm text-stone-grey">{cat.description}</p>
                    </div>

                    {/* Tableau. Ce conteneur defilait deja horizontalement,
                        mais sans etre atteignable au clavier : son contenu
                        debordant restait hors de portee sans souris. */}
                    <div tabIndex={0} role="region" aria-label="Tableau, défilement horizontal au clavier" className="overflow-x-auto bg-surface">
                      <table className="w-full text-sm">
                        <thead className="border-b border-warm-beige bg-cream">
                          <tr>
                            {[
                              'Nom du cookie',
                              'Émetteur',
                              'Finalité',
                              'Durée',
                              'Type',
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-4 py-2 text-left font-functional text-[0.625rem] uppercase tracking-[1.5px] text-stone-grey"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-warm-beige">
                          {cat.items.map((cookie) => (
                            <tr key={cookie.name} className="even:bg-cream/60">
                              <td className="px-4 py-3 font-mono text-xs text-ink">
                                {cookie.name}
                              </td>
                              <td className="px-4 py-3 text-stone-grey">{cookie.emetteur}</td>
                              <td className="px-4 py-3 text-stone-grey">{cookie.finalite}</td>
                              <td className="px-4 py-3 text-stone-grey">{cookie.durée}</td>
                              <td className="px-4 py-3 text-stone-grey">{cookie.type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Article 4 */}
            <section id="consentement" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">
                Article 4 - Gestion du consentement
              </h2>

              {/* La commande précède le texte explicatif : c'est ce que vient
                  chercher un visiteur arrivé ici depuis le bandeau, qui lui
                  promet de pouvoir changer d'avis. */}
              <div className="mt-4">
                <CookiePreferences />
              </div>

              <div className="mt-4 space-y-4 text-body text-stone-grey">
                <p>
                  Lors de votre première visite sur le site, un bandeau de gestion des cookies
                  s&apos;affiche et vous permet de choisir vos préférences avant tout dépôt de
                  cookie non essentiel. Le site n&apos;utilisant qu&apos;une seule catégorie de
                  cookie optionnelle (mesure d&apos;audience), le choix se limite à deux actions
                  claires :
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      action: 'Tout accepter',
                      desc: 'Active tous les cookies : nécessaires et analytiques.',
                      style: 'border-moss-100 bg-moss-50',
                    },
                    {
                      action: 'Tout refuser',
                      desc: "N'active que les cookies strictement nécessaires au fonctionnement.",
                      style: 'border-warm-beige bg-cream',
                    },
                  ].map(({ action, desc, style }) => (
                    <div key={action} className={`rounded-card border p-4 ${style}`}>
                      <p className="font-functional text-ui uppercase tracking-[2px] text-ink">
                        {action}
                      </p>
                      <p className="mt-2 text-sm text-stone-grey">{desc}</p>
                    </div>
                  ))}
                </div>
                <p>
                  Vous pouvez modifier ou retirer votre consentement à tout moment. Votre choix
                  est mémorisé pendant <strong>13 mois</strong>, conformément aux recommandations
                  de la CNIL. À l&apos;issue de cette période, votre consentement sera à nouveau
                  sollicité.
                </p>
                <div className="rounded-soft border border-warm-beige bg-surface px-4 py-3 text-sm text-stone-grey">
                  <strong>À noter :</strong> le refus des cookies analytiques
                  n&apos;affecte pas votre accès au site ni votre participation au jeu-concours.
                  Seuls les cookies strictement nécessaires sont indispensables au bon
                  fonctionnement du service.
                </div>
              </div>
            </section>

            {/* Article 5 */}
            <section id="duree" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">
                Article 5 - Durée de conservation
              </h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Conformément aux recommandations de la CNIL, la durée de conservation des
                  cookies déposés sur votre terminal ne dépasse pas <strong>13 mois</strong>.
                  Au-delà, votre consentement est à nouveau recueilli.
                </p>
                <div
                  // Defilable plutot que coupe : a 375 px ces tableaux depassent
                  // le cadre, et overflow-hidden rendait la derniere colonne
                  // inatteignable. tabIndex rend la zone defilable au clavier,
                  // sans quoi son contenu resterait hors de portee sans souris.
                  tabIndex={0}
                  role="region"
                  aria-label="Tableau, défilement horizontal au clavier"
                  className="overflow-x-auto rounded-card border border-warm-beige"
                >
                  <table className="w-full text-sm">
                    <thead className="bg-noir text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-functional text-[0.625rem] uppercase tracking-[1.5px]">
                          Catégorie
                        </th>
                        <th className="px-4 py-3 text-left font-functional text-[0.625rem] uppercase tracking-[1.5px]">
                          Durée maximale
                        </th>
                        <th className="px-4 py-3 text-left font-functional text-[0.625rem] uppercase tracking-[1.5px]">
                          Remarque
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warm-beige bg-surface">
                      {[
                        [
                          'Session (refreshToken)',
                          '7 jours',
                          'Renouvelé à chaque connexion, expire après inactivité',
                        ],
                        [
                          'Google Analytics',
                          '2 ans maximum',
                          'Anonymisation IP activée - aucune donnée nominative transmise',
                        ],
                        [
                          'Consentement enregistré',
                          '13 mois',
                          'Conformément aux recommandations CNIL',
                        ],
                      ].map(([cat, duree, remarque]) => (
                        <tr key={cat} className="even:bg-cream">
                          <td className="px-4 py-3 font-medium text-ink">{cat}</td>
                          <td className="px-4 py-3 text-stone-grey">{duree}</td>
                          <td className="px-4 py-3 text-xs text-stone-grey/80">{remarque}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Article 6 */}
            <section id="navigateur" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">
                Article 6 - Paramètres du navigateur
              </h2>
              <div className="mt-4 space-y-4 text-body text-stone-grey">
                <p>
                  Vous pouvez contrôler ou bloquer les cookies directement depuis les paramètres
                  de votre navigateur. La procédure varie selon le navigateur utilisé.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {NAVIGATEURS.map(({ name, lien, instruction }) => (
                    <div
                      key={name}
                      className="rounded-card border border-warm-beige bg-surface p-4"
                    >
                      <p className="font-functional text-ui uppercase tracking-[2px] text-ink">
                        {name}
                      </p>
                      <p className="mt-2 text-xs text-stone-grey/80">{instruction}</p>
                      <a
                        href={lien}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-sm text-accent underline underline-offset-2 transition-colors hover:text-terracotta-700"
                      >
                        Voir les instructions
                      </a>
                    </div>
                  ))}
                </div>
                <div className="rounded-soft border border-warm-beige bg-surface px-4 py-3 text-sm text-stone-grey">
                  <strong>Attention :</strong> la désactivation des cookies nécessaires peut
                  altérer le bon fonctionnement du site, notamment les fonctionnalités de
                  connexion et de participation au jeu-concours.
                </div>
              </div>
            </section>

            {/* Article 7 */}
            <section id="contact" className="scroll-mt-24">
              <h2 className="font-display text-h2 text-ink">Article 7 - Contact</h2>
              <div className="mt-4 space-y-3 text-body text-stone-grey">
                <p>
                  Pour toute question relative à l&apos;utilisation des cookies ou à la
                  protection de vos données personnelles, contactez le responsable du
                  traitement :
                </p>
                <div
                  // Defilable plutot que coupe : a 375 px ces tableaux depassent
                  // le cadre, et overflow-hidden rendait la derniere colonne
                  // inatteignable. tabIndex rend la zone defilable au clavier,
                  // sans quoi son contenu resterait hors de portee sans souris.
                  tabIndex={0}
                  role="region"
                  aria-label="Tableau, défilement horizontal au clavier"
                  className="overflow-x-auto rounded-card border border-warm-beige bg-surface"
                >
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-warm-beige">
                      {[
                        { label: 'Société', value: 'Thé Tip Top' },
                        { label: 'Adresse', value: '18 rue Léon Frot, 75011 Paris - France' },
                        {
                          label: 'Email RGPD',
                          value: 'rgpd@thetiptop.fr',
                          href: 'mailto:rgpd@thetiptop.fr',
                        },
                        {
                          label: 'Email contact',
                          value: 'contact@thetiptop.fr',
                          href: 'mailto:contact@thetiptop.fr',
                        },
                        {
                          label: 'Autorité de contrôle',
                          value: 'CNIL - www.cnil.fr',
                          href: 'https://www.cnil.fr',
                        },
                      ].map(({ label, value, href }) => (
                        <tr key={label} className="even:bg-cream">
                          <td className="px-4 py-3 font-medium text-ink">{label}</td>
                          <td className="px-4 py-3 text-stone-grey">
                            {href ? (
                              <a
                                href={href}
                                {...(href.startsWith('http')
                                  ? { target: '_blank', rel: 'noopener noreferrer' }
                                  : {})}
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
              </div>
            </section>

            {/* Pied de page */}
            <div className="rounded-card border border-warm-beige bg-surface p-6">
              <p className="text-sm text-stone-grey">
                Pour en savoir plus sur la protection de vos données, consultez notre{' '}
                <Link
                  href="/politique-confidentialite"
                  className="font-medium text-accent underline underline-offset-2"
                >
                  Politique de confidentialité
                </Link>
                , nos{' '}
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
