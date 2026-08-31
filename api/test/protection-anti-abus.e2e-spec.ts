// ===========================================
// Limitation de debit
// ===========================================
// Les autres suites neutralisent le ThrottlerGuard pour pouvoir enchainer
// leurs appels. Celle-ci le laisse en place : sans elle, plus rien ne
// garantirait que la protection est reellement branchee en production.

import request from 'supertest';

import { Contexte, demarrer, nettoyer } from './utils';

describe('Limitation de debit', () => {
  let ctx: Contexte;

  beforeAll(async () => {
    ctx = await demarrer({ avecThrottling: true });
  });

  afterAll(async () => {
    if (ctx) {
      await nettoyer(ctx);
      await ctx.app.close();
    }
  });

  it('refuse la quatrieme requete de la meme seconde', async () => {
    const http = () => request(ctx.app.getHttpServer());

    // Le palier le plus court autorise trois requetes par seconde et par IP.
    const statuts: number[] = [];
    for (let i = 0; i < 4; i++) {
      const r = await http().get('/api/v1/health');
      statuts.push(r.status);
    }

    // Les trois premieres passent, la quatrieme est repoussee. Affirmer les
    // deux evite qu'un plafond mal regle - declenche des la premiere requete -
    // ne fasse passer ce test pour la mauvaise raison.
    expect(statuts.slice(0, 3)).toEqual([200, 200, 200]);
    expect(statuts[3]).toBe(429);
  });
});
