// ===========================================
// Profil 5 — Récupération
// ===========================================
// « Vérifie que la plateforme revient à un état nominal dans un délai
// acceptable après un pic de charge intense. » (CCTD, §3.5)
//
// La question posée n'est pas « tient-elle le pic ? » — c'est l'objet du
// profil 3 — mais « qu'en reste-t-il ensuite ? ». Une plateforme peut absorber
// un afflux et rester durablement dégradée : connexions PostgreSQL non
// rendues, cache invalidé en cascade, files d'attente encore pleines.
//
// La mesure se lit en comparant les deux paliers nominaux, avant et après le
// pic. Ils sont volontairement identiques et de même durée : leurs p95
// doivent être du même ordre. Un écart durable signale que la plateforme n'est
// pas revenue à son état initial.

import { SEUILS, SMOKE, STATS, parcoursParticipant, resumeVers } from './config.js';

export const options = {
  summaryTrendStats: STATS,
  thresholds: SEUILS,
  stages: SMOKE
    ? [{ duration: '10s', target: 1 }]
    : [
        // Référence avant le pic.
        { duration: '3m', target: 50 },
        // Le pic, bref et violent.
        { duration: '30s', target: 600 },
        { duration: '1m', target: 600 },
        { duration: '30s', target: 50 },
        // Même palier qu'au départ : c'est la comparaison qui fait la mesure.
        { duration: '3m', target: 50 },
      ],
};

export default parcoursParticipant;

export const handleSummary = resumeVers('recuperation');
