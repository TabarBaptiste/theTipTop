// ===========================================
// Tests unitaires - Stats Service
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ParticipationsService } from '../participations/participations.service';
import { RedisService } from '../../redis/redis.service';

describe('StatsService', () => {
  let service: StatsService;

  const mockPrismaService = {
    ticket: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    user: {
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    participation: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    gameConfig: {
      findFirst: jest.fn(),
    },
    prize: {
      findMany: jest.fn(),
    },
  };

  const mockParticipationsService = {
    countUniqueParticipants: jest.fn(),
  };

  const mockRedisService = {
    getOrSet: jest.fn((_key: string, _ttl: number, fn: () => Promise<unknown>) => fn()),
  };

  const DAY = 86400000;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ParticipationsService, useValue: mockParticipationsService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
    jest.clearAllMocks();
    mockRedisService.getOrSet.mockImplementation(
      (_key: string, _ttl: number, fn: () => Promise<unknown>) => fn(),
    );
  });

  describe('getGlobalStats', () => {
    it('should aggregate global stats for an active game', async () => {
      mockPrismaService.ticket.count
        .mockResolvedValueOnce(500000) // total
        .mockResolvedValueOnce(100) // used
        .mockResolvedValueOnce(200); // distributed
      mockPrismaService.user.count.mockResolvedValue(50);
      mockPrismaService.participation.count
        .mockResolvedValueOnce(100) // total participations
        .mockResolvedValueOnce(40); // delivered
      mockPrismaService.gameConfig.findFirst.mockResolvedValue({
        startDate: new Date(Date.now() - DAY),
        endDate: new Date(Date.now() + 10 * DAY),
        claimEndDate: new Date(Date.now() + 40 * DAY),
        grandPrizeDrawn: false,
      });
      mockParticipationsService.countUniqueParticipants.mockResolvedValue(25);

      const stats = await service.getGlobalStats();

      expect(stats.tickets.total).toBe(500000);
      expect(stats.tickets.usageRate).toBe('50.0');
      expect(stats.users.participants).toBe(25);
      expect(stats.users.conversionRate).toBe('50.0');
      expect(stats.participations.averagePerUser).toBe('4.0');
      expect(stats.prizes.pending).toBe(60);
      expect(stats.game.phase).toBe('active');
      expect(stats.game.daysRemaining).toBeGreaterThan(0);
    });

    it('should report the claim_only phase after the game end', async () => {
      mockPrismaService.ticket.count.mockResolvedValue(0);
      mockPrismaService.user.count.mockResolvedValue(0);
      mockPrismaService.participation.count.mockResolvedValue(0);
      mockPrismaService.gameConfig.findFirst.mockResolvedValue({
        startDate: new Date(Date.now() - 40 * DAY),
        endDate: new Date(Date.now() - 10 * DAY),
        claimEndDate: new Date(Date.now() + 20 * DAY),
        grandPrizeDrawn: false,
      });
      mockParticipationsService.countUniqueParticipants.mockResolvedValue(0);

      const stats = await service.getGlobalStats();

      expect(stats.game.phase).toBe('claim_only');
      expect(stats.game.claimDaysRemaining).toBeGreaterThan(0);
    });
  });

  describe('getPrizeStats', () => {
    it('should map prize counts with their labels', async () => {
      mockPrismaService.ticket.groupBy.mockResolvedValue([
        { prizeType: 'INFUSER', _count: { _all: 10 } },
      ]);
      mockPrismaService.participation.count.mockResolvedValue(4);
      mockPrismaService.prize.findMany.mockResolvedValue([
        { code: 'INFUSER', name: 'Infuseur à thé', value: null },
      ]);

      const stats = await service.getPrizeStats();

      expect(stats.byType).toEqual([
        { type: 'INFUSER', label: 'Infuseur à thé', value: null, count: 10 },
      ]);
      expect(stats.total).toBe(10);
      expect(stats.delivered).toBe(4);
    });
  });

  describe('getDemographicStats', () => {
    it('should group participants by gender and age ranges', async () => {
      mockPrismaService.user.groupBy.mockResolvedValue([
        { gender: 'MALE', _count: 3 },
        { gender: null, _count: 2 },
      ]);
      const birth = (age: number) => new Date(Date.now() - (age * 365.25 + 10) * DAY);
      mockPrismaService.user.findMany.mockResolvedValue([
        { birthDate: birth(22) },
        { birthDate: birth(30) },
        { birthDate: birth(60) },
      ]);

      const stats = await service.getDemographicStats();

      expect(stats.byGender).toEqual([
        { gender: 'MALE', count: 3 },
        { gender: 'NON_RENSEIGNE', count: 2 },
      ]);
      const byAge = Object.fromEntries(stats.byAge.map((a) => [a.range, a.count]));
      expect(byAge['18-25']).toBe(1);
      expect(byAge['26-35']).toBe(1);
      expect(byAge['56+']).toBe(1);
    });
  });

  describe('getTimelineStats', () => {
    it('should build a day-by-day timeline', async () => {
      const today = new Date();
      mockPrismaService.participation.findMany.mockResolvedValue([
        { createdAt: today },
        { createdAt: today },
      ]);

      const stats = await service.getTimelineStats(7);

      expect(stats.total).toBe(2);
      expect(stats.timeline.length).toBeGreaterThanOrEqual(7);
      const todayEntry = stats.timeline.find((t) => t.date === today.toISOString().split('T')[0]);
      expect(todayEntry?.count).toBe(2);
    });

    it('should clamp the days window to 365 (DoS protection)', async () => {
      mockPrismaService.participation.findMany.mockResolvedValue([]);

      await service.getTimelineStats(99999999);

      expect(mockRedisService.getOrSet).toHaveBeenCalledWith(
        'stats:timeline:365',
        expect.any(Number),
        expect.any(Function),
      );
    });

    it('should fall back to 30 days for invalid values', async () => {
      mockPrismaService.participation.findMany.mockResolvedValue([]);

      await service.getTimelineStats(NaN);

      expect(mockRedisService.getOrSet).toHaveBeenCalledWith(
        'stats:timeline:30',
        expect.any(Number),
        expect.any(Function),
      );
    });
  });

  describe('getEmailingData', () => {
    it('should filter by consent and participation', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([
        {
          id: 'u1',
          email: 'jean@email.fr',
          firstName: 'Jean',
          lastName: 'Dupont',
          consentEmail: true,
          _count: { participations: 2 },
        },
      ]);

      const data = await service.getEmailingData({ consentEmail: true, hasParticipated: true });

      expect(data.count).toBe(1);
      expect(data.users[0]).toEqual({
        email: 'jean@email.fr',
        firstName: 'Jean',
        lastName: 'Dupont',
        participationsCount: 2,
      });
      const where = mockPrismaService.user.findMany.mock.calls[0][0].where;
      expect(where.consentEmail).toBe(true);
      expect(where.participations).toEqual({ some: {} });
    });
  });
});
