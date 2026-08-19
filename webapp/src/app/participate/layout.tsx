import type { Metadata } from 'next';

/**
 * La page de participation est un composant client : Next interdit d'y exporter
 * des métadonnées. Sans ce layout, elle héritait du titre par défaut de la
 * racine et se présentait aux moteurs sous le même intitulé que l'accueil,
 * alors qu'il s'agit de la principale page de conversion du jeu-concours.
 */
export const metadata: Metadata = {
  title: 'Participer au jeu-concours',
  description:
    'Saisissez le code de votre ticket de caisse Thé Tip Top et découvrez votre lot immédiatement. 100 % des tickets sont gagnants.',
  alternates: { canonical: '/participate' },
  openGraph: {
    title: 'Participer au jeu-concours Thé Tip Top',
    description:
      'Saisissez le code de votre ticket de caisse et découvrez votre lot immédiatement. 100 % des tickets sont gagnants.',
    url: '/participate',
  },
};

export default function ParticipateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
