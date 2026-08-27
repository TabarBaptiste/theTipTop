'use client';

import { usePathname } from 'next/navigation';

// Le decor accompagne les pages ouvertes au public. Les espaces de travail -
// tableaux de bord de l'administration, du personnel et du client - sont des
// outils : des feuilles qui tombent en travers d'un tableau de lots y
// deconcentreraient sans rien apporter.
const ESPACES_DE_TRAVAIL = /^\/(admin|employee|dashboard)(\/|$)/;

/** Indique si le decor saisonnier doit s'afficher sur la page courante. */
export function useDecorActif() {
  const chemin = usePathname();
  return !ESPACES_DE_TRAVAIL.test(chemin ?? '');
}
