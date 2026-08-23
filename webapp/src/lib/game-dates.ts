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
// l'affichage. Pour les écrire, voir lib/french-date.

// Instants UTC, exprimés depuis l'heure de Paris. Le 23 octobre 2026 précède
// encore le retour à l'heure d'hiver, fixé au 25 : les trois dates sont donc
// en UTC+2.
export const GAME_START_DATE = new Date('2026-08-22T22:00:00.000Z');
export const GAME_END_DATE = new Date('2026-09-23T21:59:59.999Z');
export const CLAIM_END_DATE = new Date('2026-10-23T21:59:59.999Z');

/**
 * Durées annoncées par le règlement : 32 jours civils de jeu, du 23 août au
 * 23 septembre inclus, puis 30 jours pour réclamer à compter de la clôture.
 *
 * Ces nombres sont écrits tels quels dans les CGU et le règlement. Les laisser
 * dériver des dates ci-dessus produirait un document juridique qui se
 * contredit — c'est déjà arrivé.
 */
export const GAME_DURATION_DAYS = 32;
export const CLAIM_DURATION_DAYS = 30;
