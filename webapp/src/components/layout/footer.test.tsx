// ===========================================
// Tests unitaires - Footer
// ===========================================

import { render, screen } from '@testing-library/react';
import { Footer } from './footer';

describe('Footer', () => {
  beforeEach(() => {
    render(<Footer />);
  });

  it('renders the brand name', () => {
    expect(screen.getByText('Thé Tip Top')).toBeInTheDocument();
  });

  it('links to the contest rules page', () => {
    expect(screen.getByRole('link', { name: 'Règlement du jeu' })).toHaveAttribute(
      'href',
      '/reglement'
    );
  });

  // Le bloc « Jeu Concours » est le coeur du site : ces liens ont deja saute
  // une fois lors d'une reecriture du footer, on les verrouille.
  it('links to all the contest pages', () => {
    const expected = [
      ['Comment participer', '/#how-it-works'],
      ['Les lots à gagner', '/#prizes'],
      ['Règlement du jeu', '/reglement'],
      ["S'inscrire", '/auth/register'],
    ];
    expected.forEach(([label, href]) => {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href);
    });
  });

  it('links to all the legal pages (RGPD)', () => {
    expect(screen.getByRole('link', { name: 'Mentions légales' })).toHaveAttribute(
      'href',
      '/mentions-legales'
    );
    expect(screen.getByRole('link', { name: 'Politique de confidentialité' })).toHaveAttribute(
      'href',
      '/politique-confidentialite'
    );
    screen.getAllByRole('link', { name: 'CGU' }).forEach((link) => {
      expect(link).toHaveAttribute('href', '/cgu');
    });
    expect(screen.getByRole('link', { name: 'Gestion des cookies' })).toHaveAttribute(
      'href',
      '/gestion-cookies'
    );
  });

  it('shows the current year in the copyright', () => {
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });
});
