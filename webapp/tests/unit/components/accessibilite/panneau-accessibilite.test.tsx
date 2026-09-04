// ===========================================
// Tests unitaires - Module d'accessibilité
// ===========================================
// Le module n'a de valeur que si ses réglages atteignent réellement le
// document : c'est l'attribut posé sur `<html>` que le CSS écoute, pas l'état
// React. Ces tests vérifient donc l'effet, pas l'intention.

import { act, fireEvent, render, screen } from '@testing-library/react';

import { PanneauAccessibilite } from '@/components/accessibilite/panneau-accessibilite';
import {
  PREFERENCES_PAR_DEFAUT,
  useAccessibiliteStore,
} from '@/lib/stores/accessibilite-store';

/**
 * Ouvre le panneau, que tous les tests sauf un commencent par faire.
 *
 * Les expressions de ce fichier sont ancrees : les options portent leur texte
 * d'aide dans leur nom accessible - « Clair » contient « texte sombre » - et
 * le bouton de fermeture reprend le nom du bouton d'ouverture.
 */
function ouvrirPanneau() {
  render(<PanneauAccessibilite />);
  fireEvent.click(screen.getByRole('button', { name: /^Réglages d'accessibilité$/ }));
}

describe('PanneauAccessibilite', () => {
  beforeEach(() => {
    act(() => useAccessibiliteStore.setState(PREFERENCES_PAR_DEFAUT));
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-espacement-texte');
    document.documentElement.removeAttribute('data-sans-animation');
    document.documentElement.style.fontSize = '';
    localStorage.clear();
  });

  it('reste ferme tant qu on ne le demande pas', () => {
    render(<PanneauAccessibilite />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Réglages d'accessibilité$/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('ouvre un dialogue nomme et y porte le focus', () => {
    ouvrirPanneau();

    const dialogue = screen.getByRole('dialog');
    expect(dialogue).toHaveAccessibleName('Accessibilité');
    // Sans cela, la tabulation repartirait du bouton et traverserait la page
    // entiere avant d'atteindre les reglages.
    expect(dialogue).toContainElement(document.activeElement as HTMLElement);
  });

  // C'est l'attribut sur <html> que lit le CSS du theme : l'etat React seul
  // ne changerait rien a l'ecran.
  it('pose le theme sombre sur le document', () => {
    ouvrirPanneau();

    fireEvent.click(screen.getByRole('radio', { name: /^Sombre/ }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'sombre');
  });

  it('retire le theme sombre quand on repasse en clair', () => {
    ouvrirPanneau();

    fireEvent.click(screen.getByRole('radio', { name: /^Sombre/ }));
    fireEvent.click(screen.getByRole('radio', { name: /^Clair/ }));

    expect(document.documentElement).not.toHaveAttribute('data-theme');
  });

  it('agrandit le texte en changeant la taille de base du document', () => {
    ouvrirPanneau();

    fireEvent.click(screen.getByRole('radio', { name: /^Très grande/ }));

    expect(document.documentElement.style.fontSize).toBe('130%');
  });

  // 100 % ne doit pas ecrire de valeur : un visiteur qui a regle la taille de
  // police dans son navigateur verrait le site la lui reprendre.
  it('laisse la taille du navigateur intacte au cran normal', () => {
    ouvrirPanneau();

    fireEvent.click(screen.getByRole('radio', { name: /^Très grande/ }));
    fireEvent.click(screen.getByRole('radio', { name: /^Normale/ }));

    expect(document.documentElement.style.fontSize).toBe('');
  });

  it('bascule l espacement du texte et les animations', () => {
    ouvrirPanneau();

    const espacement = screen.getByRole('switch', { name: /espacer le texte/i });
    const animations = screen.getByRole('switch', { name: /animations/i });

    fireEvent.click(espacement);
    fireEvent.click(animations);

    expect(document.documentElement).toHaveAttribute('data-espacement-texte');
    expect(document.documentElement).toHaveAttribute('data-sans-animation');
    expect(espacement).toHaveAttribute('aria-checked', 'true');
    expect(animations).toHaveAttribute('aria-checked', 'false');
  });

  it('remet tout a zero et nettoie le document', () => {
    ouvrirPanneau();

    fireEvent.click(screen.getByRole('radio', { name: /^Sombre/ }));
    fireEvent.click(screen.getByRole('radio', { name: /^Très grande/ }));
    fireEvent.click(screen.getByRole('switch', { name: /espacer le texte/i }));

    fireEvent.click(screen.getByRole('button', { name: /tout réinitialiser/i }));

    expect(document.documentElement).not.toHaveAttribute('data-theme');
    expect(document.documentElement).not.toHaveAttribute('data-espacement-texte');
    expect(document.documentElement.style.fontSize).toBe('');
  });

  // Le panneau se ferme au clavier, et rend le focus a son bouton : sans ce
  // retour, la tabulation reprendrait au debut du document.
  it('se ferme par Echap en rendant le focus au bouton', () => {
    ouvrirPanneau();
    const bouton = screen.getByRole('button', { name: /^Réglages d'accessibilité$/ });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(bouton).toHaveFocus();
  });

  it('conserve les preferences d une visite a l autre', () => {
    ouvrirPanneau();

    fireEvent.click(screen.getByRole('radio', { name: /^Sombre/ }));

    expect(JSON.parse(localStorage.getItem('thetiptop-accessibilite') ?? '{}').state).toMatchObject(
      { theme: 'sombre' },
    );
  });
});
