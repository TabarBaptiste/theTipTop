'use client';

import { useEffect, useState } from 'react';
import { Leaf, type CouleurFeuille } from '@/components/decor/leaf';
import { useDecorActif } from '@/components/decor/use-decor-actif';

interface FeuilleDuTas {
  gauche: number;
  taille: number;
  couleur: CouleurFeuille;
  /** Inclinaison au repos : un tas de feuilles droites se lit comme une frise. */
  rotation: number;
  /** Hauteur au-dessus du bord : les dernieres se posent sur les premieres. */
  hauteur: number;
}

// L'ordre de la liste est l'ordre d'arrivee : les feuilles a plat d'abord, les
// quelques-unes en surplomb ensuite, sinon le tas se remplirait par le haut.
const TAS: FeuilleDuTas[] = [
  { gauche: 6, taille: 22, couleur: '#5C6B3A', rotation: -74, hauteur: 0 },
  { gauche: 78, taille: 20, couleur: '#8B4D03', rotation: 68, hauteur: 0 },
  { gauche: 33, taille: 24, couleur: '#6E3D02', rotation: -82, hauteur: 0 },
  { gauche: 92, taille: 18, couleur: '#7A8C56', rotation: 79, hauteur: 0 },
  { gauche: 17, taille: 19, couleur: '#9A7D48', rotation: 86, hauteur: 0 },
  { gauche: 55, taille: 23, couleur: '#5C6B3A', rotation: -68, hauteur: 0 },
  { gauche: 44, taille: 17, couleur: '#8B4D03', rotation: 72, hauteur: 0 },
  { gauche: 68, taille: 21, couleur: '#6E3D02', rotation: -88, hauteur: 0 },
  { gauche: 25, taille: 20, couleur: '#7A8C56', rotation: 64, hauteur: 0 },
  { gauche: 86, taille: 22, couleur: '#9A7D48', rotation: -71, hauteur: 0 },
  { gauche: 11, taille: 16, couleur: '#8B4D03', rotation: 84, hauteur: 9 },
  { gauche: 61, taille: 18, couleur: '#5C6B3A', rotation: -63, hauteur: 8 },
  { gauche: 38, taille: 15, couleur: '#9A7D48', rotation: 77, hauteur: 10 },
  { gauche: 73, taille: 17, couleur: '#7A8C56', rotation: -80, hauteur: 9 },
  { gauche: 50, taille: 16, couleur: '#6E3D02', rotation: 70, hauteur: 11 },
];

/** Delai entre deux feuilles qui se posent. */
const INTERVALLE_MS = 2200;

/**
 * Tas de feuilles qui s'accumule sur le bord haut du pied de page.
 *
 * Les feuilles se posent une a une plutot que d'etre toutes la au chargement :
 * le tas se construit sous les yeux du visiteur, comme si celles qui tombent
 * s'y arretaient.
 */
export function LeafPile() {
  const actif = useDecorActif();
  const [posees, setPosees] = useState(0);

  useEffect(() => {
    if (!actif || posees >= TAS.length) return;

    const minuteur = setTimeout(() => setPosees((nombre) => nombre + 1), INTERVALLE_MS);
    return () => clearTimeout(minuteur);
  }, [actif, posees]);

  if (!actif) return null;

  return (
    // Le debordement est coupe : sans cela, une feuille posee pres du bord
    // droit elargirait la page de sa propre largeur.
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 -top-6 h-14 overflow-hidden"
    >
      {TAS.slice(0, posees).map((f) => (
        <span
          key={f.gauche}
          className="animate-atterrissage absolute"
          style={{ left: `${f.gauche}%`, bottom: `${f.hauteur}px`, rotate: `${f.rotation}deg` }}
        >
          <Leaf couleur={f.couleur} taille={f.taille} />
        </span>
      ))}
    </div>
  );
}
