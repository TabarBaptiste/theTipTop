// ===========================================
// Service Stats
// ===========================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ParticipationsService } from '../participations/participations.service';
import { PRIZE_LABELS } from '../tickets/tickets.service';

@Injectable()
export class StatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly participationsService: ParticipationsService,
  ) {}

  /**
   * Statistiques globales du jeu-concours
   */
  async getGlobalStats() {
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

    // Calcul du temps restant
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

    // Statistiques par type de gain
    const byType = prizeStats.map((stat) => ({
      type: stat.prizeType,
      label: PRIZE_LABELS[stat.prizeType].name,
      value: PRIZE_LABELS[stat.prizeType].value,
      count: stat._count._all,
    }));

    return {
      byType,
      total: prizeStats.reduce((sum: number, stat: PrizeStat) => sum + stat._count._all, 0),
      delivered: deliveredCount,
    };
  }


    type PrizeStat = (typeof prizeStats)[number];
  /**
   * Statistiques démographiques des participants
   */
  async getDemographicStats() {
    // Par genre
    const byGender = await this.prisma.user.groupBy({
    const byType = prizeStats.map((stat: PrizeStat) => ({
      _count: true,
      where: {
        role: 'CLIENT',
        deletedAt: null,
        participations: {
          some: {},
        },
      },
      total: prizeStats.reduce((sum: number, stat: PrizeStat) => sum + stat._count._all, 0),

    type GenderGroup = (typeof byGender)[number];

    // Par tranche d'âge
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

    type DemographicUser = (typeof users)[number];

    const now = new Date();
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56+': 0,
    };

    users.forEach((user: DemographicUser) => {
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

        type GenderGroup = (typeof byGender)[number];
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

        type DemographicUser = (typeof users)[number];
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

    type TimelineParticipation = (typeof participations)[number];

    // Grouper par jour
    const byDay = participations.reduce(
      (acc: Record<string, number>, p: TimelineParticipation) => {
        const day = p.createdAt.toISOString().split('T')[0];
        acc[day] = (acc[day] || 0) + 1;
          byGender: byGender.map((g: GenderGroup) => ({
      },
      {} as Record<string, number>,
    );

    // Compléter les jours sans participation
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
   */
  async getEmailingData(options: { consentEmail?: boolean; hasParticipated?: boolean }) {
    const where: any = {
      role: 'CLIENT',
      deletedAt: null,
    };

    if (options.consentEmail !== undefined) {
      where.consentEmail = options.consentEmail;
    }

    if (options.hasParticipated !== undefined) {
      if (options.hasParticipated) {
        where.participations = { some: {} };
      } else {
        where.participations = { none: {} };
      }
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

    type EmailingUser = (typeof users)[number];

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
