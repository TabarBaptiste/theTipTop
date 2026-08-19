// ===========================================
// Accessibilité - WCAG 2.1 niveau AA
// ===========================================
// Le cahier des charges fait de l'accessibilité un critère de recette, pas une
// intention : « la plateforme est développée dans le respect des normes WCAG,
// niveau AA », avec les contrastes, la navigation au clavier, le balisage des
// éléments interactifs et les lecteurs d'écran nommés explicitement.
//
// Ces vérifications sont automatisables et couvrent les manquements les plus
// fréquents. Elles ne remplacent pas un audit humain : l'ordre de tabulation,
// la pertinence réelle des textes alternatifs ou la compréhension par un
// lecteur d'écran demandent un test manuel.

/** Pages publiques du parcours, celles qu'un participant traverse réellement. */
const PAGES = [
  '/',
  '/participate',
  '/faq',
  '/reglement',
  '/cgu',
  '/mentions-legales',
  '/politique-confidentialite',
  '/gestion-cookies',
  '/auth/login',
  '/auth/register',
];

interface EchecContraste {
  texte: string;
  ratio: number;
  seuil: number;
  taille: number;
}

/**
 * Contraste réel du texte affiché (critère 1.4.3).
 *
 * Deux pièges que cette implémentation évite :
 * - un fond transparent ne dit rien du fond réel, il faut remonter les
 *   ancêtres jusqu'à trouver une couleur opaque ;
 * - une couleur de texte semi-transparente doit être composée sur ce fond.
 *   L'ignorer surestimerait le contraste de tout le pied de page, qui utilise
 *   du blanc à 70 % et 50 %.
 */
function auditerContraste(win: Cypress.AUTWindow): EchecContraste[] {
  const doc = win.document;
  const canal = (v: number) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  const luminance = (c: number[]) => 0.2126 * canal(c[0]) + 0.7152 * canal(c[1]) + 0.0722 * canal(c[2]);
  const lire = (couleur: string) => (couleur.match(/[\d.]+/g) || []).map(Number);

  const fondOpaque = (el: Element): number[] => {
    let noeud: Element | null = el;
    while (noeud && noeud !== doc.documentElement) {
      const c = lire(win.getComputedStyle(noeud).backgroundColor);
      if (c.length >= 3 && (c[3] === undefined || c[3] > 0.95)) return c.slice(0, 3);
      noeud = noeud.parentElement;
    }
    return [255, 255, 255];
  };

  const composer = (c: number[], fond: number[]) =>
    c.length > 3 && c[3] < 1 ? c.slice(0, 3).map((v, i) => v * c[3] + fond[i] * (1 - c[3])) : c.slice(0, 3);

  const contraste = (a: number[], b: number[]) => {
    const [clair, sombre] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (clair + 0.05) / (sombre + 0.05);
  };

  const echecs: EchecContraste[] = [];

  for (const el of Array.from(doc.querySelectorAll('body *'))) {
    const texte = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => (n.textContent || '').trim())
      .join(' ')
      .trim();
    if (!texte) continue;

    const style = win.getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) continue;
    if (!el.getBoundingClientRect().width) continue;

    const fond = fondOpaque(el);
    const avant = composer(lire(style.color), fond);
    if (avant.length < 3) continue;

    const taille = parseFloat(style.fontSize);
    const gras = Number(style.fontWeight) >= 700;
    // Le seuil tombe à 3:1 pour le grand texte : 24 px, ou 18.66 px en gras.
    const seuil = taille >= 24 || (gras && taille >= 18.66) ? 3 : 4.5;

    const ratio = contraste(avant, fond);
    if (ratio < seuil) {
      echecs.push({ texte: texte.slice(0, 40), ratio: Number(ratio.toFixed(2)), seuil, taille });
    }
  }

  return echecs;
}

describe('Accessibilité WCAG 2.1 niveau AA', () => {
  PAGES.forEach((page) => {
    describe(page, () => {
      beforeEach(() => {
        cy.visit(page);
      });

      // Critère 1.4.3 - Contraste minimum
      it('respecte le contraste minimum sur tous les textes', () => {
        cy.window().then((win) => {
          const echecs = auditerContraste(win);
          if (echecs.length) {
            // Le détail figure dans le message : sans lui, corriger demanderait
            // de rejouer l'audit à la main.
            const detail = echecs
              .map((e) => `« ${e.texte} » ${e.ratio}:1 au lieu de ${e.seuil}:1 (${e.taille}px)`)
              .join('\n');
            throw new Error(`${echecs.length} texte(s) sous le seuil :\n${detail}`);
          }
        });
      });

      // Critère 3.1.1 - Langue de la page
      it('déclare la langue du document', () => {
        cy.get('html').should('have.attr', 'lang', 'fr');
      });

      // Critère 1.3.1 - Information et relations
      it('expose une hiérarchie de titres cohérente', () => {
        cy.get('h1,h2,h3,h4,h5,h6').then(($titres) => {
          const niveaux = $titres.toArray().map((t) => Number(t.tagName[1]));
          expect(niveaux.filter((n) => n === 1), 'un seul h1').to.have.length(1);
          for (let i = 1; i < niveaux.length; i++) {
            expect(
              niveaux[i],
              `saut de niveau après h${niveaux[i - 1]} (${$titres[i].textContent?.trim().slice(0, 30)})`,
            ).to.be.at.most(niveaux[i - 1] + 1);
          }
        });
      });

      // Critère 1.1.1 - Contenu non textuel
      it('donne un texte alternatif à chaque image', () => {
        cy.get('body').then(($body) => {
          const sansAlt = $body.find('img').toArray().filter((i) => !i.hasAttribute('alt'));
          expect(sansAlt.map((i) => i.outerHTML.slice(0, 80))).to.deep.equal([]);
        });
      });

      // Critères 3.3.2 et 4.1.2 - Étiquettes des champs
      it('associe une étiquette à chaque champ de formulaire', () => {
        cy.get('body').then(($body) => {
          const sansEtiquette = $body
            .find('input,select,textarea')
            .toArray()
            .filter((c) => (c as HTMLInputElement).type !== 'hidden')
            .filter(
              (c) =>
                !(c as HTMLInputElement).labels?.length &&
                !c.getAttribute('aria-label') &&
                !c.getAttribute('aria-labelledby'),
            );
          expect(sansEtiquette.map((c) => c.outerHTML.slice(0, 80))).to.deep.equal([]);
        });
      });

      // Critère 4.1.2 - Nom accessible des éléments interactifs
      it('donne un nom accessible à chaque élément interactif', () => {
        cy.get('body').then(($body) => {
          const anonymes = $body
            .find('a,button,[role="button"]')
            .toArray()
            .filter(
              (el) =>
                !(el.textContent || '').trim() &&
                !el.getAttribute('aria-label') &&
                !el.getAttribute('title') &&
                !el.querySelector('img[alt]:not([alt=""])'),
            );
          expect(anonymes.map((el) => el.outerHTML.slice(0, 80))).to.deep.equal([]);
        });
      });

      // Critère 1.3.1 - Repères de navigation
      it('structure la page avec les repères attendus', () => {
        cy.get('main').should('have.length', 1);
        cy.get('header').should('exist');
        cy.get('footer').should('exist');
      });
    });
  });
});
