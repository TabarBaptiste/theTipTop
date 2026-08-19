// ===========================================
// Dates officielles du jeu-concours
// ===========================================
// Source unique côté interface. Avant elle, les CGU portaient leurs propres
// dates écrites à la main, qui contredisaient la configuration réelle du jeu :
// elles annonçaient une ouverture le 24 août et une réclamation jusqu'au
// 22 novembre, là où le système ouvrait le 1er septembre et fermait la
// réclamation le 30 octobre.
//
// Les valeurs ci-dessous répliquent GAME_START_DATE, GAME_END_DATE et
// CLAIM_END_DATE de l'API. Cette duplication est assumée : un document
// juridique doit pouvoir s'afficher même API éteinte, et son contenu ne peut
// pas dépendre d'un appel réseau. Le test qui accompagne ce fichier compare
// ces constantes à api/.env.example et échoue si l'une des deux dérive.
//
// L'API reste seule autorité sur le comportement : c'est GameConfig, en base,
// qui décide si une participation est acceptée. Ces constantes ne servent qu'à
// l'affichage.

export const GAME_START_DATE = new Date('2026-08-31T22:00:00.000Z');
export const GAME_END_DATE = new Date('2026-09-30T21:59:59.999Z');
export const CLAIM_END_DATE = new Date('2026-10-30T22:59:59.999Z');

/**
 * Durées annoncées par le règlement déposé : 30 jours de jeu, puis 30 jours
 * pour réclamer à compter de la clôture.
 */
export const GAME_DURATION_DAYS = 30;
export const CLAIM_DURATION_DAYS = 30;

const PARIS = 'Europe/Paris';

/**
 * Les instants sont stockés en UTC, mais se lisent en heure française. Le
 * fuseau est imposé explicitement plutôt que laissé à celui du navigateur :
 * sans quoi la clôture du 30 septembre à 23h59 s'afficherait « 1er octobre »
 * pour un visiteur situé à l'est, et la date affichée contredirait le
 * règlement.
 */
function parisParts(date: Date): Record<string, string> {
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    timeZone: PARIS,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return Object.fromEntries(formatter.formatToParts(date).map((p) => [p.type, p.value]));
}

/** « 1er septembre 2026 », « 30 septembre 2026 ». */
export function formatGameDate(date: Date): string {
  const { day, month, year } = parisParts(date);
  // Le français veut « 1er » et non « 1 », que Intl ne produit pas seul.
  return `${day === '1' ? '1er' : day} ${month} ${year}`;
}

/** « 30 septembre 2026 à 23h59 ». */
export function formatGameDateTime(date: Date): string {
  const { hour, minute } = parisParts(date);
  return `${formatGameDate(date)} à ${hour}h${minute}`;
}
