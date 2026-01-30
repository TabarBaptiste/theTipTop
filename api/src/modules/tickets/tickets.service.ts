// ===========================================
// Service Tickets
// ===========================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Ticket, PrizeType } from '@prisma/client';

// Labels des gains en français
export const PRIZE_LABELS: Record<PrizeType, { name: string; description: string; value: string }> = {
  INFUSER: {
    name: 'Infuseur à thé',
    description: 'Un élégant infuseur à thé en inox',
    value: '12€',
  },
  TEA_DETOX: {
    name: 'Thé Détox / Infusion',
    description: 'Une boite de 100g de thé détox ou infusion bio',
    value: '15€',
  },
  TEA_SIGNATURE: {
    name: 'Thé Signature',
    description: 'Une boite de 100g de thé signature Thé Tip Top',
    value: '20€',
  },
  GIFT_BOX_39: {
    name: 'Coffret Découverte',
    description: 'Un coffret découverte avec une sélection de thés',
    value: '39€',
  },
  GIFT_BOX_69: {
    name: 'Coffret Découverte Premium',
    description: 'Un coffret découverte premium avec notre sélection exclusive',
    value: '69€',
  },
};

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Vérifie si un code est valide et retourne le ticket
   */
  async verifyCode(code: string): Promise<{
    isValid: boolean;
    ticket?: Ticket & { prize: typeof PRIZE_LABELS[PrizeType] };
    error?: string;
  }> {
    const normalizedCode = code.toUpperCase().trim();

    // Vérifier le format du code (10 caractères alphanumériques)
    if (!/^[A-Z0-9]{10}$/.test(normalizedCode)) {
      return {
        isValid: false,
        error: 'Le format du code est invalide. Il doit contenir 10 caractères alphanumériques.',
      };
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { code: normalizedCode },
      include: {
        participation: true,
      },
    });

    if (!ticket) {
      return {
        isValid: false,
        error: 'Ce code n\'existe pas.',
      };
    }

    if (ticket.isUsed) {
      return {
        isValid: false,
        error: 'Ce code a déjà été utilisé.',
      };
    }

    // Vérifier que le jeu est en cours
    const gameConfig = await this.prisma.gameConfig.findFirst({
      where: { isActive: true },
    });

    if (!gameConfig) {
      return {
        isValid: false,
        error: 'Le jeu-concours n\'est pas actif.',
      };
    }

    const now = new Date();
    if (now > gameConfig.claimEndDate) {
      return {
        isValid: false,
        error: 'La période de réclamation des lots est terminée.',
      };
    }

    return {
      isValid: true,
      ticket: {
        ...ticket,
        prize: PRIZE_LABELS[ticket.prizeType],
      },
    };
  }

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
    return this.prisma.ticket.findUnique({
      where: { id },
    });
  }

  /**
   * Marque un ticket comme distribué (par l'employé en caisse)
   */
  async markAsDistributed(code: string): Promise<Ticket> {
    const ticket = await this.findByCode(code);
    if (!ticket) {
      throw new NotFoundException('Ticket non trouvé');
    }

    return this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { isDistributed: true },
    });
  }

  /**
   * Récupère des codes non utilisés (pour les caisses)
   */
  async getAvailableCodes(count: number = 10): Promise<string[]> {
    if (count > 100) {
      throw new BadRequestException('Maximum 100 codes par requête');
    }

    const tickets = await this.prisma.ticket.findMany({
      where: {
        isUsed: false,
        isDistributed: false,
      },
      take: count,
      select: { code: true },
    });

    // Marquer comme distribués
    await this.prisma.ticket.updateMany({
      where: {
        code: { in: tickets.map((t) => t.code) },
      },
      data: { isDistributed: true },
    });

    return tickets.map((t) => t.code);
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

    const prizeStats = byPrize.reduce((acc, item) => {
      acc[item.prizeType] = {
        count: item._count,
        label: PRIZE_LABELS[item.prizeType].name,
      };
      return acc;
    }, {} as Record<string, { count: number; label: string }>);

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
