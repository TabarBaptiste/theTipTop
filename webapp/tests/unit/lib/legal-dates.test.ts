import { readFileSync } from 'fs';
import { join } from 'path';
import { LEGAL_UPDATED_AT } from '@/lib/legal-dates';

// Regrouper les dates ne sert à rien si une page en réintroduit une à la main :
// c'est précisément ainsi que quatre documents se sont retrouvés figés au
// 9 juin. Ce test lit les pages et refuse toute date écrite en dur.
describe('dates de révision des documents légaux', () => {
  const PAGES: Record<keyof typeof LEGAL_UPDATED_AT, string> = {
    cgu: 'src/app/cgu/page.tsx',
    mentionsLegales: 'src/app/mentions-legales/page.tsx',
    politiqueConfidentialite: 'src/app/politique-confidentialite/page.tsx',
    gestionCookies: 'src/app/gestion-cookies/page.tsx',
  };

  const lirePage = (chemin: string) =>
    // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal -- chemin vient uniquement des valeurs litterales de PAGES ci-dessus, jamais d'une entree externe.
    readFileSync(join(__dirname, '../../..', chemin), 'utf8');

  it.each(Object.entries(PAGES))('%s ne doit pas écrire sa date en dur', (_cle, chemin) => {
    const source = lirePage(chemin);
    // Une accolade suit forcément le deux-points quand la date vient du module.
    expect(source).not.toMatch(/Dernière mise à jour\s*:\s*[^{<]*\d{4}/);
  });

  it.each(Object.entries(PAGES))('%s doit tirer sa date du module partagé', (_cle, chemin) => {
    expect(lirePage(chemin)).toContain('LEGAL_UPDATED_AT');
  });

  // Une clé jamais affichée signale un document retiré ou renommé sans ménage.
  it('n’expose aucune date orpheline', () => {
    for (const [cle, chemin] of Object.entries(PAGES)) {
      expect(lirePage(chemin)).toContain(`LEGAL_UPDATED_AT.${cle}`);
    }
  });

  // Les deux documents modifiés le 19 août 2026 ne peuvent pas afficher une
  // date antérieure à celle des documents restés inchangés.
  it('date les documents révisés après ceux qui ne l’ont pas été', () => {
    expect(LEGAL_UPDATED_AT.cgu.getTime()).toBeGreaterThan(
      LEGAL_UPDATED_AT.politiqueConfidentialite.getTime(),
    );
    expect(LEGAL_UPDATED_AT.mentionsLegales.getTime()).toBeGreaterThan(
      LEGAL_UPDATED_AT.gestionCookies.getTime(),
    );
  });
});
