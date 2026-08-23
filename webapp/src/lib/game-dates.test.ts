import { readFileSync } from 'fs';
import { join } from 'path';
import { GAME_START_DATE, GAME_END_DATE, CLAIM_END_DATE } from './game-dates';

// Le coeur du dispositif : ces constantes répliquent celles de l'API. Si
// quelqu'un modifie les dates d'un seul côté, ce test tombe. C'est exactement
// la dérive qui avait laissé les CGU annoncer des dates fausses pendant des
// semaines. Le formatage, lui, est couvert par french-date.test.
describe('accord des dates du jeu avec la configuration de l’API', () => {
  const envExample = readFileSync(join(__dirname, '../../../api/.env.example'), 'utf8');

  const lire = (cle: string): string => {
    // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp -- cle vient uniquement des cles litterales listees plus bas dans ce fichier de test.
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
