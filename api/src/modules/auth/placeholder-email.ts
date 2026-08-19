// ===========================================
// Adresse de substitution OAuth
// ===========================================

/**
 * Domaine reserve par la RFC 2606 : aucun serveur de messagerie ne peut le
 * router, et il ne peut jamais entrer en collision avec un domaine reel.
 *
 * `.local` serait techniquement incorrect : il est reserve au mDNS par la
 * RFC 6762, pas aux adresses inexistantes. Le seed utilise deja `.invalid`
 * pour anonymiser les leads purges, cette convention est donc celle du projet.
 */
const PLACEHOLDER_DOMAIN = 'facebook-noreply.invalid';

/**
 * Fabrique une adresse pour un compte Facebook qui n'en transmet aucune.
 *
 * Elle n'existe que pour satisfaire la contrainte d'unicite et permettre la
 * connexion : le compte reste injoignable tant que son titulaire n'a pas
 * renseigne une vraie adresse.
 */
export function buildPlaceholderEmail(facebookId: string): string {
  return `fb_${facebookId}@${PLACEHOLDER_DOMAIN}`;
}

/**
 * Indique qu'un compte ne peut recevoir aucun email.
 *
 * Deduit du domaine plutot que stocke dans une colonne dediee : l'information
 * est deja portee par l'adresse, et une migration de plus sur ce projet ne se
 * justifie pas pour une donnee derivable sans ambiguite.
 *
 * Tout ce qui suppose un envoi — confirmation de participation, annonce du lot,
 * relances — doit s'appuyer sur cette fonction plutot que sur une comparaison
 * de chaine dispersee dans le code.
 */
export function isPlaceholderEmail(email: string | null | undefined): boolean {
  return typeof email === 'string' && email.toLowerCase().endsWith(`@${PLACEHOLDER_DOMAIN}`);
}
