// ===========================================
// Profil 3 - Pic d'activation
// ===========================================
// « Simule l'afflux massif et soudain de visiteurs correspondant à une
// activation influenceur - plusieurs centaines de connexions simultanées en
// moins d'une minute - pour vérifier que le système de cache Redis absorbe
// correctement la charge sans répercuter les requêtes sur PostgreSQL. »
// (CCTD, §3.5)
//
// La vérification attendue ne se lit pas seulement dans les temps de réponse :
// pendant l'exécution, le nombre de connexions actives sur PostgreSQL doit
// rester stable alors que le trafic est multiplié par dix. La marche à suivre
// est décrite dans docs/05-PROTOCOLES-DE-TESTS.md.

import { SEUILS, SMOKE, STATS, parcoursParticipant, resumeVers } from './config.js';

export const options = {
  summaryTrendStats: STATS,
  thresholds: SEUILS,
  stages: SMOKE
    ? [{ duration: '10s', target: 1 }]
    : [
        // Trafic de fond, pour que le pic se détache d'une ligne de base.
        { duration: '1m', target: 30 },
        // L'afflux : moins d'une minute pour atteindre plusieurs centaines.
        { duration: '30s', target: 400 },
        { duration: '2m', target: 400 },
        { duration: '30s', target: 30 },
        { duration: '1m', target: 30 },
      ],
};

export default parcoursParticipant;

export const handleSummary = resumeVers('pic');
