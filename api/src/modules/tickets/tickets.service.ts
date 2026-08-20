// ===========================================
// Service Tickets
// ===========================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { PRIZES_MAP_CACHE_KEY, PRIZES_MAP_TTL, STATS_CACHE_PATTERN } from '../../redis/cache-keys';
import { Ticket, Prize } from '@prisma/client';

/** Shape réduite retournée dans les réponses API */
export type PrizeLabel = { name: string; description: string; value: string | null };

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ===========================================
  // LOTS (source de vérité en DB)
  // ===========================================

  /**
   * Retourne tous les lots triés par displayOrder
   */
  async findAllPrizes(): Promise<Prize[]> {
    return this.prisma.prize.findMany({ orderBy: { displayOrder: 'asc' } });
  }

  /**
   * Retourne une map PrizeType → { name, description, value } pour les réponses API
   */
  async getPrizesMap(): Promise<Record<string, PrizeLabel>> {
    return this.redis.getOrSet(PRIZES_MAP_CACHE_KEY, PRIZES_MAP_TTL, async () => {
      const prizes = await this.findAllPrizes();
      return prizes.reduce(
        (acc, p) => {
          acc[p.code] = { name: p.name, description: p.description, value: p.value };
          return acc;
        },
        {} as Record<string, PrizeLabel>,
      );
    });
  }

  // ===========================================
  // VÉRIFICATION DE CODE
  // ===========================================

  /**
   * Vérifie si un code est valide et retourne le ticket enrichi avec les métadonnées du lot
   */
  async verifyCode(code: string): Promise<{
    isValid: boolean;
    ticket?: Ticket & { prize: PrizeLabel };
    error?: string;
  }> {
    const normalizedCode = code.toUpperCase().trim();

    if (!/^[A-Z0-9]{10}$/.test(normalizedCode)) {
      return {
        isValid: false,
        error: 'Le format du code est invalide. Il doit contenir 10 caractères alphanumériques.',
      };
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { code: normalizedCode },
      include: { participation: true },
    });

    if (!ticket) {
      return { isValid: false, error: "Ce code n'existe pas." };
    }

    if (ticket.isUsed) {
      return { isValid: false, error: 'Ce code a déjà été utilisé.' };
    }

    const gameConfig = await this.prisma.gameConfig.findFirst({ where: { isActive: true } });

    if (!gameConfig) {
      return { isValid: false, error: "Le jeu-concours n'est pas actif." };
    }

    // La fenêtre de participation est celle du règlement : de l'ouverture à la
    // clôture du jeu. Le délai de réclamation, plus tardif, ne borne que le
    // retrait des lots déjà gagnés. Les confondre revenait à laisser jouer un
    // code un mois après la fin du concours — et, avant, à laisser jouer avant
    // même son ouverture, aucune des deux bornes n'étant contrôlée ici.
    const now = new Date();

    if (now < gameConfig.startDate) {
      return { isValid: false, error: "Le jeu-concours n'a pas encore commencé." };
    }

    if (now > gameConfig.endDate) {
      return { isValid: false, error: 'Le jeu-concours est terminé.' };
    }

    const prizesMap = await this.getPrizesMap();
    const prizeLabel = prizesMap[ticket.prizeType];

    if (!prizeLabel) {
      throw new NotFoundException(
        `Lot introuvable pour le type : ${ticket.prizeType}. Vérifiez que la base est correctement seedée.`,
      );
    }

    return {
      isValid: true,
      ticket: {
        ...ticket,
        prize: prizeLabel,
      },
    };
  }

  // ===========================================
  // CRUD TICKETS
  // ===========================================

  /**
   * Récupère un ticket par son code
   */
  async findByCode(code: string): Promise<Ticket | null> {
    return this.prisma.ticket.findUnique({
      where: { code: code.toUpperCase().trim() },
    });
  }

  /**
   * Récupère un ticket par son ID
   */
  async findById(id: string): Promise<Ticket | null> {
    return this.prisma.ticket.findUnique({ where: { id } });
  }

  /**
   * Marque un ticket comme distribué (par l'employé en caisse)
   */
  async markAsDistributed(code: string): Promise<Ticket> {
    const ticket = await this.findByCode(code);
    if (!ticket) {
      throw new NotFoundException('Ticket non trouvé');
    }
    const updated = await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { isDistributed: true },
    });
    await this.redis.delByPattern(STATS_CACHE_PATTERN);
    return updated;
  }

  /**
   * Récupère des codes non utilisés (pour les caisses)
   */
  async getAvailableCodes(count: number = 10): Promise<string[]> {
    if (count > 100) {
      throw new BadRequestException('Maximum 100 codes par requête');
    }

    const tickets = await this.prisma.ticket.findMany({
      where: { isUsed: false, isDistributed: false },
      take: count,
      select: { code: true },
    });

    type AvailableTicket = (typeof tickets)[number];

    await this.prisma.ticket.updateMany({
      where: { code: { in: tickets.map((t: AvailableTicket) => t.code) } },
      data: { isDistributed: true },
    });

    if (tickets.length > 0) {
      await this.redis.delByPattern(STATS_CACHE_PATTERN);
    }

    return tickets.map((t: AvailableTicket) => t.code);
  }

  /**
   * Statistiques des tickets
   */
  async getStats() {
    const [total, used, distributed, byPrize] = await Promise.all([
      this.prisma.ticket.count(),
      this.prisma.ticket.count({ where: { isUsed: true } }),
      this.prisma.ticket.count({ where: { isDistributed: true } }),
      this.prisma.ticket.groupBy({
        by: ['prizeType'],
        _count: true,
        where: { isUsed: true },
      }),
    ]);

    const prizesMap = await this.getPrizesMap();

    type PrizeGroup = (typeof byPrize)[number];

    const prizeStats = byPrize.reduce(
      (acc: Record<string, { count: number; label: string }>, item: PrizeGroup) => {
        acc[item.prizeType] = {
          count: item._count,
          label: (prizesMap[item.prizeType] ?? { name: item.prizeType }).name,
        };
        return acc;
      },
      {} as Record<string, { count: number; label: string }>,
    );

    return {
      total,
      used,
      distributed,
      available: total - distributed,
      remainingToUse: distributed - used,
      prizeDistribution: prizeStats,
    };
  }
}
