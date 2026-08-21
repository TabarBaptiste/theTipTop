import type { Metadata } from 'next';

/**
 * Ces pages sont des composants client : sans ce layout, elles ne peuvent
 * declarer aucune metadonnee et heritent du titre par defaut de la racine.
 *
 * L'interdiction d'indexation est posee ici en plus du Disallow de
 * robots.txt : ce dernier empeche l'exploration, pas l'indexation d'une URL
 * decouverte par un lien externe. La balise, elle, est sans ambiguite -
 * les ecrans de connexion et d'inscription ne portent aucun contenu a referencer, et se retrouvaient indexes sous le titre de l'accueil.
 */
export const metadata: Metadata = {
  title: 'Authentification',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
