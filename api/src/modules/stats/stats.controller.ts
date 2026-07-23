// ===========================================
// Contrôleur Stats
// ===========================================

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('stats')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // ===========================================
  // STATISTIQUES GLOBALES
  // ===========================================
  @Get()
  @ApiOperation({ summary: 'Statistiques globales du jeu-concours' })
  @ApiResponse({ status: 200, description: 'Statistiques globales' })
  async getGlobalStats() {
    return this.statsService.getGlobalStats();
  }

  // ===========================================
  // STATISTIQUES DES GAINS
  // ===========================================
  @Get('prizes')
  @ApiOperation({ summary: 'Statistiques des gains par type' })
  @ApiResponse({ status: 200, description: 'Statistiques des gains' })
  async getPrizeStats() {
    return this.statsService.getPrizeStats();
  }

  // ===========================================
  // STATISTIQUES DÉMOGRAPHIQUES
  // ===========================================
  @Get('demographics')
  @ApiOperation({ summary: 'Statistiques démographiques des participants' })
  @ApiResponse({ status: 200, description: 'Statistiques démographiques' })
  async getDemographicStats() {
    return this.statsService.getDemographicStats();
  }

  // ===========================================
  // STATISTIQUES TEMPORELLES
  // ===========================================
  @Get('timeline')
  @ApiOperation({ summary: 'Évolution des participations dans le temps' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Nombre de jours (défaut: 30)',
  })
  @ApiResponse({ status: 200, description: 'Statistiques temporelles' })
  async getTimelineStats(@Query('days') days?: number) {
    return this.statsService.getTimelineStats(days);
  }

  // ===========================================
  // DONNÉES EMAILING
  // ===========================================
  @Get('emailing')
  @ApiOperation({
    summary: 'Données pour campagnes emailing (contacts consentants uniquement)',
    description:
      'RGPD : seuls les contacts ayant explicitement consenti (consentEmail) sont retournés. Le segment optionnel hasParticipated affine le ciblage sans jamais lever cette contrainte.',
  })
  @ApiQuery({ name: 'hasParticipated', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Données emailing' })
  async getEmailingData(@Query('hasParticipated') hasParticipated?: boolean) {
    return this.statsService.getEmailingData({ hasParticipated });
  }
}
