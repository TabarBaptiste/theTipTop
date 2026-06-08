// ===========================================
// Service Gains
// ===========================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DeliveryMethod } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type PrizeLabel = { name: string; description: string; value: string | null };

@Injectable()
export class GainsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Charge les métadonnées des lots depuis la DB et retourne une map code → label
   */
  private async loadPrizesMap(): Promise<Record<string, PrizeLabel>> {
    const prizes = await this.prisma.prize.findMany();
    return prizes.reduce(
      (acc, p) => {
        acc[p.code] = { name: p.name, description: p.description, value: p.value };
        return acc;
      },
      {} as Record<string, PrizeLabel>,
    );
  }

  /**
   * Marquer un gain comme remis
   */
  async deliverPrize(participationId: string, employeeId: string, deliveryMethod: DeliveryMethod) {
    const participation = await this.prisma.participation.findUnique({
      where: { id: participationId },
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

    if (participation.prizeDelivered) {
      throw new BadRequestException('Ce lot a déjà été remis');
    }

    const [updated, prizesMap] = await Promise.all([
      this.prisma.participation.update({
        where: { id: participationId },
        data: {
          prizeDelivered: true,
          prizeDeliveredAt: new Date(),
          prizeDeliveredBy: employeeId,
          deliveryMethod,
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
      }),
      this.loadPrizesMap(),
    ]);

    return {
      id: updated.id,
      code: updated.ticket.code,
      prizeType: updated.ticket.prizeType,
      prize: prizesMap[updated.ticket.prizeType],
      user: updated.user,
      prizeDelivered: updated.prizeDelivered,
      prizeDeliveredAt: updated.prizeDeliveredAt,
      deliveryMethod: updated.deliveryMethod,
    };
  }

  /**
   * Marquer un gain comme remis par code
   */
  async deliverPrizeByCode(code: string, employeeId: string, deliveryMethod: DeliveryMethod) {
    const normalizedCode = code.toUpperCase().trim();

    const ticket = await this.prisma.ticket.findUnique({
      where: { code: normalizedCode },
      include: { participation: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket non trouvé');
    }

    if (!ticket.participation) {
      throw new BadRequestException("Ce code n'a pas encore été utilisé par un client");
    }

    return this.deliverPrize(ticket.participation.id, employeeId, deliveryMethod);
  }

  /**
   * Gains en attente de remise
   */
  async getPendingDeliveries(options: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [[participations, total], prizesMap] = await Promise.all([
      Promise.all([
        this.prisma.participation.findMany({
          where: { prizeDelivered: false },
          skip,
          take: limit,
          orderBy: { createdAt: 'asc' },
          include: {
            ticket: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        }),
        this.prisma.participation.count({ where: { prizeDelivered: false } }),
      ]),
      this.loadPrizesMap(),
    ]);

    type PendingParticipation = (typeof participations)[number];

    return {
      data: participations.map((p: PendingParticipation) => ({
        id: p.id,
        code: p.ticket.code,
        prizeType: p.ticket.prizeType,
        prize: prizesMap[p.ticket.prizeType],
        user: p.user,
        participatedAt: p.createdAt,
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
   * Historique des remises
   */
  async getDeliveryHistory(options: { page?: number; limit?: number; employeeId?: string }) {
    const { page = 1, limit = 20, employeeId } = options;
    const skip = (page - 1) * limit;

    const where: any = { prizeDelivered: true };
    if (employeeId) {
      where.prizeDeliveredBy = employeeId;
    }

    const [[participations, total], prizesMap] = await Promise.all([
      Promise.all([
        this.prisma.participation.findMany({
          where,
          skip,
          take: limit,
          orderBy: { prizeDeliveredAt: 'desc' },
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
      ]),
      this.loadPrizesMap(),
    ]);

    type DeliveryHistoryParticipation = (typeof participations)[number];

    return {
      data: participations.map((p: DeliveryHistoryParticipation) => ({
        id: p.id,
        code: p.ticket.code,
        prizeType: p.ticket.prizeType,
        prize: prizesMap[p.ticket.prizeType],
        user: p.user,
        prizeDeliveredAt: p.prizeDeliveredAt,
        prizeDeliveredBy: p.prizeDeliveredBy,
        deliveryMethod: p.deliveryMethod,
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
   * Statistiques des remises
   */
  async getDeliveryStats() {
    const [total, delivered, pending, byMethod, byPrize, prizesMap] = await Promise.all([
      this.prisma.participation.count(),
      this.prisma.participation.count({ where: { prizeDelivered: true } }),
      this.prisma.participation.count({ where: { prizeDelivered: false } }),
      this.prisma.participation.groupBy({
        by: ['deliveryMethod'],
        _count: true,
        where: { prizeDelivered: true },
      }),
      this.prisma.ticket.groupBy({
        by: ['prizeType'],
        _count: true,
        where: { participation: { prizeDelivered: true } },
      }),
      this.loadPrizesMap(),
    ]);

    type DeliveryMethodGroup = (typeof byMethod)[number];
    type PrizeGroup = (typeof byPrize)[number];

    return {
      total,
      delivered,
      pending,
      deliveryRate: total > 0 ? ((delivered / total) * 100).toFixed(1) : 0,
      byMethod: byMethod.reduce(
        (acc: Record<string, number>, item: DeliveryMethodGroup) => {
          if (item.deliveryMethod) {
            acc[item.deliveryMethod] = item._count;
          }
          return acc;
        },
        {} as Record<string, number>,
      ),
      byPrize: byPrize.reduce(
        (acc: Record<string, { count: number; label: string }>, item: PrizeGroup) => {
          acc[item.prizeType] = {
            count: item._count,
            label: (prizesMap[item.prizeType] ?? { name: item.prizeType }).name,
          };
          return acc;
        },
        {} as Record<string, { count: number; label: string }>,
      ),
    };
  }
}
