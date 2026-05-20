// ===========================================
// Tests unitaires - Participations Service
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { ParticipationsService } from './participations.service';
import { TicketsService } from '../tickets/tickets.service';
import { PrismaService } from '../../prisma/prisma.service';
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
      count: jest.fn(),
    },
    gameConfig: {
      findFirst: jest.fn(),
    },
  };

  const mockTicketsService = {
    verifyCode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TicketsService, useValue: mockTicketsService },
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
  });
});
