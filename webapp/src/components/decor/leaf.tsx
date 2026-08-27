// Verts et bruns de la charte : Vert Mousse et sa variante claire pour les
// feuilles fraiches, les terracotta sombres et l'Or Discret pour les feuilles
// sechees - celles du the.
export const COULEURS_FEUILLE = ['#5C6B3A', '#7A8C56', '#8B4D03', '#6E3D02', '#9A7D48'] as const;

export type CouleurFeuille = (typeof COULEURS_FEUILLE)[number];

interface LeafProps {
  couleur: CouleurFeuille;
  /** Largeur en pixels ; la hauteur suit le rapport du trace. */
  taille: number;
}

/** Silhouette de feuille, partagee par la chute et par le tas. */
export function Leaf({ couleur, taille }: LeafProps) {
  return (
    <svg
      viewBox="0 0 24 32"
      width={taille}
      height={(taille * 32) / 24}
      aria-hidden="true"
      className="block"
    >
      <path d="M12 0C19 8 22 18 12 32C2 18 5 8 12 0Z" fill={couleur} />
      {/* Nervure centrale : sans elle, la forme se lit comme une goutte. */}
      <path d="M12 4V28" stroke="#FAF6EF" strokeOpacity="0.35" strokeWidth="1.2" />
    </svg>
  );
}
