import type { Metadata } from 'next';

/**
 * Ces pages sont des composants client : sans ce layout, elles ne peuvent
 * declarer aucune metadonnee et heritent du titre par defaut de la racine.
 *
 * L'interdiction d'indexation est posee ici en plus du Disallow de
 * robots.txt : ce dernier empeche l'exploration, pas l'indexation d'une URL
 * decouverte par un lien externe. La balise, elle, est sans ambiguite -
 * le back-office employe n'a rien a faire dans un index public.
 */
export const metadata: Metadata = {
  title: 'Espace employe',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
