// ===========================================
// Adresse de substitution OAuth
// ===========================================
// Miroir de api/src/modules/auth/placeholder-email.ts. Le domaine est dupliqué
// plutôt qu'exposé par l'API : le déduire de l'adresse évite d'ajouter un champ
// calculé à toutes les réponses qui transportent un utilisateur. Si le domaine
// change côté API, il doit changer ici - d'où le test qui fige la valeur.

const PLACEHOLDER_DOMAIN = 'facebook-noreply.invalid';

/**
 * Indique qu'un compte ne peut recevoir aucun email : il a été créé par un
 * fournisseur qui n'a transmis aucune adresse.
 */
export function isPlaceholderEmail(email: string | null | undefined): boolean {
  return typeof email === 'string' && email.toLowerCase().endsWith(`@${PLACEHOLDER_DOMAIN}`);
}
