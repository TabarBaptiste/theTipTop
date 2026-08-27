// Les photos du projet sont toutes rectangulaires. Les decouper en taches
// irregulieres leur donne l'allure peinte de la maquette sans qu'aucun visuel
// soit a refaire : le trace vit dans le code, pas dans le fichier image.

/**
 * Traces en coordonnees relatives (0 a 1) : la meme forme s'applique a
 * n'importe quelle taille de conteneur, sans recalcul.
 */
export const TACHES = {
  /** Presque ronde, legerement bosselee - pour un visuel carre. */
  ronde:
    'M0.52,0.01 C0.72,0.00 0.89,0.11 0.95,0.30 C1.00,0.45 0.99,0.63 0.91,0.76 C0.83,0.91 0.67,0.99 0.50,0.99 C0.32,0.99 0.15,0.91 0.07,0.76 C-0.01,0.62 0.01,0.44 0.07,0.29 C0.15,0.10 0.32,0.02 0.52,0.01 Z',
  /** Plus etalee et plus mordue sur les bords - pour un visuel large. */
  large:
    'M0.06,0.28 C0.16,0.09 0.38,0.02 0.57,0.04 C0.74,0.06 0.87,0.00 0.95,0.14 C1.01,0.26 0.96,0.42 0.98,0.58 C1.00,0.76 0.90,0.93 0.72,0.97 C0.54,1.01 0.36,0.94 0.22,0.90 C0.06,0.85 -0.02,0.68 0.01,0.51 C0.02,0.42 0.02,0.35 0.06,0.28 Z',
} as const;

interface OrganicClipProps {
  /** Identifiant cible du clip-path ; unique dans la page. */
  id: string;
  trace: (typeof TACHES)[keyof typeof TACHES];
}

/** Declare un masque, a poser une fois par forme utilisee dans la page. */
export function OrganicClip({ id, trace }: OrganicClipProps) {
  return (
    <svg width="0" height="0" aria-hidden="true" className="absolute">
      <defs>
        <clipPath id={id} clipPathUnits="objectBoundingBox">
          <path d={trace} />
        </clipPath>
      </defs>
    </svg>
  );
}
