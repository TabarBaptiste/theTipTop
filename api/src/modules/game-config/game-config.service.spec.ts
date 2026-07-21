// ===========================================
// Tests unitaires - GameConfig Service
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { GameConfigService } from './game-config.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

describe('GameConfigService', () => {
  let service: GameConfigService;

  const mockPrismaService = {
    gameConfig: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockRedisService = {
    getOrSet: jest.fn((_key: string, _ttl: number, fn: () => Promise<unknown>) => fn()),
    del: jest.fn(),
    delByPattern: jest.fn(),
  };

  const DAY = 86400000;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameConfigService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<GameConfigService>(GameConfigService);
    jest.clearAllMocks();
    // clearAllMocks() ne réinitialise pas les implémentations (seulement les
    // appels) : on la restaure explicitement pour éviter qu'un test
    // (ex: mockResolvedValue sur getOrSet) ne pollue les suivants.
    mockRedisService.getOrSet.mockImplementation(
      (_key: string, _ttl: number, fn: () => Promise<unknown>) => fn(),
    );
  });

  it('should return null when no active config exists', async () => {
    mockPrismaService.gameConfig.findFirst.mockResolvedValue(null);

    expect(await service.getPublicConfig()).toBeNull();
  });

  it('should compute the "not_started" phase', async () => {
    mockPrismaService.gameConfig.findFirst.mockResolvedValue({
      startDate: new Date(Date.now() + DAY),
      endDate: new Date(Date.now() + 31 * DAY),
      claimEndDate: new Date(Date.now() + 61 * DAY),
      isActive: true,
    });

    const config = await service.getPublicConfig();

    expect(config?.phase).toBe('not_started');
  });

  it('should compute the "active" phase', async () => {
    mockPrismaService.gameConfig.findFirst.mockResolvedValue({
      startDate: new Date(Date.now() - DAY),
      endDate: new Date(Date.now() + DAY),
      claimEndDate: new Date(Date.now() + 31 * DAY),
      isActive: true,
    });

    const config = await service.getPublicConfig();

    expect(config?.phase).toBe('active');
  });

  it('should compute the "claim_only" phase', async () => {
    mockPrismaService.gameConfig.findFirst.mockResolvedValue({
      startDate: new Date(Date.now() - 31 * DAY),
      endDate: new Date(Date.now() - DAY),
      claimEndDate: new Date(Date.now() + 29 * DAY),
      isActive: true,
    });

    const config = await service.getPublicConfig();

    expect(config?.phase).toBe('claim_only');
  });

  it('should compute the "ended" phase', async () => {
    mockPrismaService.gameConfig.findFirst.mockResolvedValue({
      startDate: new Date(Date.now() - 61 * DAY),
      endDate: new Date(Date.now() - 31 * DAY),
      claimEndDate: new Date(Date.now() - DAY),
      isActive: true,
    });

    const config = await service.getPublicConfig();

    expect(config?.phase).toBe('ended');
  });

  it('should normalize string dates coming from the Redis cache into ISO strings', async () => {
    // Quand la valeur vient du cache JSON, les dates sont des strings
    const startDate = new Date(Date.now() - DAY).toISOString();
    mockRedisService.getOrSet.mockResolvedValue({
      startDate,
      endDate: new Date(Date.now() + DAY).toISOString(),
      claimEndDate: new Date(Date.now() + 31 * DAY).toISOString(),
      isActive: true,
    });

    const config = await service.getPublicConfig();

    expect(config?.startDate).toBe(startDate);
    expect(typeof config?.endDate).toBe('string');
    expect(config?.isActive).toBe(true);
  });

  describe('updateConfig', () => {
    const makeCurrent = () => ({
      id: 'cfg-1',
      startDate: new Date(Date.now() - DAY),
      endDate: new Date(Date.now() + 30 * DAY),
      claimEndDate: new Date(Date.now() + 60 * DAY),
      isActive: true,
    });

    it('should throw NotFoundException when no active config exists', async () => {
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(null);

      await expect(service.updateConfig({})).rejects.toThrow('Aucune configuration de jeu active');
    });

    it('should reject non-chronological dates', async () => {
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(makeCurrent());

      await expect(
        service.updateConfig({ endDate: new Date(Date.now() - 2 * DAY).toISOString() }),
      ).rejects.toThrow('Les dates doivent être chronologiques');
      expect(mockPrismaService.gameConfig.update).not.toHaveBeenCalled();
    });

    it('should update the config and invalidate the cache', async () => {
      // findFirst est appelé deux fois : une fois pour lire l'état courant,
      // une fois via getPublicConfig() après l'update (cache invalidé).
      // On simule la mutation en base en faisant muter l'objet partagé.
      const current = makeCurrent();
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(current);
      // Reste sous claimEndDate (+60j) pour respecter l'ordre chronologique
      const newEndDate = new Date(Date.now() + 45 * DAY).toISOString();
      mockPrismaService.gameConfig.update.mockImplementation(async ({ data }) => {
        Object.assign(current, data);
        return current;
      });

      const result = await service.updateConfig({ endDate: newEndDate });

      expect(mockPrismaService.gameConfig.update).toHaveBeenCalledWith({
        where: { id: 'cfg-1' },
        data: expect.objectContaining({ endDate: new Date(newEndDate) }),
      });
      expect(mockRedisService.del).toHaveBeenCalledWith('game:config');
      expect(mockRedisService.delByPattern).toHaveBeenCalledWith('stats:*');
      expect(result.endDate).toBe(new Date(newEndDate).toISOString());
    });
  });
});
