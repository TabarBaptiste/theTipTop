// ===========================================
// Dates en français, heure de Paris
// ===========================================
// Extrait de game-dates : les pages légales affichent aussi des dates, et
// dupliquer ce formatage aurait reproduit la dérive qu'il sert justement à
// empêcher. Ce module ne connaît aucune date métier, il ne sait que les écrire.

const PARIS = 'Europe/Paris';

/**
 * Les instants sont stockés en UTC mais se lisent en heure française. Le fuseau
 * est imposé explicitement plutôt que laissé à celui du navigateur : sans quoi
 * une clôture au 30 septembre à 23h59 s'afficherait « 1er octobre » pour un
 * visiteur situé à l'est, et contredirait le règlement.
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

/** Le français veut « 1er » et non « 1 », que Intl ne produit pas seul. */
function dayLabel(day: string): string {
  return day === '1' ? '1er' : day;
}

/** « 1er septembre 2026 ». */
export function formatFrenchDate(date: Date): string {
  const { day, month, year } = parisParts(date);
  return `${dayLabel(day)} ${month} ${year}`;
}

/** « 30 septembre 2026 à 23h59 ». */
export function formatFrenchDateTime(date: Date): string {
  const { hour, minute } = parisParts(date);
  return `${formatFrenchDate(date)} à ${hour}h${minute}`;
}

/**
 * « Du 1er au 30 septembre 2026 ».
 *
 * Le mois et l'année ne sont pas répétés quand les deux bornes les partagent —
 * l'usage en français, et quinze caractères de moins, ce qui évite un retour à
 * la ligne disgracieux sur les largeurs intermédiaires. Si les bornes changent
 * de mois, on retombe sur les deux dates entières.
 */
export function formatFrenchDateRange(start: Date, end: Date): string {
  const from = parisParts(start);
  const to = parisParts(end);

  if (from.month === to.month && from.year === to.year) {
    return `Du ${dayLabel(from.day)} au ${dayLabel(to.day)} ${to.month} ${to.year}`;
  }

  return `Du ${formatFrenchDate(start)} au ${formatFrenchDate(end)}`;
}
