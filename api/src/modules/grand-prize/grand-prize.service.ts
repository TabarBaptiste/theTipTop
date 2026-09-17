// ===========================================
// Service Grand Prize (Tirage au sort)
// ===========================================

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { STATS_CACHE_PATTERN } from '../../redis/cache-keys';
import { randomInt } from 'node:crypto';

@Injectable()
export class GrandPrizeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Vérifie si le tirage au sort peut être effectué
   */
  async canDraw(): Promise<{
    canDraw: boolean;
    reason?: string;
    participantsCount?: number;
  }> {
    const gameConfig = await this.prisma.gameConfig.findFirst({
      where: { isActive: true },
    });

    if (!gameConfig) {
      return {
        canDraw: false,
        reason: 'Aucune configuration de jeu active',
      };
    }

    if (gameConfig.grandPrizeDrawn) {
      return {
        canDraw: false,
        reason: 'Le tirage au sort a déjà été effectué',
      };
    }

    const now = new Date();
    if (now < gameConfig.endDate) {
      return {
        canDraw: false,
        reason: "Le jeu-concours n'est pas encore terminé",
      };
    }

    // Compter les participants uniques
    const participants = await this.prisma.participation.groupBy({
      by: ['userId'],
    });

    if (participants.length === 0) {
      return {
        canDraw: false,
        reason: 'Aucun participant au jeu-concours',
      };
    }

    return {
      canDraw: true,
      participantsCount: participants.length,
    };
  }

  /**
   * Effectue le tirage au sort du grand prix
   * Chaque participant a UNE seule chance, quel que soit son nombre de participations
   */
  async draw() {
    const check = await this.canDraw();
    if (!check.canDraw) {
      throw new BadRequestException(check.reason);
    }

    // Récupérer tous les participants uniques
    const participantIds = await this.prisma.participation.groupBy({
      by: ['userId'],
    });

    if (participantIds.length === 0) {
      throw new BadRequestException('Aucun participant');
    }

    // Tirage au sort cryptographiquement sécurisé
    const randomIndex = randomInt(0, participantIds.length);
    const winnerId = participantIds[randomIndex].userId;

    // Récupérer les infos du gagnant
    const winner = await this.prisma.user.findUnique({
      where: { id: winnerId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });

    // Mettre à jour la config du jeu.
    // La condition `grandPrizeDrawn: false` rend l'opération idempotente :
    // deux tirages simultanés ne peuvent pas écraser le même gagnant.
    const updated = await this.prisma.gameConfig.updateMany({
      where: { isActive: true, grandPrizeDrawn: false },
      data: {
        grandPrizeDrawn: true,
        grandPrizeWinnerId: winnerId,
        grandPrizeDrawnAt: new Date(),
      },
    });

    if (updated.count === 0) {
      throw new BadRequestException('Le tirage au sort a déjà été effectué');
    }

    // Log d'audit
    await this.prisma.auditLog.create({
      data: {
        action: 'GRAND_PRIZE_DRAW',
        entity: 'GameConfig',
        newValue: {
          winnerId,
          totalParticipants: participantIds.length,
          drawnAt: new Date().toISOString(),
        },
      },
    });

    // /stats/global sert `game.grandPrizeDrawn` depuis le cache `stats:overview`
    // (TTL 5 min). Sans cette invalidation, le back-office continue d'afficher
    // l'état pré-tirage jusqu'à expiration, bouton de tirage compris.
    await this.redis.delByPattern(STATS_CACHE_PATTERN);

    return {
      success: true,
      winner: {
        ...winner,
        email: this.maskEmail(winner?.email || ''),
      },
      totalParticipants: participantIds.length,
      drawnAt: new Date(),
      prize: {
        name: 'Un an de thé',
        value: '360€',
        description: "1 an de thé Thé Tip Top d'une valeur de 360€",
      },
    };
  }

  /**
   * Récupère les informations du tirage au sort
   */
  async getDrawInfo() {
    const gameConfig = await this.prisma.gameConfig.findFirst({
      where: { isActive: true },
    });

    if (!gameConfig) {
      return {
        drawn: false,
        message: 'Aucune configuration de jeu active',
      };
    }

    if (!gameConfig.grandPrizeDrawn) {
      const check = await this.canDraw();
      return {
        drawn: false,
        canDraw: check.canDraw,
        reason: check.reason,
        participantsCount: check.participantsCount,
      };
    }

    // Récupérer le gagnant
    const winnerId = gameConfig.grandPrizeWinnerId;
    if (!winnerId) {
      return {
        drawn: true,
        drawnAt: gameConfig.grandPrizeDrawnAt,
        winner: null,
        totalParticipants: (await this.prisma.participation.groupBy({ by: ['userId'] })).length,
        prize: {
          name: 'Un an de thé',
          value: '360€',
        },
      };
    }

    const winner = await this.prisma.user.findUnique({
      where: { id: winnerId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // Compter les participants
    const participantsCount = (await this.prisma.participation.groupBy({ by: ['userId'] })).length;

    return {
      drawn: true,
      drawnAt: gameConfig.grandPrizeDrawnAt,
      winner: winner
        ? {
            id: winner.id,
            firstName: winner.firstName,
            lastName: `${winner.lastName?.slice(0, 1) ?? ''}.`,
            email: this.maskEmail(winner.email),
          }
        : null,
      totalParticipants: participantsCount,
      prize: {
        name: 'Un an de thé',
        value: '360€',
      },
    };
  }

  /**
   * Récupère le gagnant en clair, pour le back-office.
   *
   * Contrairement à getDrawInfo(), qui est publique et masque le nom et
   * l'email, cette méthode expose les coordonnées complètes : sans elles, un
   * administrateur n'a aucun moyen de contacter le gagnant une fois la page
   * rechargée, la réponse du tirage n'étant conservée nulle part.
   */
  async getWinner() {
    const gameConfig = await this.prisma.gameConfig.findFirst({
      where: { isActive: true },
    });

    if (!gameConfig?.grandPrizeDrawn) {
      return { drawn: false as const };
    }

    if (!gameConfig.grandPrizeWinnerId) {
      throw new NotFoundException('Tirage effectué mais aucun gagnant enregistré');
    }

    const winner = await this.prisma.user.findUnique({
      where: { id: gameConfig.grandPrizeWinnerId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });

    if (!winner) {
      throw new NotFoundException('Compte du gagnant introuvable');
    }

    const participantsCount = (await this.prisma.participation.groupBy({ by: ['userId'] })).length;

    return {
      drawn: true as const,
      drawnAt: gameConfig.grandPrizeDrawnAt,
      winner,
      totalParticipants: participantsCount,
      prize: {
        name: 'Un an de thé',
        value: '360€',
      },
    };
  }

  /**
   * Masque un email pour l'affichage public
   */
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***@***.***';
    const maskedLocal =
      local.length > 2 ? local.slice(0, 1) + '*'.repeat(local.length - 2) + local.slice(-1) : '**';
    return `${maskedLocal}@${domain}`;
  }
}
