import type { Metadata } from 'next';
import Link from 'next/link';
import { Map } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Plan du site',
  description:
    'Toutes les pages du site Thé Tip Top : le jeu-concours, votre espace personnel et les informations légales.',
  alternates: { canonical: '/plan-du-site' },
};

/**
 * Plan du site destiné aux visiteurs.
 *
 * Distinct de /sitemap.xml, qui s'adresse aux robots : celui-ci est lisible,
 * commenté, et couvre aussi les destinations exclues du crawl - connexion,
 * inscription, espace personnel - qu'un visiteur cherche pourtant à atteindre.
 *
 * Un test compare les deux : toute page ajoutée au sitemap XML doit figurer
 * ici, sans quoi la liste se périme en silence.
 */
const RUBRIQUES = [
  {
    titre: 'Le jeu-concours',
    entrees: [
      { href: '/', libelle: 'Accueil', description: 'Le jeu, les lots et le décompte' },
      {
        href: '/participate',
        libelle: 'Participer',
        description: 'Saisir le code figurant sur votre ticket de caisse',
      },
      {
        href: '/reglement',
        libelle: 'Règlement du jeu',
        description: 'Le règlement complet, déposé chez le commissaire de justice',
      },
      { href: '/faq', libelle: 'Foire aux questions', description: 'Les questions fréquentes' },
    ],
  },
  {
    titre: 'Votre compte',
    entrees: [
      { href: '/auth/login', libelle: 'Connexion', description: 'Accéder à votre espace' },
      {
        href: '/auth/register',
        libelle: 'Inscription',
        description: 'Créer un compte pour suivre vos participations',
      },
      {
        href: '/dashboard',
        libelle: 'Mes participations',
        description: 'L’historique de vos codes joués et des lots gagnés',
      },
      { href: '/dashboard/profile', libelle: 'Mon profil', description: 'Vos informations' },
      {
        href: '/dashboard/settings',
        libelle: 'Paramètres',
        description: 'Mot de passe, consentements, export et suppression de vos données',
      },
    ],
  },
  {
    titre: 'Informations légales',
    entrees: [
      {
        href: '/mentions-legales',
        libelle: 'Mentions légales',
        description: 'Éditeur, hébergeur et responsable de publication',
      },
      {
        href: '/cgu',
        libelle: 'Conditions générales d’utilisation',
        description: 'Les règles d’usage du site',
      },
      {
        href: '/politique-confidentialite',
        libelle: 'Politique de confidentialité',
        description: 'Les données collectées et vos droits',
      },
      {
        href: '/gestion-cookies',
        libelle: 'Gestion des cookies',
        description: 'Consulter et modifier vos choix à tout moment',
      },
    ],
  },
];

export default function PlanDuSitePage() {
  return (
    <div className="bg-cream py-16 md:py-20">
      <div className="container mx-auto max-w-3xl px-6">
        <Map className="mb-6 h-10 w-10 text-accent" strokeWidth={1.5} />
        <h1 className="font-display text-h1 text-ink">Plan du site</h1>
        <p className="mt-3 text-body text-stone-grey">
          Toutes les pages du site, regroupées par thème. Les pages de votre espace personnel
          demandent d&apos;être connecté.
        </p>

        <div className="mt-12 space-y-12">
          {RUBRIQUES.map((rubrique) => (
            <section key={rubrique.titre}>
              <h2 className="font-display text-h2 text-ink">{rubrique.titre}</h2>

              <ul className="mt-4 space-y-4">
                {rubrique.entrees.map((entree) => (
                  <li key={entree.href} className="border-t border-warm-beige pt-4">
                    <Link
                      href={entree.href}
                      className="font-functional text-body font-semibold text-accent underline underline-offset-4"
                    >
                      {entree.libelle}
                    </Link>
                    <p className="mt-1 text-sm text-stone-grey">{entree.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
