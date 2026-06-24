// ===========================================
// Service GameConfig (public)
// ===========================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { GAME_CONFIG_CACHE_KEY, GAME_CONFIG_TTL } from '../../redis/cache-keys';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Retourne la configuration publique du jeu-concours actif.
   * N'expose pas les champs sensibles (grandPrize, id, etc.)
   */
  async getPublicConfig(): Promise<PublicGameConfig | null> {
    const config = await this.redis.getOrSet(GAME_CONFIG_CACHE_KEY, GAME_CONFIG_TTL, () =>
      this.prisma.gameConfig.findFirst({ where: { isActive: true } }),
    );

    if (!config) return null;

    // Les dates peuvent être des strings (cache) ou des Date (Prisma) : on normalise.
    const startDate = new Date(config.startDate);
    const endDate = new Date(config.endDate);
    const claimEndDate = new Date(config.claimEndDate);
    const now = new Date();
    let phase: GamePhase;

    if (now < startDate) {
      phase = 'not_started';
    } else if (now <= endDate) {
      phase = 'active';
    } else if (now <= claimEndDate) {
      phase = 'claim_only';
    } else {
      phase = 'ended';
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      claimEndDate: claimEndDate.toISOString(),
      isActive: config.isActive,
      phase,
    };
  }
}
