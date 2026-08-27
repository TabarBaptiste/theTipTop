// ===========================================
// Tests unitaires - Tas de feuilles
// ===========================================
// Ce decor est monte dans le pied de page, donc sur toutes les pages du site.
// Deux choses doivent tenir : il s'efface des espaces de travail, ou il
// gênerait, et il cesse d'ajouter des feuilles une fois le tas complet - un
// minuteur qui se relance indefiniment ferait grossir le DOM sans fin.

import { render, act } from '@testing-library/react';

import { LeafPile } from './leaf-pile';

const mockPathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

const INTERVALLE_MS = 2200;

/**
 * Laisse passer le temps de `combien` feuilles.
 *
 * Une seule avance groupee n'en poserait qu'une : le minuteur suivant n'est
 * programme qu'apres le rendu, donc apres la fin de l'avance en cours.
 */
function poser(combien: number) {
  for (let index = 0; index < combien; index += 1) {
    act(() => {
      jest.advanceTimersByTime(INTERVALLE_MS);
    });
  }
}

const feuilles = (conteneur: HTMLElement) => conteneur.querySelectorAll('svg').length;

describe('LeafPile', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockPathname.mockReturnValue('/');
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('commence sans aucune feuille', () => {
    const { container } = render(<LeafPile />);

    expect(feuilles(container)).toBe(0);
  });

  it('pose les feuilles une a une', () => {
    const { container } = render(<LeafPile />);

    poser(1);
    expect(feuilles(container)).toBe(1);

    poser(2);
    expect(feuilles(container)).toBe(3);
  });

  // Sans arret, le minuteur se relancerait a chaque feuille posee.
  it('s arrete une fois le tas complet', () => {
    const { container } = render(<LeafPile />);

    poser(40);
    const complet = feuilles(container);

    poser(40);

    expect(feuilles(container)).toBe(complet);
    expect(complet).toBeGreaterThan(0);
  });

  it.each(['/admin', '/employee/comptoir', '/dashboard'])(
    'ne s affiche pas sur %s',
    (chemin) => {
      mockPathname.mockReturnValue(chemin);
      const { container } = render(<LeafPile />);

      poser(5);

      expect(container).toBeEmptyDOMElement();
    }
  );

  // Le prefixe seul ne suffit pas : une page publique dont l'adresse commence
  // par ces lettres doit garder son decor.
  it('s affiche sur une page publique au nom voisin', () => {
    mockPathname.mockReturnValue('/administration-du-jeu');
    const { container } = render(<LeafPile />);

    poser(1);

    expect(feuilles(container)).toBe(1);
  });

  it('reste invisible aux lecteurs d ecran', () => {
    const { container } = render(<LeafPile />);

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });
});
