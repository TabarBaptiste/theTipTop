// ===========================================
// Profil 4 — Stress
// ===========================================
// « Pousse délibérément la plateforme au-delà de ses limites pour identifier
// son point de rupture et vérifier qu'elle se dégrade gracieusement plutôt que
// de s'effondrer brutalement. » (CCTD, §3.5)
//
// Ce profil est le seul dont l'échec applicatif est attendu : on cherche le
// point de rupture. Lui appliquer les seuils nominaux ferait échouer le test
// pour la raison même de son existence — d'où des seuils desserrés, qui ne
// vérifient qu'une chose : que la dégradation reste graduelle.

import { SEUILS_RUPTURE, SMOKE, STATS, parcoursParticipant, resumeVers } from './config.js';

export const options = {
  summaryTrendStats: STATS,
  thresholds: SEUILS_RUPTURE,
  stages: SMOKE
    ? [{ duration: '10s', target: 1 }]
    : [
        { duration: '2m', target: 500 },
        { duration: '2m', target: 800 },
        { duration: '2m', target: 1200 },
        { duration: '2m', target: 1600 },
        { duration: '2m', target: 0 },
      ],
};

export default parcoursParticipant;

export const handleSummary = resumeVers('stress');
