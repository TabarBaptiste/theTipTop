import { CLE_STOCKAGE, PREFERENCES_PAR_DEFAUT } from '@/lib/stores/accessibilite-store';

/**
 * Applique les préférences d'accessibilité avant le premier rendu.
 *
 * Sans ce script, un visiteur en thème sombre reçoit la page en clair puis la
 * voit basculer à l'hydratation : un éclair blanc à chaque navigation, soit
 * exactement ce que le thème sombre est censé lui épargner. Le même problème
 * se pose pour l'agrandissement, avec un saut de mise en page.
 *
 * D'où un script exécuté de façon synchrone dans le `<head>`, avant que le
 * navigateur ne peigne quoi que ce soit. Il ne peut pas importer le magasin -
 * React n'existe pas encore à ce moment-là - et duplique donc sa logique. Les
 * deux doivent rester d'accord : `appliquerPreferences` fait exactement la
 * même chose côté React.
 *
 * Il lit le format de `zustand/persist`, qui enveloppe l'état dans `{ state }`.
 * Toute la lecture est enveloppée d'un `try` : un stockage inaccessible -
 * navigation privée verrouillée, cookies bloqués - ne doit pas empêcher la
 * page de s'afficher, elle rendra simplement avec les valeurs par défaut.
 */
export function AmorcagePreferences() {
  const script = `
(function () {
  try {
    var brut = localStorage.getItem(${JSON.stringify(CLE_STOCKAGE)});
    var p = brut ? (JSON.parse(brut).state || {}) : {};
    var racine = document.documentElement;

    var theme = p.theme || ${JSON.stringify(PREFERENCES_PAR_DEFAUT.theme)};
    var sombre = theme === 'sombre' ||
      (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (sombre) racine.setAttribute('data-theme', 'sombre');

    var taille = p.tailleTexte || ${PREFERENCES_PAR_DEFAUT.tailleTexte};
    if (taille !== 100) racine.style.fontSize = taille + '%';

    if (p.espacementTexte) racine.setAttribute('data-espacement-texte', '');
    if (p.animations === false) racine.setAttribute('data-sans-animation', '');
  } catch (e) {
    /* Stockage indisponible : la page rend avec les valeurs par defaut. */
  }
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
