import { readFileSync } from 'fs';
import { join } from 'path';
import {
  GAME_START_DATE,
  GAME_END_DATE,
  CLAIM_END_DATE,
  formatGameDate,
  formatGameDateTime,
  formatGamePeriod,
} from './game-dates';

describe('dates officielles', () => {
  // Le coeur du dispositif : ces constantes répliquent celles de l'API. Si
  // quelqu'un modifie les dates d'un seul côté, ce test tombe. C'est
  // exactement la dérive qui avait laissé les CGU annoncer des dates fausses.
  describe('accord avec la configuration de l’API', () => {
    const envExample = readFileSync(join(__dirname, '../../../api/.env.example'), 'utf8');

    const lire = (cle: string): string => {
      const trouve = envExample.match(new RegExp(`^${cle}=(.+)$`, 'm'));
      if (!trouve) throw new Error(`${cle} introuvable dans api/.env.example`);
      return trouve[1].trim();
    };

    it.each([
      ['GAME_START_DATE', GAME_START_DATE],
      ['GAME_END_DATE', GAME_END_DATE],
      ['CLAIM_END_DATE', CLAIM_END_DATE],
    ])('%s doit correspondre à api/.env.example', (cle, constante) => {
      expect(constante.toISOString()).toBe(new Date(lire(cle)).toISOString());
    });
  });

  describe('formatage', () => {
    // Les instants sont en UTC et tombent volontairement de part et d'autre de
    // minuit : c'est ce décalage qui avait fait afficher une date fausse.
    it('affiche l’ouverture au 1er septembre malgré un instant UTC au 31 août', () => {
      expect(formatGameDate(GAME_START_DATE)).toBe('1er septembre 2026');
    });

    it('affiche la clôture au 30 septembre, pas au 1er octobre', () => {
      expect(formatGameDate(GAME_END_DATE)).toBe('30 septembre 2026');
    });

    // L'heure d'été prend fin le 25 octobre : cette borne-là est en +01:00
    // quand les deux autres sont en +02:00.
    it('tient compte de la fin de l’heure d’été pour la réclamation', () => {
      expect(formatGameDate(CLAIM_END_DATE)).toBe('30 octobre 2026');
    });

    it('affiche l’heure de clôture en heure française', () => {
      expect(formatGameDateTime(GAME_END_DATE)).toBe('30 septembre 2026 à 23h59');
    });

    it('ne répète pas le mois quand les deux bornes le partagent', () => {
      expect(formatGamePeriod(GAME_START_DATE, GAME_END_DATE)).toBe('Du 1er au 30 septembre 2026');
    });

    it('donne les deux dates entières quand la période change de mois', () => {
      expect(formatGamePeriod(GAME_START_DATE, CLAIM_END_DATE)).toBe(
        'Du 1er septembre 2026 au 30 octobre 2026',
      );
    });
  });
});
