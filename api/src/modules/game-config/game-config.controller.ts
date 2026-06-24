// ===========================================
// Contrôleur GameConfig (public)
// ===========================================

import { Controller, Get, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GameConfigService } from './game-config.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('game')
@Controller('game')
export class GameConfigController {
  constructor(private readonly gameConfigService: GameConfigService) {}

  /**
   * Retourne la configuration publique du jeu-concours actif.
   * Utilisé par le front pour afficher le countdown et les dates.
   */
  @Public()
  @Get('config')
  @ApiOperation({ summary: 'Configuration publique du jeu-concours' })
  @ApiResponse({
    status: 200,
    description: 'Configuration du jeu actif',
    schema: {
      properties: {
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        claimEndDate: { type: 'string', format: 'date-time' },
        isActive: { type: 'boolean' },
        phase: {
          type: 'string',
          enum: ['not_started', 'active', 'claim_only', 'ended'],
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Aucun jeu actif' })
  async getConfig() {
    const config = await this.gameConfigService.getPublicConfig();
    if (!config) {
      throw new NotFoundException('Aucune configuration de jeu active');
    }
    return config;
  }
}
