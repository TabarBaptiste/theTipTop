// ===========================================
// Profil 2 — Charge soutenue
// ===========================================
// « Maintient un niveau de trafic constant correspondant à l'usage nominal
// prévu pendant trente minutes, pour détecter les dégradations progressives
// liées à des fuites mémoire ou à une saturation progressive du pool de
// connexions PostgreSQL. » (CCTD, §3.5)
//
// C'est la durée qui fait le test, pas l'intensité. Une fuite mémoire ou un
// pool qui ne se recycle pas ne se voient pas sur cinq minutes : ils se
// manifestent par une dérive lente des temps de réponse, à charge constante.
// Comparer le p95 du premier tiers à celui du dernier est la lecture utile.

import { SEUILS, SMOKE, STATS, parcoursParticipant, resumeVers } from './config.js';

// Palier nominal : hors activation influenceur, l'opération vise un flux
// régulier bien en deçà des pics. 50 utilisateurs simultanés tiennent ce rôle.
const NOMINAL = Number(__ENV.VUS_NOMINAL || 50);

export const options = {
  summaryTrendStats: STATS,
  thresholds: SEUILS,
  scenarios: {
    charge_soutenue: {
      executor: 'constant-vus',
      vus: SMOKE ? 1 : NOMINAL,
      duration: SMOKE ? '10s' : '30m',
      gracefulStop: '30s',
    },
  },
};

export default parcoursParticipant;

export const handleSummary = resumeVers('charge-soutenue');
