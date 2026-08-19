// ===========================================
// Test de charge k6 - smoke de performance
// ===========================================
// Les VUs et la duree sont passes en CLI par le pipeline
// (ex: k6 run --vus 10 --duration 30s), volontairement absents
// de `options` pour rester pilotables par environnement.

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
