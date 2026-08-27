'use client';

import { Leaf, type CouleurFeuille } from '@/components/decor/leaf';
import { useDecorActif } from '@/components/decor/use-decor-actif';

interface FeuilleQuiTombe {
  /** Colonne de depart, en pourcentage de la largeur de l'ecran. */
  gauche: number;
  taille: number;
  couleur: CouleurFeuille;
  opacite: number;
  /** Duree de la descente : plus la feuille est grande, plus elle tombe vite. */
  chute: number;
  /** Duree du balancement, volontairement sans rapport avec la descente. */
  balancement: number;
  /** Decalage au demarrage, pour que l'ecran ne se remplisse pas d'un coup. */
  delai: number;
}

// Valeurs fixes plutot que tirees au hasard : un tirage a chaque rendu
// donnerait un resultat different sur le serveur et dans le navigateur, donc
// une divergence d'hydratation. Elles sont reparties a la main pour eviter les
// alignements et les paquets.
const FEUILLES: FeuilleQuiTombe[] = [
  { gauche: 4, taille: 20, couleur: '#5C6B3A', opacite: 0.5, chute: 17, balancement: 4.1, delai: 0 },
  { gauche: 13, taille: 14, couleur: '#8B4D03', opacite: 0.4, chute: 22, balancement: 5.3, delai: 6 },
  { gauche: 21, taille: 24, couleur: '#7A8C56', opacite: 0.45, chute: 15, balancement: 3.6, delai: 11 },
  { gauche: 29, taille: 12, couleur: '#9A7D48', opacite: 0.35, chute: 25, balancement: 6.2, delai: 3 },
  { gauche: 38, taille: 18, couleur: '#6E3D02', opacite: 0.45, chute: 19, balancement: 4.7, delai: 14 },
  { gauche: 46, taille: 22, couleur: '#5C6B3A', opacite: 0.4, chute: 16, balancement: 3.9, delai: 8 },
  { gauche: 55, taille: 13, couleur: '#8B4D03', opacite: 0.35, chute: 24, balancement: 5.8, delai: 18 },
  { gauche: 63, taille: 26, couleur: '#7A8C56', opacite: 0.45, chute: 14, balancement: 4.4, delai: 2 },
  { gauche: 71, taille: 16, couleur: '#9A7D48', opacite: 0.4, chute: 21, balancement: 5.1, delai: 12 },
  { gauche: 79, taille: 20, couleur: '#6E3D02', opacite: 0.45, chute: 18, balancement: 3.4, delai: 5 },
  { gauche: 87, taille: 14, couleur: '#5C6B3A', opacite: 0.35, chute: 23, balancement: 6.5, delai: 16 },
  { gauche: 94, taille: 22, couleur: '#8B4D03', opacite: 0.4, chute: 16, balancement: 4.9, delai: 9 },
];

/**
 * Pluie de feuilles sur toute la hauteur de l'ecran.
 *
 * La couche est fixe : les feuilles continuent de tomber pendant le
 * defilement, au lieu de rester accrochees a un endroit de la page. Elle
 * disparait entierement pour qui a demande moins de mouvement - la figer
 * laisserait douze feuilles arretees en plein vol.
 */
export function FallingLeaves() {
  const actif = useDecorActif();
  if (!actif) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden motion-reduce:hidden"
    >
      {FEUILLES.map((f) => (
        <span
          key={f.gauche}
          className="animate-chute absolute top-0"
          style={{
            left: `${f.gauche}%`,
            opacity: f.opacite,
            animationDuration: `${f.chute}s`,
            animationDelay: `-${f.delai}s`,
          }}
        >
          {/* Le balancement vit sur un second element : deux animations sur un
              seul transform s'annuleraient. */}
          <span
            className="animate-balancement block"
            style={{
              animationDuration: `${f.balancement}s`,
              animationDelay: `-${f.delai}s`,
            }}
          >
            <Leaf couleur={f.couleur} taille={f.taille} />
          </span>
        </span>
      ))}
    </div>
  );
}
