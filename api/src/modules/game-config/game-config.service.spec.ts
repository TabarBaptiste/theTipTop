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
    },
  };

  const mockRedisService = {
    getOrSet: jest.fn((_key: string, _ttl: number, fn: () => Promise<unknown>) => fn()),
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
});
