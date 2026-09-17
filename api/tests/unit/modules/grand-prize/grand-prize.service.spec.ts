// ===========================================
// Tests unitaires - Grand Prize Service
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GrandPrizeService } from '@/modules/grand-prize/grand-prize.service';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { STATS_CACHE_PATTERN } from '@/redis/cache-keys';

describe('GrandPrizeService', () => {
  let service: GrandPrizeService;

  const mockPrismaService = {
    gameConfig: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
    participation: {
      groupBy: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockRedisService = {
    delByPattern: jest.fn(),
  };

  const endedGameConfig = {
    id: 'gc1',
    isActive: true,
    grandPrizeDrawn: false,
    endDate: new Date(Date.now() - 86400000), // hier : le jeu est terminé
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrandPrizeService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<GrandPrizeService>(GrandPrizeService);
    jest.clearAllMocks();
  });

  describe('canDraw', () => {
    it('should refuse when there is no active game config', async () => {
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(null);

      const result = await service.canDraw();

      expect(result.canDraw).toBe(false);
      expect(result.reason).toContain('Aucune configuration');
    });

    it('should refuse when the draw was already done', async () => {
      mockPrismaService.gameConfig.findFirst.mockResolvedValue({
        ...endedGameConfig,
        grandPrizeDrawn: true,
      });

      const result = await service.canDraw();

      expect(result.canDraw).toBe(false);
      expect(result.reason).toContain('déjà été effectué');
    });

    it('should refuse while the game is still running', async () => {
      mockPrismaService.gameConfig.findFirst.mockResolvedValue({
        ...endedGameConfig,
        endDate: new Date(Date.now() + 86400000),
      });

      const result = await service.canDraw();

      expect(result.canDraw).toBe(false);
      expect(result.reason).toContain('pas encore terminé');
    });

    it('should refuse when there is no participant', async () => {
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(endedGameConfig);
      mockPrismaService.participation.groupBy.mockResolvedValue([]);

      const result = await service.canDraw();

      expect(result.canDraw).toBe(false);
      expect(result.reason).toContain('Aucun participant');
    });

    it('should allow the draw with the unique participants count', async () => {
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(endedGameConfig);
      mockPrismaService.participation.groupBy.mockResolvedValue([
        { userId: 'u1' },
        { userId: 'u2' },
      ]);

      const result = await service.canDraw();

      expect(result).toEqual({ canDraw: true, participantsCount: 2 });
    });
  });

  describe('draw', () => {
    it('should throw BadRequestException when the draw is not possible', async () => {
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(null);

      await expect(service.draw()).rejects.toThrow(BadRequestException);
    });

    it('should pick a winner, persist the draw and mask the winner email', async () => {
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(endedGameConfig);
      mockPrismaService.participation.groupBy.mockResolvedValue([{ userId: 'u1' }]);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'jean.dupont@email.fr',
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: null,
      });
      mockPrismaService.gameConfig.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.draw();

      expect(result.success).toBe(true);
      expect(result.totalParticipants).toBe(1);
      // Email masqué : ne doit jamais exposer l'adresse complète
      expect(result.winner.email).not.toBe('jean.dupont@email.fr');
      expect(result.winner.email).toContain('@email.fr');
      // Idempotence : la mise à jour cible une config non encore tirée
      expect(mockPrismaService.gameConfig.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true, grandPrizeDrawn: false },
        }),
      );
      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });

    it('should invalidate the stats cache so the back-office leaves the pre-draw state', async () => {
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(endedGameConfig);
      mockPrismaService.participation.groupBy.mockResolvedValue([{ userId: 'u1' }]);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'jean@email.fr',
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: null,
      });
      mockPrismaService.gameConfig.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.auditLog.create.mockResolvedValue({});

      await service.draw();

      expect(mockRedisService.delByPattern).toHaveBeenCalledWith(STATS_CACHE_PATTERN);
    });

    it('should throw if another draw happened concurrently (updateMany count = 0)', async () => {
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(endedGameConfig);
      mockPrismaService.participation.groupBy.mockResolvedValue([{ userId: 'u1' }]);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'jean@email.fr',
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: null,
      });
      mockPrismaService.gameConfig.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.draw()).rejects.toThrow(BadRequestException);
    });
  });

  describe('getDrawInfo', () => {
    it('should report the absence of an active game config', async () => {
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(null);

      const result = await service.getDrawInfo();

      expect(result.drawn).toBe(false);
    });

    it('should expose the canDraw status when the draw is pending', async () => {
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(endedGameConfig);
      mockPrismaService.participation.groupBy.mockResolvedValue([{ userId: 'u1' }]);

      const result = await service.getDrawInfo();

      expect(result.drawn).toBe(false);
      expect(result.canDraw).toBe(true);
      expect(result.participantsCount).toBe(1);
    });

    it('should return the masked winner once drawn', async () => {
      mockPrismaService.gameConfig.findFirst.mockResolvedValue({
        ...endedGameConfig,
        grandPrizeDrawn: true,
        grandPrizeWinnerId: 'u1',
        grandPrizeDrawnAt: new Date(),
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'jean.dupont@email.fr',
        firstName: 'Jean',
        lastName: 'Dupont',
      });
      mockPrismaService.participation.groupBy.mockResolvedValue([{ userId: 'u1' }]);

      const result = await service.getDrawInfo();

      expect(result.drawn).toBe(true);
      expect(result.winner?.lastName).toBe('D.');
      expect(result.winner?.email).not.toBe('jean.dupont@email.fr');
      expect(result.prize?.value).toBe('360€');
    });
  });

  describe('getWinner', () => {
    it('should report that no draw happened yet', async () => {
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(endedGameConfig);

      expect(await service.getWinner()).toEqual({ drawn: false });
    });

    it('should return the winner contact details unmasked', async () => {
      mockPrismaService.gameConfig.findFirst.mockResolvedValue({
        ...endedGameConfig,
        grandPrizeDrawn: true,
        grandPrizeWinnerId: 'u1',
        grandPrizeDrawnAt: new Date(),
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'jean.dupont@email.fr',
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '0600000000',
      });
      mockPrismaService.participation.groupBy.mockResolvedValue([{ userId: 'u1' }]);

      const result = await service.getWinner();

      expect(result.drawn).toBe(true);
      // Contrairement à getDrawInfo, rien n'est masqué : le back-office doit
      // pouvoir contacter le gagnant.
      expect(result.winner?.email).toBe('jean.dupont@email.fr');
      expect(result.winner?.lastName).toBe('Dupont');
      expect(result.winner?.phone).toBe('0600000000');
      expect(result.totalParticipants).toBe(1);
    });

    it('should throw when the winner account no longer exists', async () => {
      mockPrismaService.gameConfig.findFirst.mockResolvedValue({
        ...endedGameConfig,
        grandPrizeDrawn: true,
        grandPrizeWinnerId: 'u1',
        grandPrizeDrawnAt: new Date(),
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getWinner()).rejects.toThrow(NotFoundException);
    });
  });
});
