'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Accessibility, RotateCcw, X } from 'lucide-react';
import {
  TAILLES_TEXTE,
  appliquerPreferences,
  useAccessibiliteStore,
  type TailleTexte,
  type Theme,
} from '@/lib/stores/accessibilite-store';
import { cn } from '@/lib/utils';

const THEMES: { valeur: Theme; libelle: string; aide: string }[] = [
  { valeur: 'auto', libelle: 'Automatique', aide: 'Suit le réglage de votre appareil' },
  { valeur: 'clair', libelle: 'Clair', aide: 'Fond crème, texte sombre' },
  { valeur: 'sombre', libelle: 'Sombre', aide: 'Fond sombre, texte clair' },
];

const LIBELLES_TAILLE: Record<TailleTexte, string> = {
  100: 'Normale',
  115: 'Grande',
  130: 'Très grande',
};

/**
 * Réglages d'accessibilité, derrière un bouton flottant.
 *
 * Le panneau est un dialogue non modal : il n'enferme pas la navigation, on
 * peut le laisser ouvert et continuer à lire la page derrière. C'est
 * volontaire - régler la taille du texte sans voir l'effet sur le contenu
 * n'aurait pas de sens. Le focus y entre à l'ouverture et revient au bouton à
 * la fermeture, `Échap` ferme, et un clic à l'extérieur aussi.
 */
export function PanneauAccessibilite() {
  const [ouvert, setOuvert] = useState(false);
  const boutonRef = useRef<HTMLButtonElement>(null);
  const panneauRef = useRef<HTMLDivElement>(null);
  const titreId = useId();

  const preferences = useAccessibiliteStore();
  const {
    theme,
    tailleTexte,
    espacementTexte,
    animations,
    definirTheme,
    definirTailleTexte,
    basculerEspacementTexte,
    basculerAnimations,
    reinitialiser,
  } = preferences;

  /**
   * Report des preferences sur le document.
   *
   * Le script d'amorcage les a deja posees avant le premier rendu ; cet effet
   * prend le relais pour les changements, et reconcilie apres l'hydratation.
   * Le theme « auto » s'ecoute en continu : un visiteur qui bascule son
   * systeme en soiree doit voir la page suivre sans la recharger.
   */
  useEffect(() => {
    appliquerPreferences(
      { theme, tailleTexte, espacementTexte, animations },
      document.documentElement
    );

    if (theme !== 'auto') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const suivre = () =>
      appliquerPreferences(
        { theme, tailleTexte, espacementTexte, animations },
        document.documentElement
      );
    media.addEventListener('change', suivre);
    return () => media.removeEventListener('change', suivre);
  }, [theme, tailleTexte, espacementTexte, animations]);

  // Echap ferme, ou que soit le focus. Le clic exterieur ferme aussi, sans
  // quoi le panneau resterait ouvert par-dessus la page qu'on essaie de lire.
  useEffect(() => {
    if (!ouvert) return;

    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOuvert(false);
        boutonRef.current?.focus();
      }
    };
    const surClic = (e: MouseEvent) => {
      const cible = e.target as Node;
      if (!panneauRef.current?.contains(cible) && !boutonRef.current?.contains(cible)) {
        setOuvert(false);
      }
    };

    document.addEventListener('keydown', surTouche);
    document.addEventListener('mousedown', surClic);
    return () => {
      document.removeEventListener('keydown', surTouche);
      document.removeEventListener('mousedown', surClic);
    };
  }, [ouvert]);

  // Le focus entre dans le panneau a l'ouverture : sans cela, la tabulation
  // repartirait du bouton et traverserait la page avant d'y arriver.
  useEffect(() => {
    if (ouvert) panneauRef.current?.querySelector('button')?.focus();
  }, [ouvert]);

  return (
    <div className="fixed bottom-6 left-6 z-[60] print:hidden">
      {ouvert && (
        <div
          ref={panneauRef}
          role="dialog"
          aria-labelledby={titreId}
          className="mb-3 w-[20rem] max-w-[calc(100vw-3rem)] rounded-card border border-section-line bg-surface p-5 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 id={titreId} className="font-display text-h3 not-italic text-ink">
              Accessibilité
            </h2>
            <button
              type="button"
              onClick={() => {
                setOuvert(false);
                boutonRef.current?.focus();
              }}
              aria-label="Fermer les réglages d'accessibilité"
              className="-m-2 flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>

          <fieldset className="mt-5">
            <legend className="font-functional text-ui uppercase text-stone-grey">Thème</legend>
            <div className="mt-3 flex flex-col gap-2">
              {THEMES.map((t) => (
                <label
                  key={t.valeur}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-soft border p-3 transition-colors',
                    theme === t.valeur
                      ? 'border-accent bg-accent/10'
                      : 'border-section-line hover:bg-ink/5'
                  )}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={t.valeur}
                    checked={theme === t.valeur}
                    onChange={() => definirTheme(t.valeur)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-terracotta-600"
                  />
                  <span>
                    <span className="block text-body font-semibold text-ink">{t.libelle}</span>
                    <span className="block text-caption text-stone-grey">{t.aide}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="font-functional text-ui uppercase text-stone-grey">
              Taille du texte
            </legend>
            <div className="mt-3 flex gap-2">
              {TAILLES_TEXTE.map((taille) => (
                <label
                  key={taille}
                  className={cn(
                    'flex flex-1 cursor-pointer items-center justify-center rounded-soft border py-3 text-center transition-colors',
                    tailleTexte === taille
                      ? 'border-accent bg-accent/10'
                      : 'border-section-line hover:bg-ink/5'
                  )}
                >
                  <input
                    type="radio"
                    name="taille-texte"
                    value={taille}
                    checked={tailleTexte === taille}
                    onChange={() => definirTailleTexte(taille)}
                    className="sr-only"
                  />
                  <span className="text-caption font-semibold text-ink">
                    {LIBELLES_TAILLE[taille]}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-5 flex flex-col gap-2">
            <Interrupteur
              libelle="Espacer le texte"
              aide="Interlignage et espacement élargis"
              actif={espacementTexte}
              onChange={basculerEspacementTexte}
            />
            <Interrupteur
              libelle="Animations"
              aide="Apparitions et transitions du site"
              actif={animations}
              onChange={basculerAnimations}
            />
          </div>

          <button
            type="button"
            onClick={reinitialiser}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-section-line font-functional text-ui uppercase text-ink transition-colors hover:bg-ink/5"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
            Tout réinitialiser
          </button>
        </div>
      )}

      <button
        ref={boutonRef}
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-haspopup="dialog"
        aria-label="Réglages d'accessibilité"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-terracotta-600 text-white shadow-lg transition-colors hover:bg-terracotta-700"
      >
        <Accessibility className="h-6 w-6" strokeWidth={1.75} />
      </button>
    </div>
  );
}

/**
 * Interrupteur a deux etats.
 *
 * Un `<button role="switch">` plutot qu'une case a cocher : la case annonce
 * « coche / decoche », le commutateur « active / desactive », qui decrit mieux
 * un reglage prenant effet immediatement.
 */
function Interrupteur({
  libelle,
  aide,
  actif,
  onChange,
}: {
  libelle: string;
  aide: string;
  actif: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      onClick={onChange}
      className="flex items-center justify-between gap-3 rounded-soft border border-section-line p-3 text-left transition-colors hover:bg-ink/5"
    >
      <span>
        <span className="block text-body font-semibold text-ink">{libelle}</span>
        <span className="block text-caption text-stone-grey">{aide}</span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors',
          actif ? 'bg-terracotta-600' : 'bg-ink/25'
        )}
      >
        <span
          className={cn(
            'h-5 w-5 rounded-full bg-white transition-transform',
            actif && 'translate-x-5'
          )}
        />
      </span>
    </button>
  );
}
