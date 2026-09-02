/**
 * Doodles botaniques dessines au trait.
 *
 * Meme famille que les lisieres de feuilles et les brins de lavande du hero -
 * trait fin, bouts arrondis - mais d'un autre repertoire : camomille, feuille
 * nervuree, anis etoile, baies, brindille. Ils comblent les sections qui
 * n'avaient que du texte, sans y ajouter de photo.
 *
 * Chacun prend `currentColor` : le meme dessin sert en blanc sur le panneau
 * vert du grand prix et en vert mousse sur les fonds clairs des lots. La
 * couleur se pose donc sur le conteneur, pas sur le doodle.
 */

import { cn } from '@/lib/utils';

export type Doodle = 'camomille' | 'feuille' | 'anis' | 'baies' | 'brindille';

/** Angles des huit petales, en degres, pour la camomille et l'anis. */
const PETALES = [0, 45, 90, 135, 180, 225, 270, 315];

const TRACES: Record<Doodle, React.ReactNode> = {
  camomille: (
    <>
      <path d="M50 96 C 50 78 48 66 44 54" />
      <path d="M46 74 C 38 74 33 69 32 62 C 39 61 45 66 46 74Z" />
      <path d="M47 62 C 55 61 60 55 60 48 C 53 48 47 54 47 62Z" />
      <circle cx="43" cy="42" r="3.8" />
      {PETALES.map((angle) => (
        <ellipse
          key={angle}
          cx="43"
          cy="28"
          rx="2.4"
          ry="9"
          transform={`rotate(${angle} 43 42)`}
        />
      ))}
    </>
  ),
  feuille: (
    <>
      <path d="M50 6 C 74 26 76 58 50 94 C 24 58 26 26 50 6Z" />
      <path d="M50 14 L50 88" />
      <path d="M50 32 L35 42 M50 32 L65 42 M50 50 L33 60 M50 50 L67 60 M50 68 L39 76 M50 68 L61 76" />
    </>
  ),
  anis: (
    <>
      <circle cx="50" cy="50" r="7.5" />
      {PETALES.map((angle) => (
        <path
          key={angle}
          d="M50 43 C 43 30 47 12 50 8 C 53 12 57 30 50 43Z"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
    </>
  ),
  baies: (
    <>
      <path d="M52 96 C 50 76 48 62 44 48" />
      <path d="M44 48 L34 38 M46 58 L58 50 M48 70 L38 64" />
      <path d="M44 48 C 40 40 41 32 44 27" />
      <circle cx="30" cy="33" r="7" />
      <circle cx="62" cy="45" r="6" />
      <circle cx="34" cy="60" r="5" />
      <circle cx="45" cy="21" r="6.5" />
    </>
  ),
  brindille: (
    <>
      <path d="M50 96 C 52 70 52 44 50 16" />
      <path d="M51 72 C 38 71 30 63 29 52 C 41 52 50 61 51 72Z" />
      <path d="M51 58 C 64 57 72 49 73 38 C 61 38 52 47 51 58Z" />
      <path d="M51 42 C 39 41 32 34 31 24 C 42 24 50 32 51 42Z" />
      <path d="M50 28 C 60 27 66 21 67 13 C 58 13 51 20 50 28Z" />
    </>
  ),
};

/** Un doodle pose dans une composition : ou, a quelle taille, sous quel angle. */
export interface DoodlePose {
  doodle: Doodle;
  /** Position du centre, en pourcentage du conteneur. */
  haut: number;
  gauche: number;
  /** Cote du carre, en pixels. */
  taille: number;
  rotation: number;
  opacite: number;
}

/**
 * Couche decorative posee sur toute la surface du parent, qui doit etre en
 * position relative.
 *
 * Masquee sous md : les doodles y chevaucheraient le texte, qui occupe alors
 * toute la largeur, et rien ne serait gagne a les entasser.
 */
export function SemisDeDoodles({ poses, className }: { poses: DoodlePose[]; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 hidden md:block', className)}
    >
      {poses.map((pose, i) => (
        <svg
          // Deux doodles du meme type peuvent cohabiter : l'index est ici la
          // seule identite stable, la liste etant fixe et jamais reordonnee.
          key={i}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute"
          style={{
            top: `${pose.haut}%`,
            left: `${pose.gauche}%`,
            width: pose.taille,
            height: pose.taille,
            opacity: pose.opacite,
            transform: `translate(-50%, -50%) rotate(${pose.rotation}deg)`,
          }}
        >
          {TRACES[pose.doodle]}
        </svg>
      ))}
    </div>
  );
}
