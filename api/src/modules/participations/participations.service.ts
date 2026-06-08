// ===========================================
// Service Participations
// ===========================================

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';

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
  ) {}

  /**
   * Créer une participation (utiliser un code)
   */
  async participate(userId: string, code: string) {
    const normalizedCode = code.toUpperCase().trim();

    const verification = await this.ticketsService.verifyCode(normalizedCode);
    if (!verification.isValid || !verification.ticket) {
      throw new BadRequestException(verification.error || 'Code invalide');
    }

    // ticket.prize est déjà enrichi par verifyCode() — pas besoin de recharger la map
    const ticket = verification.ticket;

    const participation = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const ticketCheck = await tx.ticket.findUnique({
        where: { code: normalizedCode },
        include: { participation: true },
      });

      if (!ticketCheck) {
        throw new NotFoundException('Ticket non trouvé');
      }

      if (ticketCheck.isUsed || ticketCheck.participation) {
        throw new ConflictException('Ce code a déjà été utilisé');
      }

      await tx.ticket.update({
        where: { id: ticketCheck.id },
        data: {
          isUsed: true,
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
          isUsed: ticket.isUsed,
        },
        participation: null,
      };
    }

    return {
      ticket: {
        code: ticket.code,
        prizeType: ticket.prizeType,
        prize: prizesMap[ticket.prizeType],
        isUsed: ticket.isUsed,
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
