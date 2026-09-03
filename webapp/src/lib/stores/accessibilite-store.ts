import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Préférences d'accessibilité du visiteur.
 *
 * Elles vivent dans le navigateur et nulle part ailleurs : ce sont des
 * préférences de confort, pas des données de compte, et les demander au
 * serveur obligerait à être connecté pour en profiter.
 *
 * Le thème « auto » n'est pas une valeur par défaut faute de mieux : il suit
 * `prefers-color-scheme`, donc le réglage que le visiteur a déjà fait au
 * niveau de son système. Choisir clair ou sombre revient à passer outre.
 */
export type Theme = 'auto' | 'clair' | 'sombre';

/** Trois crans, en pourcentage de la taille de base du document. */
export const TAILLES_TEXTE = [100, 115, 130] as const;
export type TailleTexte = (typeof TAILLES_TEXTE)[number];

export interface PreferencesAccessibilite {
  theme: Theme;
  tailleTexte: TailleTexte;
  /** Critère 1.4.12 : interlignage, espacement des mots et des lettres élargis. */
  espacementTexte: boolean;
  /**
   * Coupe les animations décoratives.
   *
   * Le site respecte déjà `prefers-reduced-motion`, mais tout le monde n'a pas
   * réglé son système - et sur un poste partagé, personne ne le fait.
   */
  animations: boolean;
}

export const PREFERENCES_PAR_DEFAUT: PreferencesAccessibilite = {
  theme: 'auto',
  tailleTexte: 100,
  espacementTexte: false,
  animations: true,
};

interface AccessibiliteState extends PreferencesAccessibilite {
  definirTheme: (theme: Theme) => void;
  definirTailleTexte: (taille: TailleTexte) => void;
  basculerEspacementTexte: () => void;
  basculerAnimations: () => void;
  reinitialiser: () => void;
}

/**
 * Clé de stockage.
 *
 * Partagée avec le script d'amorçage de `layout.tsx`, qui lit les mêmes
 * préférences avant le premier rendu. Les deux doivent rester d'accord : si
 * cette clé change, celle du script aussi.
 */
export const CLE_STOCKAGE = 'thetiptop-accessibilite';

export const useAccessibiliteStore = create<AccessibiliteState>()(
  persist(
    (set) => ({
      ...PREFERENCES_PAR_DEFAUT,
      definirTheme: (theme) => set({ theme }),
      definirTailleTexte: (tailleTexte) => set({ tailleTexte }),
      basculerEspacementTexte: () =>
        set((etat) => ({ espacementTexte: !etat.espacementTexte })),
      basculerAnimations: () => set((etat) => ({ animations: !etat.animations })),
      reinitialiser: () => set(PREFERENCES_PAR_DEFAUT),
    }),
    { name: CLE_STOCKAGE }
  )
);

/**
 * Applique les préférences au document.
 *
 * Volontairement hors du magasin, et écrite pour ne dépendre que du DOM : le
 * script d'amorçage de `layout.tsx` fait exactement la même chose avant que
 * React ne s'exécute. Deux implémentations qui divergeraient produiraient un
 * changement d'apparence au premier rendu.
 */
export function appliquerPreferences(
  preferences: PreferencesAccessibilite,
  racine: HTMLElement
): void {
  const { theme, tailleTexte, espacementTexte, animations } = preferences;

  const sombre =
    theme === 'sombre' ||
    (theme === 'auto' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (sombre) {
    racine.dataset.theme = 'sombre';
  } else {
    delete racine.dataset.theme;
  }

  // 100 % laisse la taille du navigateur intacte, y compris celle qu'un
  // visiteur a lui-meme reglee dans ses preferences.
  racine.style.fontSize = tailleTexte === 100 ? '' : `${tailleTexte}%`;

  racine.toggleAttribute('data-espacement-texte', espacementTexte);
  racine.toggleAttribute('data-sans-animation', !animations);
}
