// ===========================================
// Test de charge k6 - smoke de performance
// ===========================================
// Les VUs et la duree sont passes en CLI par le pipeline
// (ex: k6 run --vus 10 --duration 30s), volontairement absents
// de `options` pour rester pilotables par environnement.
//
// Point d'entree du pipeline, et lui seul : ce fichier reste un smoke, dont le
// role est de detecter une regression grossiere a chaque deploiement. Les cinq
// profils du cahier des clauses techniques - montee en charge, charge
// soutenue, pic, stress, recuperation - vivent a cote et se lancent
// explicitement, campagne par campagne. Voir README.md et
// docs/05-PROTOCOLES-DE-TESTS.md.

import http from 'k6/http';
import { check } from 'k6';

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/`);

  check(res, {
    'status est 200': (r) => r.status === 200,
  });
}
