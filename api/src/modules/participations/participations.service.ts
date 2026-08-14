// ===========================================
// Service Participations
// ===========================================

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma, TicketStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';
import { RedisService } from '../../redis/redis.service';
import { PRIZES_MAP_CACHE_KEY, STATS_CACHE_PATTERN } from '../../redis/cache-keys';

type ParticipationWithTicket = Prisma.ParticipationGetPayload<{ include: { ticket: true } }>;

type ParticipationWithTicketAndUser = Prisma.ParticipationGetPayload<{
  include: {
    ticket: true;
    user: {
      select: {
        id: true;
        email: true;
        firstName: true;
        lastName: true;
      };
    };
  };
}>;

@Injectable()
export class ParticipationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketsService: TicketsService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Créer une participation (utiliser un code)
   */
  async participate(userId: string, code: string) {
    await this.checkSubmitRateLimit(userId);

    const normalizedCode = code.toUpperCase().trim();

    const verification = await this.ticketsService.verifyCode(normalizedCode);
    if (!verification.isValid || !verification.ticket) {
      throw new BadRequestException(verification.error || 'Code invalide');
    }

    // ticket.prize est déjà enrichi par verifyCode() - pas besoin de recharger la map
    const ticket = verification.ticket;

    const participation = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const ticketCheck = await tx.ticket.findUnique({
        where: { code: normalizedCode },
        include: { participation: true },
      });

      if (!ticketCheck) {
        throw new NotFoundException('Ticket non trouvé');
      }

      // RG-18 : un ticket réservé par un lead en cours de vérification doit
      // renvoyer un message distinct de « déjà utilisé ».
      if (ticketCheck.status === TicketStatus.EN_ATTENTE) {
        throw new ConflictException(
          'Ce code est en cours de validation par un autre participant',
        );
      }

      if (ticketCheck.status === TicketStatus.UTILISE || ticketCheck.participation) {
        throw new ConflictException('Ce code a déjà été utilisé');
      }

      await tx.ticket.update({
        where: { id: ticketCheck.id },
        data: {
          status: TicketStatus.UTILISE,
          usedAt: new Date(),
        },
      });

      return tx.participation.create({
        data: {
          userId,
          ticketId: ticketCheck.id,
        },
        include: {
          ticket: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    });

    await this.invalidateCachesAfterParticipation();

    return {
      id: participation.id,
      code: normalizedCode,
      prizeType: ticket.prizeType,
      prize: ticket.prize,
      participatedAt: participation.createdAt,
      prizeDelivered: participation.prizeDelivered,
    };
  }

  /**
   * Limite les soumissions de code à 10 par heure et par utilisateur (anti brute-force).
   * Si Redis est indisponible, INCR retourne 0 et la limite n'est pas appliquée.
   */
  private async checkSubmitRateLimit(userId: string): Promise<void> {
    const hour = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
    const key = `ratelimit:${userId}:submit:${hour}`;

    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, 3600);
    }

    if (count > 10) {
      throw new HttpException(
        'Trop de tentatives, veuillez réessayer plus tard.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /**
   * Invalide les caches impactés par une nouvelle participation
   * (les compteurs de stats changent, et la map des lots est revérifiée par précaution).
   */
  private async invalidateCachesAfterParticipation(): Promise<void> {
    await Promise.all([
      this.redis.delByPattern(STATS_CACHE_PATTERN),
      this.redis.del(PRIZES_MAP_CACHE_KEY),
    ]);
  }

  /**
   * Récupère les participations d'un utilisateur
   */
  async findByUser(userId: string) {
    const [participations, prizesMap] = await Promise.all([
      this.prisma.participation.findMany({
        where: { userId },
        include: { ticket: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.ticketsService.getPrizesMap(),
    ]);

    return participations.map((p: ParticipationWithTicket) => ({
      id: p.id,
      code: p.ticket.code,
      prizeType: p.ticket.prizeType,
      prize: prizesMap[p.ticket.prizeType],
      participatedAt: p.createdAt,
      prizeDelivered: p.prizeDelivered,
      prizeDeliveredAt: p.prizeDeliveredAt,
      deliveryMethod: p.deliveryMethod,
    }));
  }

  /**
   * Récupère une participation par ID
   */
  async findById(id: string) {
    const participation = await this.prisma.participation.findUnique({
      where: { id },
      include: {
        ticket: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!participation) {
      throw new NotFoundException('Participation non trouvée');
    }

    const prizesMap = await this.ticketsService.getPrizesMap();

    return {
      ...participation,
      prize: prizesMap[participation.ticket.prizeType],
    };
  }

  /**
   * Recherche une participation par code ticket
   */
  async findByCode(code: string) {
    const normalizedCode = code.toUpperCase().trim();

    const ticket = await this.prisma.ticket.findUnique({
      where: { code: normalizedCode },
      include: {
        participation: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket non trouvé');
    }

    const prizesMap = await this.ticketsService.getPrizesMap();

    if (!ticket.participation) {
      return {
        ticket: {
          code: ticket.code,
          prizeType: ticket.prizeType,
          prize: prizesMap[ticket.prizeType],
          isUsed: ticket.status === TicketStatus.UTILISE,
        },
        participation: null,
      };
    }

    return {
      ticket: {
        code: ticket.code,
        prizeType: ticket.prizeType,
        prize: prizesMap[ticket.prizeType],
        isUsed: ticket.status === TicketStatus.UTILISE,
      },
      participation: {
        id: ticket.participation.id,
        user: ticket.participation.user,
        participatedAt: ticket.participation.createdAt,
        prizeDelivered: ticket.participation.prizeDelivered,
        prizeDeliveredAt: ticket.participation.prizeDeliveredAt,
        deliveryMethod: ticket.participation.deliveryMethod,
      },
    };
  }

  /**
   * Liste toutes les participations (admin)
   */
  async findAll(options: { page?: number; limit?: number; prizeDelivered?: boolean }) {
    const { page = 1, limit = 20, prizeDelivered } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ParticipationWhereInput = {};
    if (prizeDelivered !== undefined) {
      where.prizeDelivered = prizeDelivered;
    }

    const [participations, total] = await Promise.all([
      this.prisma.participation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          ticket: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.participation.count({ where }),
    ]);

    const prizesMap = await this.ticketsService.getPrizesMap();

    return {
      data: participations.map((p: ParticipationWithTicketAndUser) => ({
        id: p.id,
        code: p.ticket.code,
        prizeType: p.ticket.prizeType,
        prize: prizesMap[p.ticket.prizeType],
        user: p.user,
        participatedAt: p.createdAt,
        prizeDelivered: p.prizeDelivered,
        prizeDeliveredAt: p.prizeDeliveredAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Compte le nombre de participants uniques
   */
  async countUniqueParticipants(): Promise<number> {
    const result = await this.prisma.participation.groupBy({
      by: ['userId'],
    });
    return result.length;
  }
}
