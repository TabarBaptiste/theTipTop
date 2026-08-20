// ===========================================
// Profil 1 — Montée en charge
// ===========================================
// « De 10 à 500 utilisateurs simultanés en dix minutes, pour identifier le
// seuil à partir duquel les temps de réponse se dégradent et les premiers
// goulots d'étranglement apparaissent. » (CCTD, §3.5)
//
// La montée est progressive et continue : c'est la comparaison entre paliers
// qui situe le point d'inflexion. Un test qui sauterait directement à 500 VUs
// dirait seulement que ça tient, ou non, sans indiquer où ça a lâché.

import { SEUILS, SMOKE, STATS, parcoursParticipant, resumeVers } from './config.js';

export const options = {
  summaryTrendStats: STATS,
  thresholds: SEUILS,
  stages: SMOKE
    ? [{ duration: '10s', target: 1 }]
    : [
        { duration: '2m', target: 50 },
        { duration: '2m', target: 150 },
        { duration: '2m', target: 300 },
        { duration: '2m', target: 500 },
        // Redescente incluse dans les dix minutes : elle libère les connexions
        // et évite d'attribuer au profil suivant une saturation héritée.
        { duration: '2m', target: 0 },
      ],
};

export default parcoursParticipant;

export const handleSummary = resumeVers('montee-en-charge');
