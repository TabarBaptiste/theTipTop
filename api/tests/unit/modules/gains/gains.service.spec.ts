// ===========================================
// Tests unitaires - Gains Service
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { GainsService } from '@/modules/gains/gains.service';
import { PrismaService } from '@/prisma/prisma.service';
import { TicketsService } from '@/modules/tickets/tickets.service';
import { RedisService } from '@/redis/redis.service';

describe('GainsService', () => {
  let service: GainsService;

  const mockPrismaService = {
    participation: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    ticket: {
      findUnique: jest.fn(),
      groupBy: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  };

  const mockTicketsService = {
    getPrizesMap: jest.fn().mockResolvedValue({
      INFUSER: { name: 'Infuseur à thé', description: 'Un infuseur', value: null },
    }),
  };

  const mockRedisService = {
    delByPattern: jest.fn(),
  };

  const user = { id: 'u1', email: 'c@t.fr', firstName: 'C', lastName: 'T' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GainsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TicketsService, useValue: mockTicketsService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<GainsService>(GainsService);
    jest.clearAllMocks();
    mockTicketsService.getPrizesMap.mockResolvedValue({
      INFUSER: { name: 'Infuseur à thé', description: 'Un infuseur', value: null },
    });
  });

  describe('deliverPrize', () => {
    it('should throw NotFoundException when participation does not exist', async () => {
      mockPrismaService.participation.findUnique.mockResolvedValue(null);

      await expect(service.deliverPrize('p1', 'emp1', 'IN_STORE')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when the prize was already delivered', async () => {
      mockPrismaService.participation.findUnique.mockResolvedValue({
        id: 'p1',
        prizeDelivered: true,
      });

      await expect(service.deliverPrize('p1', 'emp1', 'IN_STORE')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should mark the prize as delivered and return the enriched payload', async () => {
      mockPrismaService.participation.findUnique.mockResolvedValue({
        id: 'p1',
        prizeDelivered: false,
      });
      mockPrismaService.participation.update.mockResolvedValue({
        id: 'p1',
        prizeDelivered: true,
        prizeDeliveredAt: new Date(),
        deliveryMethod: 'IN_STORE',
        ticket: { code: 'ABCDEFGH23', prizeType: 'INFUSER' },
        user,
      });

      const result = await service.deliverPrize('p1', 'emp1', 'IN_STORE');

      expect(result.prizeDelivered).toBe(true);
      expect(result.prize.name).toBe('Infuseur à thé');
      expect(mockRedisService.delByPattern).toHaveBeenCalledWith('stats:*');
      expect(mockPrismaService.participation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p1' },
          data: expect.objectContaining({
            prizeDelivered: true,
            prizeDeliveredBy: 'emp1',
            deliveryMethod: 'IN_STORE',
          }),
        }),
      );
    });
  });

  describe('deliverPrizeByCode', () => {
    it('should throw NotFoundException for an unknown ticket', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(service.deliverPrizeByCode('ABCDEFGH23', 'emp1', 'IN_STORE')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when the code has not been used yet', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 't1',
        participation: null,
      });

      await expect(service.deliverPrizeByCode('ABCDEFGH23', 'emp1', 'IN_STORE')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should delegate to deliverPrize with the participation id', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 't1',
        participation: { id: 'p1' },
      });
      mockPrismaService.participation.findUnique.mockResolvedValue({
        id: 'p1',
        prizeDelivered: false,
      });
      mockPrismaService.participation.update.mockResolvedValue({
        id: 'p1',
        prizeDelivered: true,
        prizeDeliveredAt: new Date(),
        deliveryMethod: 'IN_STORE',
        ticket: { code: 'ABCDEFGH23', prizeType: 'INFUSER' },
        user,
      });

      const result = await service.deliverPrizeByCode('abcdefgh23', 'emp1', 'IN_STORE');

      expect(result.id).toBe('p1');
    });
  });

  describe('getPendingDeliveries', () => {
    it('should return pending deliveries with pagination meta', async () => {
      mockPrismaService.participation.findMany.mockResolvedValue([
        {
          id: 'p1',
          createdAt: new Date(),
          ticket: { code: 'ABCDEFGH23', prizeType: 'INFUSER' },
          user,
        },
      ]);
      mockPrismaService.participation.count.mockResolvedValue(41);

      const result = await service.getPendingDeliveries({ page: 2, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].prize.name).toBe('Infuseur à thé');
      expect(result.meta).toEqual({ total: 41, page: 2, limit: 20, totalPages: 3 });
      expect(mockPrismaService.participation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 20 }),
      );
    });
  });

  describe('getDeliveryHistory', () => {
    it('should filter by employee when employeeId is provided', async () => {
      mockPrismaService.participation.findMany.mockResolvedValue([]);
      mockPrismaService.participation.count.mockResolvedValue(0);

      await service.getDeliveryHistory({ employeeId: 'emp1' });

      expect(mockPrismaService.participation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { prizeDelivered: true, prizeDeliveredBy: 'emp1' },
        }),
      );
    });

    it('should resolve the delivering employee name in a single query', async () => {
      const deliveredRow = {
        prizeDeliveredAt: new Date(),
        prizeDeliveredBy: 'emp1',
        deliveryMethod: 'IN_STORE',
        ticket: { code: 'ABCDEFGH23', prizeType: 'INFUSER' },
        user,
      };
      mockPrismaService.participation.findMany.mockResolvedValue([
        { id: 'p1', ...deliveredRow },
        { id: 'p2', ...deliveredRow },
      ]);
      mockPrismaService.participation.count.mockResolvedValue(2);
      mockPrismaService.user.findMany.mockResolvedValue([
        { id: 'emp1', firstName: 'Marie', lastName: 'Dupont' },
      ]);

      const result = await service.getDeliveryHistory({});

      expect(result.data[0].deliveredBy).toBe('Marie D.');
      // Deux remises par le même employé ne doivent produire qu'un identifiant
      // à résoudre : c'est tout l'intérêt de dédoublonner avant la requête.
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: { in: ['emp1'] } } }),
      );
    });

    it('should leave deliveredBy null and skip the lookup when no employee is recorded', async () => {
      mockPrismaService.participation.findMany.mockResolvedValue([
        {
          id: 'p1',
          prizeDeliveredAt: new Date(),
          prizeDeliveredBy: null,
          deliveryMethod: 'IN_STORE',
          ticket: { code: 'ABCDEFGH23', prizeType: 'INFUSER' },
          user,
        },
      ]);
      mockPrismaService.participation.count.mockResolvedValue(1);

      const result = await service.getDeliveryHistory({});

      expect(result.data[0].deliveredBy).toBeNull();
      expect(mockPrismaService.user.findMany).not.toHaveBeenCalled();
    });
  });

  describe('getDeliveryStats', () => {
    it('should aggregate delivery statistics', async () => {
      mockPrismaService.participation.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(4) // delivered
        .mockResolvedValueOnce(6); // pending
      mockPrismaService.participation.groupBy.mockResolvedValue([
        { deliveryMethod: 'IN_STORE', _count: 3 },
        { deliveryMethod: null, _count: 1 },
      ]);
      mockPrismaService.ticket.groupBy.mockResolvedValue([{ prizeType: 'INFUSER', _count: 4 }]);

      const stats = await service.getDeliveryStats();

      expect(stats.total).toBe(10);
      expect(stats.deliveryRate).toBe('40.0');
      expect(stats.byMethod).toEqual({ IN_STORE: 3 });
      expect(stats.byPrize.INFUSER).toEqual({ count: 4, label: 'Infuseur à thé' });
    });

    it('should return a 0 delivery rate when there is no participation', async () => {
      mockPrismaService.participation.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      mockPrismaService.participation.groupBy.mockResolvedValue([]);
      mockPrismaService.ticket.groupBy.mockResolvedValue([]);

      const stats = await service.getDeliveryStats();

      expect(stats.deliveryRate).toBe(0);
    });
  });
});
