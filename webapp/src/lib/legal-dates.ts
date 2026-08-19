// ===========================================
// Dates de révision des documents légaux
// ===========================================
// La date affichée en bas d'un document engage : elle indique au lecteur quelle
// version il consulte. Écrites à la main dans chaque page, ces dates étaient
// restées au 9 juin alors que deux documents avaient changé depuis.
//
// Regrouper ne suffit pas à garantir l'exactitude — modifier un texte sans
// toucher à sa date reste possible. Ce qui est garanti, c'est qu'il n'existe
// qu'un seul endroit à corriger, et le test associé vérifie qu'aucune page ne
// réintroduit une date en dur.
//
// EN MODIFIANT UN DOCUMENT LÉGAL, METTEZ SA DATE À JOUR ICI.
//
// Midi UTC plutôt que minuit : quel que soit le fuseau du lecteur, la journée
// affichée reste la bonne. À minuit, une heure de décalage suffirait à afficher
// la veille.

export const LEGAL_UPDATED_AT = {
  /** Article 5 : dates du jeu-concours corrigées (elles contredisaient l'API). */
  cgu: new Date('2026-08-19T12:00:00Z'),

  /** Article 4 : ajout de la période officielle du jeu-concours. */
  mentionsLegales: new Date('2026-08-19T12:00:00Z'),

  politiqueConfidentialite: new Date('2026-06-09T12:00:00Z'),

  gestionCookies: new Date('2026-06-09T12:00:00Z'),
} as const;
