// ===========================================
// Tests unitaires - Participations Service
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { ParticipationsService } from './participations.service';
import { TicketsService } from '../tickets/tickets.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { BadRequestException } from '@nestjs/common';

describe('ParticipationsService', () => {
  let service: ParticipationsService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    ticket: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    participation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    gameConfig: {
      findFirst: jest.fn(),
    },
  };

  const mockTicketsService = {
    verifyCode: jest.fn(),
    getPrizesMap: jest.fn(),
  };

  const mockRedisService = {
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn(),
    del: jest.fn(),
    delByPattern: jest.fn(),
    getOrSet: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TicketsService, useValue: mockTicketsService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<ParticipationsService>(ParticipationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('participate', () => {
    const userId = 'user-1';
    const validCode = 'ABC123DEF4';

    const mockGameConfig = {
      id: '1',
      startDate: new Date(Date.now() - 86400000), // hier
      endDate: new Date(Date.now() + 86400000), // demain
      claimEndDate: new Date(Date.now() + 2592000000), // dans 30 jours
    };

    const mockTicket = {
      id: 'ticket-1',
      code: validCode,
      prizeType: 'INFUSER',
      isUsed: false,
    };

    it('should create participation for valid code', async () => {
      mockTicketsService.verifyCode.mockResolvedValue({ isValid: true, ticket: mockTicket });
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(mockGameConfig);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          ticket: {
            findUnique: jest.fn().mockResolvedValue(mockTicket),
            update: jest.fn().mockResolvedValue({ ...mockTicket, isUsed: true }),
          },
          participation: {
            create: jest.fn().mockResolvedValue({
              id: 'participation-1',
              userId,
              ticketId: mockTicket.id,
              ticket: mockTicket,
            }),
          },
        });
      });

      const result = await service.participate(userId, validCode);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('code', validCode);
    });

    it('should throw NotFoundException for invalid code', async () => {
      mockTicketsService.verifyCode.mockResolvedValue({ isValid: false, error: 'Invalid' });
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(mockGameConfig);

      await expect(service.participate(userId, 'INVALID123')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for already used code', async () => {
      mockTicketsService.verifyCode.mockResolvedValue({
        isValid: false,
        error: 'Ce code a déjà été utilisé',
      });
      mockPrismaService.gameConfig.findFirst.mockResolvedValue(mockGameConfig);

      await expect(service.participate(userId, validCode)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if game has not started', async () => {
      mockTicketsService.verifyCode.mockResolvedValue({
        isValid: false,
        error: "Le jeu n'a pas commencé",
      });
      mockPrismaService.gameConfig.findFirst.mockResolvedValue({
        ...mockGameConfig,
        startDate: new Date(Date.now() + 86400000), // demain
      });

      await expect(service.participate(userId, validCode)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if game has ended', async () => {
      mockTicketsService.verifyCode.mockResolvedValue({
        isValid: false,
        error: 'Le jeu est terminé',
      });
      mockPrismaService.gameConfig.findFirst.mockResolvedValue({
        ...mockGameConfig,
        endDate: new Date(Date.now() - 86400000), // hier
      });

      await expect(service.participate(userId, validCode)).rejects.toThrow(BadRequestException);
    });

    it('should throw 429 when the hourly submit rate limit is exceeded', async () => {
      mockRedisService.incr.mockResolvedValueOnce(11);

      await expect(service.participate(userId, validCode)).rejects.toThrow(
        'Trop de tentatives, veuillez réessayer plus tard.',
      );
      expect(mockTicketsService.verifyCode).not.toHaveBeenCalled();
    });

    it('should set the TTL on the first rate-limit increment', async () => {
      mockRedisService.incr.mockResolvedValueOnce(1);
      mockTicketsService.verifyCode.mockResolvedValue({ isValid: false, error: 'Invalid' });

      await expect(service.participate(userId, validCode)).rejects.toThrow(BadRequestException);

      expect(mockRedisService.expire).toHaveBeenCalledWith(expect.any(String), 3600);
    });
  });

  describe('findByUser', () => {
    it('should map participations to the flat API shape', async () => {
      mockPrismaService.participation.findMany.mockResolvedValue([
        {
          id: 'p1',
          createdAt: new Date('2026-06-01'),
          prizeDelivered: false,
          prizeDeliveredAt: null,
          deliveryMethod: null,
          ticket: { code: 'ABCDEFGH23', prizeType: 'INFUSER' },
        },
      ]);
      mockTicketsService.getPrizesMap = jest.fn().mockResolvedValue({
        INFUSER: { name: 'Infuseur à thé', description: 'Un infuseur', value: null },
      });

      const result = await service.findByUser('user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'p1',
        code: 'ABCDEFGH23',
        prizeType: 'INFUSER',
        prizeDelivered: false,
      });
      expect(result[0].prize.name).toBe('Infuseur à thé');
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException for an unknown participation', async () => {
      mockPrismaService.participation.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.findById('inconnu')).rejects.toThrow('Participation non trouvée');
    });

    it('should enrich the participation with the prize metadata', async () => {
      mockPrismaService.participation.findUnique = jest.fn().mockResolvedValue({
        id: 'p1',
        ticket: { code: 'ABCDEFGH23', prizeType: 'INFUSER' },
        user: { id: 'u1', email: 'c@t.fr', firstName: 'C', lastName: 'T' },
      });
      mockTicketsService.getPrizesMap = jest.fn().mockResolvedValue({
        INFUSER: { name: 'Infuseur à thé', description: 'Un infuseur', value: null },
      });

      const result = await service.findById('p1');

      expect(result.prize.name).toBe('Infuseur à thé');
    });
  });

  describe('findByCode', () => {
    beforeEach(() => {
      mockTicketsService.getPrizesMap = jest.fn().mockResolvedValue({
        INFUSER: { name: 'Infuseur à thé', description: 'Un infuseur', value: null },
      });
    });

    it('should throw NotFoundException for an unknown ticket', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(service.findByCode('ABCDEFGH23')).rejects.toThrow('Ticket non trouvé');
    });

    it('should return the ticket without participation when unused', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        code: 'ABCDEFGH23',
        prizeType: 'INFUSER',
        isUsed: false,
        participation: null,
      });

      const result = await service.findByCode('abcdefgh23');

      expect(result.participation).toBeNull();
      expect(result.ticket.prize.name).toBe('Infuseur à thé');
    });

    it('should return the ticket with its participation when used', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        code: 'ABCDEFGH23',
        prizeType: 'INFUSER',
        isUsed: true,
        participation: {
          id: 'p1',
          createdAt: new Date(),
          prizeDelivered: true,
          prizeDeliveredAt: new Date(),
          deliveryMethod: 'IN_STORE',
          user: { id: 'u1', email: 'c@t.fr', firstName: 'C', lastName: 'T' },
        },
      });

      const result = await service.findByCode('ABCDEFGH23');

      expect(result.participation?.id).toBe('p1');
      expect(result.participation?.prizeDelivered).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should paginate and filter by prizeDelivered', async () => {
      mockPrismaService.participation.findMany.mockResolvedValue([]);
      mockPrismaService.participation.count.mockResolvedValue(0);
      mockTicketsService.getPrizesMap = jest.fn().mockResolvedValue({});

      await service.findAll({ page: 2, limit: 10, prizeDelivered: false });

      expect(mockPrismaService.participation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
          where: { prizeDelivered: false },
        }),
      );
    });
  });

  describe('countUniqueParticipants', () => {
    it('should count distinct user ids', async () => {
      mockPrismaService.participation.groupBy = jest
        .fn()
        .mockResolvedValue([{ userId: 'u1' }, { userId: 'u2' }]);

      expect(await service.countUniqueParticipants()).toBe(2);
    });
  });
});
