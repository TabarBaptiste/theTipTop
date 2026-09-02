// ===========================================
// Tests unitaires - Boutons d'appel a l'action du hero
// ===========================================
// Ces deux boutons portent la conversion de la page d'accueil. Deux choses
// peuvent casser sans que rien ne se voie : une destination erronee, qui
// envoie le visiteur ailleurs que sur le formulaire, et un envoi d'evenement
// perdu, qui rend la mesure du tunnel aveugle sans provoquer la moindre
// erreur.

import { render, screen, fireEvent } from '@testing-library/react';

import { HeroCTAButtons } from '@/components/home/hero-cta-buttons';

jest.mock('@/lib/analytics', () => ({ trackCTAClick: jest.fn() }));

import { trackCTAClick } from '@/lib/analytics';

describe('HeroCTAButtons', () => {
  beforeEach(() => jest.clearAllMocks());

  it('mène au formulaire de participation', () => {
    render(<HeroCTAButtons />);

    expect(screen.getByRole('link', { name: /Participer maintenant/i })).toHaveAttribute(
      'href',
      '/participate',
    );
  });

  it('mène à la section explicative de la même page', () => {
    render(<HeroCTAButtons />);

    expect(screen.getByRole('link', { name: /Comment ça marche/i })).toHaveAttribute(
      'href',
      '/#how-it-works',
    );
  });

  // La hierarchie entre les deux boutons est le sujet des derniers correctifs :
  // « Participer » doit rester au-dessus de « Comment ca marche », sans quoi le
  // visiteur arbitre entre deux actions d'apparence equivalente.
  it('donne au bouton de participation le poids visuel supérieur', () => {
    render(<HeroCTAButtons />);

    const participer = screen.getByRole('link', { name: /Participer maintenant/i });
    const enSavoirPlus = screen.getByRole('link', { name: /Comment ça marche/i });

    expect(participer.className).toContain('h-16');
    expect(enSavoirPlus.className).toContain('h-14');
  });

  it.each([
    [/Participer maintenant/i, 'Participer maintenant'],
    [/Comment ça marche/i, 'Comment ça marche'],
  ])('signale le clic sur %s à la mesure d’audience', (motif, libelle) => {
    render(<HeroCTAButtons />);

    fireEvent.click(screen.getByRole('link', { name: motif }));

    expect(trackCTAClick).toHaveBeenCalledWith(libelle, 'hero_section');
  });
});
