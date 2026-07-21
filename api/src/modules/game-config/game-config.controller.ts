// ===========================================
// Contrôleur GameConfig (public)
// ===========================================

import { Body, Controller, Get, NotFoundException, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GameConfigService } from './game-config.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateGameConfigDto } from './dto/update-game-config.dto';

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

  // ===========================================
  // MISE À JOUR DES DATES (Admin)
  // ===========================================
  @Patch('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour les dates du jeu-concours actif (Admin)' })
  @ApiResponse({ status: 200, description: 'Configuration mise à jour' })
  @ApiResponse({ status: 400, description: 'Dates non chronologiques' })
  @ApiResponse({ status: 404, description: 'Aucun jeu actif' })
  async updateConfig(@Body() dto: UpdateGameConfigDto) {
    return this.gameConfigService.updateConfig(dto);
  }
}
