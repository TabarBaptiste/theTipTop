// ===========================================
// Tests unitaires - Plan du site
// ===========================================

import { readFileSync } from 'fs';
import { join } from 'path';
import { render, screen } from '@testing-library/react';

import PlanDuSitePage from './page';
import sitemap from '../sitemap';

describe('PlanDuSitePage', () => {
  it('regroupe les pages par theme', () => {
    render(<PlanDuSitePage />);

    for (const titre of ['Le jeu-concours', 'Votre compte', 'Informations légales']) {
      expect(screen.getByRole('heading', { name: titre })).toBeInTheDocument();
    }
  });

  it('mene aux pages annoncees', () => {
    render(<PlanDuSitePage />);

    expect(screen.getByRole('link', { name: 'Règlement du jeu' })).toHaveAttribute(
      'href',
      '/reglement',
    );
    expect(screen.getByRole('link', { name: 'Participer' })).toHaveAttribute(
      'href',
      '/participate',
    );
  });

  // Le coeur du dispositif. Deux listes de pages coexistent : celle-ci, pour
  // les visiteurs, et sitemap.xml pour les robots. Sans cette comparaison, une
  // page ajoutee a l'une manquerait a l'autre sans que rien ne le signale -
  // exactement la derive qui avait laisse les CGU annoncer de fausses dates.
  it('couvre toutes les pages du sitemap XML', () => {
    const source = readFileSync(join(__dirname, 'page.tsx'), 'utf8');
    const chemins = [...source.matchAll(/href: '([^']+)'/g)].map((m) => m[1]);

    const manquantes = sitemap()
      .map((entree) => new URL(entree.url).pathname)
      // Le plan figure au sitemap XML, pour que les moteurs le trouvent sans
      // dependre du pied de page. Il ne se recense pas lui-meme pour autant :
      // un lien vers la page qu'on lit n'aide personne.
      .filter((chemin) => chemin !== '/plan-du-site')
      .filter((chemin) => !chemins.includes(chemin));

    expect(manquantes).toEqual([]);
  });

  // L'inverse n'est pas vrai : le plan couvre aussi la connexion, l'inscription
  // et l'espace personnel, que robots.txt interdit au crawl et que le sitemap
  // XML exclut donc a juste titre.
  it('mene aussi aux destinations exclues du crawl', () => {
    render(<PlanDuSitePage />);

    expect(screen.getByRole('link', { name: 'Connexion' })).toHaveAttribute('href', '/auth/login');
    expect(screen.getByRole('link', { name: 'Mes participations' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });
});
