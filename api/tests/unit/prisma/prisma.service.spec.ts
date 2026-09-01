// ===========================================
// Tests unitaires - Prisma Service
// ===========================================

import { PrismaService } from '@/prisma/prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
  });

  it('should connect on module init', async () => {
    const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();
  });

  it('should disconnect on module destroy', async () => {
    const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue();

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  describe('cleanDatabase', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should refuse to run outside the test environment', async () => {
      process.env.NODE_ENV = 'production';

      await expect(service.cleanDatabase()).rejects.toThrow(
        "cleanDatabase ne peut être utilisé qu'en environnement de test",
      );
    });
  });
});
