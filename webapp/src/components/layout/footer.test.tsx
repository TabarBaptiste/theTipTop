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
    expect(screen.getByText('The Tip Top')).toBeInTheDocument();
  });

  it('links to the contest rules page', () => {
    expect(screen.getByRole('link', { name: 'Reglement du jeu' })).toHaveAttribute(
      'href',
      '/reglement'
    );
  });

  it('links to all the legal pages (RGPD)', () => {
    expect(screen.getByRole('link', { name: 'Mentions legales' })).toHaveAttribute(
      'href',
      '/mentions-legales'
    );
    expect(screen.getByRole('link', { name: 'Politique de confidentialite' })).toHaveAttribute(
      'href',
      '/politique-confidentialite'
    );
    // Le lien CGU apparaît dans la liste principale et dans la barre du bas
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
