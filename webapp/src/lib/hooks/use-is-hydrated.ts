import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Renvoie false pendant le rendu serveur et le premier rendu client, true une
 * fois l'hydratation faite.
 *
 * Sert à neutraliser tout ce qui n'a de sens qu'avec JavaScript actif. Cas
 * concret : tant qu'un formulaire n'est pas hydraté, il reste un formulaire
 * HTML ordinaire ; le soumettre déclenche un envoi natif en GET qui recopie
 * tous les champs dans l'URL - donc dans l'historique du navigateur, les logs
 * serveur et l'en-tête Referer.
 *
 * useSyncExternalStore plutôt qu'un useState dans un useEffect : pas de rendu
 * supplémentaire, et pas de mise à jour d'état depuis un effet.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
