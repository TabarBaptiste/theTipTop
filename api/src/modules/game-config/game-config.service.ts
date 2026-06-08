// ===========================================
// Service GameConfig (public)
// ===========================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type GamePhase = 'not_started' | 'active' | 'claim_only' | 'ended';

export interface PublicGameConfig {
  startDate: string;
  endDate: string;
  claimEndDate: string;
  isActive: boolean;
  phase: GamePhase;
}

@Injectable()
export class GameConfigService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retourne la configuration publique du jeu-concours actif.
   * N'expose pas les champs sensibles (grandPrize, id, etc.)
   */
  async getPublicConfig(): Promise<PublicGameConfig | null> {
    const config = await this.prisma.gameConfig.findFirst({
      where: { isActive: true },
    });

    if (!config) return null;

    const now = new Date();
    let phase: GamePhase;

    if (now < config.startDate) {
      phase = 'not_started';
    } else if (now <= config.endDate) {
      phase = 'active';
    } else if (now <= config.claimEndDate) {
      phase = 'claim_only';
    } else {
      phase = 'ended';
    }

    return {
      startDate: config.startDate.toISOString(),
      endDate: config.endDate.toISOString(),
      claimEndDate: config.claimEndDate.toISOString(),
      isActive: config.isActive,
      phase,
    };
  }
}
