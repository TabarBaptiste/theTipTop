// ===========================================
// Tests unitaires - Health Controller
// ===========================================
// Ce contrôleur paraît trivial, mais c'est lui que la chaîne de déploiement
// interroge : `apiHealthPath: '/api/v1/health'` dans le Jenkinsfile. Une
// réponse dont la forme change ferait échouer la vérification de santé, donc le
// déploiement, avec un message d'erreur qui ne pointerait pas vers ce fichier.

import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // La forme exacte de la réponse est le contrat avec la chaîne de
  // déploiement : elle est figée ici, pas seulement « une réponse 200 ».
  it('should report the service as healthy', () => {
    expect(controller.check()).toEqual({ status: 'ok' });
  });

  // Aucune dépendance injectée : la sonde doit répondre même si la base ou
  // Redis sont indisponibles. Dans le cas contraire, une panne de base
  // empêcherait tout redéploiement - y compris celui qui la corrigerait.
  it('should answer without any injected dependency', () => {
    expect(() => controller.check()).not.toThrow();
  });
});
