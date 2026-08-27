interface TornEdgeProps {
  /**
   * Couleur de la section precedente : la decoupe la prolonge par-dessus
   * celle-ci, ce qui donne l'impression que la section du dessous a ete
   * dechiree.
   */
  couleur: string;
  className?: string;
}

/**
 * Bord superieur irregulier, a poser en tete d'une section.
 *
 * Une simple vague ferait « bandeau decoratif ». Les alternances rapprochees
 * et d'amplitudes inegales de ce trace donnent le bord dechire de la maquette.
 */
export function TornEdge({ couleur, className }: TornEdgeProps) {
  return (
    <svg
      viewBox="0 0 1440 96"
      // La forme est etiree a la largeur de l'ecran : sans cela, elle garderait
      // son rapport et depasserait en hauteur sur les grands ecrans.
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      <path
        fill={couleur}
        d="M0,0 L1440,0 L1440,34 C1372,58 1330,22 1268,44 C1206,66 1160,30 1096,50 C1032,70 988,26 922,46 C856,66 812,24 744,44 C676,64 630,20 566,42 C502,64 456,28 392,48 C328,68 282,24 216,44 C150,64 104,30 44,52 C29,57 15,61 0,64 Z"
      />
    </svg>
  );
}
