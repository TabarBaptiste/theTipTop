// ===========================================
// Tests unitaires - Tickets Service
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

describe('TicketsService', () => {
  let service: TicketsService;

  const mockPrismaService = {
    prize: {
      findMany: jest.fn(),
    },
    ticket: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    gameConfig: {
      findFirst: jest.fn(),
    },
  };

  // getOrSet exécute directement la factory (pas de cache en test)
  const mockRedisService = {
    getOrSet: jest.fn((_key: string, _ttl: number, fn: () => Promise<unknown>) => fn()),
    del: jest.fn(),
    delByPattern: jest.fn(),
  };

  const prizes = [
    {
      code: 'INFUSER',
      name: 'Infuseur à thé',
      description: 'Un infuseur',
      value: null,
      percentage: 60,
      totalCount: 300000,
      displayOrder: 1,
      imageUrl: null,
    },
    {
      code: 'GIFT_BOX_39',
      name: 'Coffret Découverte',
      description: 'Un coffret',
      value: '39€',
      percentage: 6,
      totalCount: 30000,
      displayOrder: 4,
      imageUrl: null,
    },
  ];

  const activeGameConfig = {
    id: 'gc1',
    isActive: true,
    startDate: new Date(Date.now() - 86400000),
    endDate: new Date(Date.now() + 86400000),
    claimEndDate: new Date(Date.now() + 30 * 86400000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    jest.clearAllMocks();
    mockPrismaService.prize.findMany.mockResolvedValue(prizes);
  });

  describe('findAllPrizes', () => {
    it('should return prizes ordered by displayOrder', async () => {
      const result = await service.findAllPrizes();

      expect(result).toEqual(prizes);
      expect(mockPrismaService.prize.findMany).toHaveBeenCalledWith({
        orderBy: { displayOrder: 'asc' },
      });
    });
  });

  describe('getPrizesMap', () => {
    it('should build a map keyed by prize code', async () => {
      const map = await service.getPrizesMap();

      expect(map.INFUSER).toEqual({
        name: 'Infuseur à thé',
        description: 'Un infuseur',
        value: null,
      });
      expect(map.GIFT_BOX_39.value).toBe('39€');
    });
  });

  describe('verifyCode', () => {
    it('should reject an invalid format', async () => {
      const result = await service.verifyCode('abc');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('format');
      expect(mockPrismaService.ticket.findUnique).not.toHaveBeenCalled();
    });

    it('should reject an unknown code', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      const result = await service.verifyCode('ABCDEFGH23');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("n'existe pas");
    });

    it('should reject an already used code', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 't1',
        code: 'ABCDEFGH23',
        isUsed: true,
      });

      const result = await service.verifyCode('ABCDEFGH23');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('déjà été utilisé');
    });

    it('should reject when no active game config exists', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 't1',
        code: 'ABCDEFGH23',
        isUsed: false,
      });
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(null);

      const result = await service.verifyCode('ABCDEFGH23');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('actif');
    });

    it('should reject before the game opens', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 't1',
        code: 'ABCDEFGH23',
        isUsed: false,
      });
      mockPrismaService.gameConfig.findFirst.mockResolvedValue({
        ...activeGameConfig,
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 2 * 86400000),
      });

      const result = await service.verifyCode('ABCDEFGH23');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('pas encore commencé');
    });

    it('should reject once the game is over', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 't1',
        code: 'ABCDEFGH23',
        isUsed: false,
      });
      // Le délai de réclamation court toujours : c'est bien la clôture du jeu,
      // et non ce délai, qui ferme la participation.
      mockPrismaService.gameConfig.findFirst.mockResolvedValue({
        ...activeGameConfig,
        startDate: new Date(Date.now() - 2 * 86400000),
        endDate: new Date(Date.now() - 1000),
        claimEndDate: new Date(Date.now() + 30 * 86400000),
      });

      const result = await service.verifyCode('ABCDEFGH23');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('terminé');
    });

    it('should throw NotFoundException when prize metadata is missing', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 't1',
        code: 'ABCDEFGH23',
        isUsed: false,
        prizeType: 'UNKNOWN_PRIZE',
      });
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(activeGameConfig);

      await expect(service.verifyCode('ABCDEFGH23')).rejects.toThrow(NotFoundException);
    });

    it('should accept a valid code (normalized to uppercase) and enrich it with the prize', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 't1',
        code: 'ABCDEFGH23',
        isUsed: false,
        prizeType: 'INFUSER',
      });
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(activeGameConfig);

      const result = await service.verifyCode('abcdefgh23');

      expect(result.isValid).toBe(true);
      expect(result.ticket?.prize.name).toBe('Infuseur à thé');
      expect(mockPrismaService.ticket.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { code: 'ABCDEFGH23' } }),
      );
    });
  });

  describe('findByCode', () => {
    it('should normalize the code before querying', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({ id: 't1' });

      await service.findByCode('  abcdefgh23 ');

      expect(mockPrismaService.ticket.findUnique).toHaveBeenCalledWith({
        where: { code: 'ABCDEFGH23' },
      });
    });
  });

  describe('markAsDistributed', () => {
    it('should throw NotFoundException for an unknown ticket', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(service.markAsDistributed('ABCDEFGH23')).rejects.toThrow(NotFoundException);
    });

    it('should mark the ticket as distributed', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({ id: 't1' });
      mockPrismaService.ticket.update.mockResolvedValue({ id: 't1', isDistributed: true });

      const result = await service.markAsDistributed('ABCDEFGH23');

      expect(result.isDistributed).toBe(true);
      expect(mockPrismaService.ticket.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { isDistributed: true },
      });
      expect(mockRedisService.delByPattern).toHaveBeenCalledWith('stats:*');
    });
  });

  describe('getAvailableCodes', () => {
    it('should reject requests above 100 codes', async () => {
      await expect(service.getAvailableCodes(101)).rejects.toThrow(BadRequestException);
    });

    it('should return codes and mark them as distributed', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([{ code: 'AAAA' }, { code: 'BBBB' }]);
      mockPrismaService.ticket.updateMany.mockResolvedValue({ count: 2 });

      const codes = await service.getAvailableCodes(2);

      expect(codes).toEqual(['AAAA', 'BBBB']);
      expect(mockPrismaService.ticket.updateMany).toHaveBeenCalledWith({
        where: { code: { in: ['AAAA', 'BBBB'] } },
        data: { isDistributed: true },
      });
      expect(mockRedisService.delByPattern).toHaveBeenCalledWith('stats:*');
    });

    it('should not touch the cache when no codes are available', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([]);
      mockPrismaService.ticket.updateMany.mockResolvedValue({ count: 0 });

      const codes = await service.getAvailableCodes(5);

      expect(codes).toEqual([]);
      expect(mockRedisService.delByPattern).not.toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should aggregate ticket statistics', async () => {
      mockPrismaService.ticket.count
        .mockResolvedValueOnce(500000) // total
        .mockResolvedValueOnce(1000) // used
        .mockResolvedValueOnce(2000); // distributed
      mockPrismaService.ticket.groupBy.mockResolvedValue([
        { prizeType: 'INFUSER', _count: 600 },
        { prizeType: 'UNKNOWN', _count: 1 },
      ]);

      const stats = await service.getStats();

      expect(stats.total).toBe(500000);
      expect(stats.available).toBe(498000);
      expect(stats.remainingToUse).toBe(1000);
      expect(stats.prizeDistribution.INFUSER).toEqual({
        count: 600,
        label: 'Infuseur à thé',
      });
      // Fallback sur le code technique si le lot est inconnu
      expect(stats.prizeDistribution.UNKNOWN.label).toBe('UNKNOWN');
    });
  });
});
