// ===========================================
// Tests unitaires - Hero de la page d'accueil
// ===========================================
// Le titre de cette section est contraint par le cahier des charges : les deux
// mots-cles imposes doivent rester dans le H1. Une refonte redactionnelle peut
// tres bien les en sortir sans casser quoi que ce soit a l'ecran - c'est le
// referencement qui paie l'ardoise, plus tard et en silence. Ce fichier a
// d'ailleurs deja subi une refonte puis un revert.

import { render, screen } from '@testing-library/react';

import { HeroSection } from '@/components/home/hero-section';

jest.mock('@/lib/analytics', () => ({ trackCTAClick: jest.fn() }));

describe('HeroSection', () => {
  it('garde les deux mots-clés imposés dans le titre principal', () => {
    render(<HeroSection />);

    const titre = screen.getByRole('heading', { level: 1 });
    expect(titre).toHaveTextContent(/Jeu-concours/i);
    expect(titre).toHaveTextContent(/Thé Tip Top/i);
  });

  it('rend les appels à l’action', () => {
    render(<HeroSection />);

    expect(screen.getByRole('link', { name: /Participer maintenant/i })).toBeInTheDocument();
  });

  // Une image de hero sans alternative textuelle est un manquement RGAA, et
  // celle-ci est marquee `priority` : elle est toujours chargee.
  it('donne une alternative textuelle à la photo', () => {
    render(<HeroSection />);

    expect(screen.getByAltText(/Tasses de thé Tip Top/i)).toBeInTheDocument();
  });
});
