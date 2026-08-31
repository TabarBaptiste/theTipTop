// ===========================================
// Service GameConfig (public)
// ===========================================

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import {
  GAME_CONFIG_CACHE_KEY,
  GAME_CONFIG_TTL,
  STATS_CACHE_PATTERN,
} from '../../redis/cache-keys';
import { UpdateGameConfigDto } from './dto/update-game-config.dto';

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

  /**
   * Met à jour les dates de la configuration active (Admin) et invalide le
   * cache Redis (game:config + stats:*) pour que le changement soit
   * immédiatement visible, sans attendre l'expiration du TTL.
   */
  async updateConfig(dto: UpdateGameConfigDto): Promise<PublicGameConfig> {
    const current = await this.prisma.gameConfig.findFirst({ where: { isActive: true } });
    if (!current) {
      throw new NotFoundException('Aucune configuration de jeu active');
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : current.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : current.endDate;
    const claimEndDate = dto.claimEndDate ? new Date(dto.claimEndDate) : current.claimEndDate;

    if (startDate >= endDate || endDate >= claimEndDate) {
      throw new BadRequestException(
        'Les dates doivent être chronologiques : début < fin < fin de réclamation',
      );
    }

    await this.prisma.gameConfig.update({
      where: { id: current.id },
      data: { startDate, endDate, claimEndDate },
    });

    await this.redis.del(GAME_CONFIG_CACHE_KEY);
    await this.redis.delByPattern(STATS_CACHE_PATTERN);

    return this.getPublicConfig() as Promise<PublicGameConfig>;
  }
}
