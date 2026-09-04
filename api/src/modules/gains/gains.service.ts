// ===========================================
// Service Gains
// ===========================================

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { DeliveryMethod, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';
import { RedisService } from '../../redis/redis.service';
import { STATS_CACHE_PATTERN } from '../../redis/cache-keys';

@Injectable()
export class GainsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketsService: TicketsService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Marquer un gain comme remis
   *
   * RG-24 : la remise n'est possible que jusqu'a claimEndDate.
   * RG-22 : un lot ne peut etre remis qu'une fois, y compris depuis deux
   * caisses simultanees.
   */
  async deliverPrize(participationId: string, employeeId: string, deliveryMethod: DeliveryMethod) {
    await this.assertClaimPeriodOpen();

    let updated;
    try {
      // La condition prizeDelivered: false fait partie du UPDATE, comme la
      // condition isUsed a la consommation d'un ticket. La relire d'abord ne
      // suffisait pas : deux employes servant le meme client au meme instant
      // lisaient tous deux false, et le lot partait deux fois.
      updated = await this.prisma.participation.update({
        where: { id: participationId, prizeDelivered: false },
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
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025' // aucune ligne ne correspond au filtre
      ) {
        await this.rejectUnmatchedDelivery(participationId);
      }
      throw error;
    }

    const prizesMap = await this.ticketsService.getPrizesMap();

    await this.redis.delByPattern(STATS_CACHE_PATTERN);

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
   * RG-24 : le delai de reclamation est inscrit au reglement depose chez
   * l'huissier. Une edition sans configuration active ne bloque pas la remise :
   * la contrainte est calendaire, et refuser un lot deja gagne faute de
   * parametrage penaliserait le client plutot que l'exploitant.
   */
  private async assertClaimPeriodOpen(): Promise<void> {
    const gameConfig = await this.prisma.gameConfig.findFirst({
      where: { isActive: true },
      select: { claimEndDate: true },
    });

    if (gameConfig && gameConfig.claimEndDate.getTime() < Date.now()) {
      throw new ForbiddenException('La période de réclamation pour ce lot est expirée.');
    }
  }

  /**
   * L'UPDATE conditionnel n'a touche aucune ligne. Deux causes possibles, deux
   * reponses distinctes au comptoir : la participation n'existe pas, ou le lot
   * etait deja remis. On ne le sait qu'en relisant - cout accepte, ce chemin
   * n'est emprunte qu'en erreur.
   */
  private async rejectUnmatchedDelivery(participationId: string): Promise<never> {
    const existing = await this.prisma.participation.findUnique({
      where: { id: participationId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Participation non trouvée');
    }

    throw new ConflictException('Ce lot a déjà été remis');
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
      this.ticketsService.getPrizesMap(),
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
      this.ticketsService.getPrizesMap(),
    ]);

    type DeliveryHistoryParticipation = (typeof participations)[number];

    // prizeDeliveredBy stocke un identifiant brut, sans relation Prisma : un
    // include est donc impossible. Les noms sont résolus en une seule requête
    // sur les identifiants de la page courante, soit au plus `limit` valeurs.
    const employeeIds = [
      ...new Set(
        participations
          .map((p: DeliveryHistoryParticipation) => p.prizeDeliveredBy)
          .filter((id: string | null): id is string => id !== null),
      ),
    ];

    const employees = employeeIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: employeeIds } },
          select: { id: true, firstName: true, lastName: true },
        })
      : [];

    const employeeById = new Map(employees.map((e) => [e.id, e]));

    return {
      data: participations.map((p: DeliveryHistoryParticipation) => ({
        id: p.id,
        code: p.ticket.code,
        prizeType: p.ticket.prizeType,
        prize: prizesMap[p.ticket.prizeType],
        user: p.user,
        prizeDeliveredAt: p.prizeDeliveredAt,
        deliveredBy: this.formatEmployeeName(
          p.prizeDeliveredBy ? employeeById.get(p.prizeDeliveredBy) : undefined,
        ),
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
   * Nom d'affichage de l'employé ayant remis un lot : prénom et initiale du
   * nom, comme partout ailleurs dans le projet.
   *
   * Renvoie null quand l'employé est introuvable - remise antérieure au suivi
   * de l'auteur, ou compte supprimé depuis. L'historique reste alors lisible,
   * seule la colonne est vide.
   */
  private formatEmployeeName(employee?: { firstName: string; lastName: string }): string | null {
    if (!employee) {
      return null;
    }
    return `${employee.firstName} ${employee.lastName.slice(0, 1)}.`;
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
      this.ticketsService.getPrizesMap(),
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
