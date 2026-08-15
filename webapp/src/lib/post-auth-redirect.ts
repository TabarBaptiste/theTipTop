// ===========================================
// Destination de retour après un aller-retour OAuth
// ===========================================
// Le fournisseur tiers renvoie toujours sur /auth/callback, qui redirige
// ensuite vers l'espace personnel. Pour revenir ailleurs — la page de
// participation, par exemple — il faut mémoriser la destination avant de
// partir.
//
// Le sessionStorage plutôt que le paramètre `state` d'OAuth : rien ne transite
// par l'URL, donc rien n'atterrit dans l'historique du navigateur ni dans les
// journaux serveur, et il n'y a pas de signature à gérer pour empêcher qu'un
// tiers manipule la valeur.

const STORAGE_KEY = 'postAuthRedirect';
const DEFAULT_DESTINATION = '/dashboard';

/** Mémorise où revenir. À appeler juste avant de partir chez le fournisseur. */
export function rememberPostAuthDestination(path: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, path);
}

/**
 * Restitue la destination et l'efface, pour qu'une connexion ultérieure ne la
 * réutilise pas par erreur.
 *
 * Seuls les chemins internes sont acceptés : une valeur commençant par `//`
 * ou par un protocole permettrait de rediriger vers un site tiers, ce qui est
 * le mécanisme classique d'une redirection ouverte.
 */
export function consumePostAuthDestination(): string {
  if (typeof window === 'undefined') return DEFAULT_DESTINATION;

  const stored = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);

  if (!stored || !stored.startsWith('/') || stored.startsWith('//')) {
    return DEFAULT_DESTINATION;
  }
  return stored;
}
