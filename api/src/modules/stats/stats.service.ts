// ===========================================
// Service Stats
// ===========================================

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ParticipationsService } from '../participations/participations.service';
import { RedisService } from '../../redis/redis.service';
import {
  STATS_OVERVIEW_TTL,
  STATS_PRIZES_TTL,
  STATS_DEMOGRAPHICS_TTL,
  STATS_TIMELINE_TTL,
  STATS_EMAILING_TTL,
} from '../../redis/cache-keys';

type PrizeStat = {
  prizeType: string;
  _count: { _all: number };
};

type GenderGroup = {
  gender: string | null;
  _count: number;
};

type TimelineParticipation = {
  createdAt: Date;
};

type EmailingUser = {
  email: string;
  firstName: string;
  lastName: string;
  _count: { participations: number };
};

@Injectable()
export class StatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly participationsService: ParticipationsService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Statistiques globales du jeu-concours
   */
  async getGlobalStats() {
    return this.redis.getOrSet('stats:overview', STATS_OVERVIEW_TTL, () =>
      this.computeGlobalStats(),
    );
  }

  private async computeGlobalStats() {
    const [
      totalTickets,
      usedTickets,
      distributedTickets,
      totalUsers,
      totalParticipations,
      deliveredPrizes,
      gameConfig,
    ] = await Promise.all([
      this.prisma.ticket.count(),
      this.prisma.ticket.count({ where: { isUsed: true } }),
      this.prisma.ticket.count({ where: { isDistributed: true } }),
      this.prisma.user.count({ where: { role: 'CLIENT', deletedAt: null } }),
      this.prisma.participation.count(),
      this.prisma.participation.count({ where: { prizeDelivered: true } }),
      this.prisma.gameConfig.findFirst({ where: { isActive: true } }),
    ]);

    const uniqueParticipants = await this.participationsService.countUniqueParticipants();

    let daysRemaining = 0;
    let claimDaysRemaining = 0;
    let gamePhase = 'not_started';

    if (gameConfig) {
      const now = new Date();
      if (now < gameConfig.startDate) {
        daysRemaining = Math.ceil(
          (gameConfig.endDate.getTime() - gameConfig.startDate.getTime()) / (1000 * 60 * 60 * 24),
        );
      } else if (now <= gameConfig.endDate) {
        gamePhase = 'active';
        daysRemaining = Math.ceil(
          (gameConfig.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        claimDaysRemaining = Math.ceil(
          (gameConfig.claimEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
      } else if (now <= gameConfig.claimEndDate) {
        gamePhase = 'claim_only';
        claimDaysRemaining = Math.ceil(
          (gameConfig.claimEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
      } else {
        gamePhase = 'ended';
      }
    }

    return {
      tickets: {
        total: totalTickets,
        used: usedTickets,
        distributed: distributedTickets,
        available: totalTickets - distributedTickets,
        usageRate:
          distributedTickets > 0 ? ((usedTickets / distributedTickets) * 100).toFixed(1) : 0,
      },
      users: {
        total: totalUsers,
        participants: uniqueParticipants,
        conversionRate: totalUsers > 0 ? ((uniqueParticipants / totalUsers) * 100).toFixed(1) : 0,
      },
      participations: {
        total: totalParticipations,
        averagePerUser:
          uniqueParticipants > 0 ? (totalParticipations / uniqueParticipants).toFixed(1) : 0,
      },
      prizes: {
        delivered: deliveredPrizes,
        pending: totalParticipations - deliveredPrizes,
        deliveryRate:
          totalParticipations > 0 ? ((deliveredPrizes / totalParticipations) * 100).toFixed(1) : 0,
      },
      game: {
        phase: gamePhase,
        daysRemaining,
        claimDaysRemaining,
        startDate: gameConfig?.startDate,
        endDate: gameConfig?.endDate,
        claimEndDate: gameConfig?.claimEndDate,
        grandPrizeDrawn: gameConfig?.grandPrizeDrawn || false,
      },
    };
  }

  /**
   * Statistiques des gains par type
   */
  async getPrizeStats() {
    return this.redis.getOrSet('stats:prizes', STATS_PRIZES_TTL, () => this.computePrizeStats());
  }

  private async computePrizeStats() {
    const prizeStats = await this.prisma.ticket.groupBy({
      by: ['prizeType'],
      _count: {
        _all: true,
      },
      where: { isUsed: true },
    });

    const deliveredCount = await this.prisma.participation.count({
      where: { prizeDelivered: true },
    });

    const prizes = await this.prisma.prize.findMany();
    const prizesMap = prizes.reduce(
      (acc, p) => {
        acc[p.code] = { name: p.name, value: p.value };
        return acc;
      },
      {} as Record<string, { name: string; value: string | null }>,
    );

    const byType = prizeStats.map((stat: PrizeStat) => ({
      type: stat.prizeType,
      label: (prizesMap[stat.prizeType] ?? { name: stat.prizeType }).name,
      value: (prizesMap[stat.prizeType] ?? { value: '' }).value,
      count: stat._count._all,
    }));

    return {
      byType,
      total: prizeStats.reduce((sum: number, stat: PrizeStat) => sum + stat._count._all, 0),
      delivered: deliveredCount,
    };
  }

  /**
   * Statistiques démographiques des participants
   */
  async getDemographicStats() {
    return this.redis.getOrSet('stats:demographics', STATS_DEMOGRAPHICS_TTL, () =>
      this.computeDemographicStats(),
    );
  }

  private async computeDemographicStats() {
    const byGender = await this.prisma.user.groupBy({
      by: ['gender'],
      _count: true,
      where: {
        role: 'CLIENT',
        deletedAt: null,
        participations: {
          some: {},
        },
      },
    });

    const users = await this.prisma.user.findMany({
      where: {
        role: 'CLIENT',
        deletedAt: null,
        birthDate: { not: null },
        participations: {
          some: {},
        },
      },
      select: {
        birthDate: true,
      },
    });

    const now = new Date();
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56+': 0,
    };

    users.forEach((user) => {
      if (user.birthDate) {
        const age = Math.floor(
          (now.getTime() - user.birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25),
        );
        if (age <= 25) ageGroups['18-25']++;
        else if (age <= 35) ageGroups['26-35']++;
        else if (age <= 45) ageGroups['36-45']++;
        else if (age <= 55) ageGroups['46-55']++;
        else ageGroups['56+']++;
      }
    });

    return {
      byGender: byGender.map((g: GenderGroup) => ({
        gender: g.gender || 'NON_RENSEIGNE',
        count: g._count,
      })),
      byAge: Object.entries(ageGroups).map(([range, count]) => ({
        range,
        count,
      })),
    };
  }

  /**
   * Statistiques temporelles (participations par jour)
   */
  async getTimelineStats(days: number = 30) {
    // Borne la fenêtre (1-365 jours) : la boucle de construction de la
    // timeline itère `days` fois, une valeur arbitraire serait un vecteur DoS.
    const safeDays = Number.isFinite(days) ? Math.min(Math.max(Math.trunc(days), 1), 365) : 30;
    return this.redis.getOrSet(`stats:timeline:${safeDays}`, STATS_TIMELINE_TTL, () =>
      this.computeTimelineStats(safeDays),
    );
  }

  private async computeTimelineStats(days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const participations = await this.prisma.participation.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const byDay = participations.reduce(
      (acc: Record<string, number>, p: TimelineParticipation) => {
        const day = p.createdAt.toISOString().split('T')[0];
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const timeline: { date: string; count: number }[] = [];
    const current = new Date(startDate);
    const now = new Date();

    while (current <= now) {
      const day = current.toISOString().split('T')[0];
      timeline.push({
        date: day,
        count: byDay[day] || 0,
      });
      current.setDate(current.getDate() + 1);
    }

    return {
      timeline,
      total: participations.length,
      average: (participations.length / days).toFixed(1),
    };
  }

  /**
   * Données pour export (emailing)
   *
   * RGPD : le consentement explicite est **toujours** exigé pour un export à
   * des fins d'emailing (cf. cahier des charges). Les contacts sans
   * `consentEmail` sont donc systématiquement exclus, quel que soit le segment
   * demandé. Cette contrainte est appliquée côté serveur pour ne pas dépendre
   * du client.
   */
  async getEmailingData(options: { hasParticipated?: boolean }) {
    const cacheKey = `stats:emailing:${options.hasParticipated ?? 'all'}`;
    return this.redis.getOrSet(cacheKey, STATS_EMAILING_TTL, () =>
      this.computeEmailingData(options),
    );
  }

  private async computeEmailingData(options: { hasParticipated?: boolean }) {
    const where: Prisma.UserWhereInput = {
      role: 'CLIENT',
      deletedAt: null,
      // RGPD : exclusion non négociable des contacts non consentants
      consentEmail: true,
    };

    if (options.hasParticipated !== undefined) {
      where.participations = options.hasParticipated ? { some: {} } : { none: {} };
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        consentEmail: true,
        _count: {
          select: { participations: true },
        },
      },
    });

    return {
      count: users.length,
      users: users.map((u: EmailingUser) => ({
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        participationsCount: u._count.participations,
      })),
    };
  }
}
