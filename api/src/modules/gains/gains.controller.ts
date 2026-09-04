// ===========================================
// Contrôleur Gains
// ===========================================

import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { GainsService } from './gains.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DeliverPrizeDto } from './dto/deliver-prize.dto';
import { User } from '@prisma/client';

@ApiTags('gains')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gains')
export class GainsController {
  constructor(private readonly gainsService: GainsService) {}

  // ===========================================
  // REMETTRE UN LOT PAR ID
  // ===========================================
  @Post(':id/deliver')
  @Roles('EMPLOYEE', 'ADMIN')
  @ApiOperation({
    summary: 'Marquer un lot comme remis (Employé/Admin)',
    description:
      "La remise est atomique : la condition « non encore remis » fait partie de l'ordre " +
      "d'écriture, de sorte que deux caisses validant le même lot au même instant ne peuvent " +
      'pas aboutir toutes les deux (RG-22).',
  })
  @ApiResponse({ status: 200, description: 'Lot remis avec succès' })
  @ApiResponse({ status: 403, description: 'Période de réclamation expirée (RG-24)' })
  @ApiResponse({ status: 404, description: 'Participation non trouvée' })
  @ApiResponse({ status: 409, description: 'Lot déjà remis' })
  async deliverPrize(
    @Param('id') id: string,
    @Body() dto: DeliverPrizeDto,
    @CurrentUser() user: User,
  ) {
    return this.gainsService.deliverPrize(id, user.id, dto.deliveryMethod);
  }

  // ===========================================
  // REMETTRE UN LOT PAR CODE
  // ===========================================
  @Post('by-code/:code/deliver')
  @Roles('EMPLOYEE', 'ADMIN')
  @ApiOperation({ summary: 'Marquer un lot comme remis par code (Employé/Admin)' })
  @ApiResponse({ status: 200, description: 'Lot remis avec succès' })
  @ApiResponse({ status: 400, description: 'Code non encore utilisé par un client' })
  @ApiResponse({ status: 403, description: 'Période de réclamation expirée (RG-24)' })
  @ApiResponse({ status: 404, description: 'Ticket non trouvé' })
  @ApiResponse({ status: 409, description: 'Lot déjà remis' })
  async deliverPrizeByCode(
    @Param('code') code: string,
    @Body() dto: DeliverPrizeDto,
    @CurrentUser() user: User,
  ) {
    return this.gainsService.deliverPrizeByCode(code, user.id, dto.deliveryMethod);
  }

  // ===========================================
  // LOTS EN ATTENTE DE REMISE
  // ===========================================
  @Get('pending')
  @Roles('EMPLOYEE', 'ADMIN')
  @ApiOperation({ summary: 'Liste des lots en attente de remise (Employé/Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Liste des lots en attente' })
  async getPendingDeliveries(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.gainsService.getPendingDeliveries({ page, limit });
  }

  // ===========================================
  // HISTORIQUE DES REMISES
  // ===========================================
  @Get('history')
  @Roles('EMPLOYEE', 'ADMIN')
  @ApiOperation({ summary: 'Historique des remises (Employé/Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'employeeId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Historique des remises' })
  async getDeliveryHistory(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.gainsService.getDeliveryHistory({ page, limit, employeeId });
  }

  // ===========================================
  // STATISTIQUES DES REMISES
  // ===========================================
  @Get('stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Statistiques des remises (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistiques des remises' })
  async getDeliveryStats() {
    return this.gainsService.getDeliveryStats();
  }
}
