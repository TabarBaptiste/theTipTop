// ===========================================
// Contrôleur Grand Prize
// ===========================================

import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { GrandPrizeService } from './grand-prize.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('grand-prize')
@Controller('grand-prize')
export class GrandPrizeController {
  constructor(private readonly grandPrizeService: GrandPrizeService) {}

  // ===========================================
  // INFORMATIONS SUR LE TIRAGE
  // ===========================================
  @Public()
  @Get()
  @ApiOperation({ summary: 'Informations sur le tirage au sort du grand prix' })
  @ApiResponse({
    status: 200,
    description: 'Informations sur le tirage',
    schema: {
      properties: {
        drawn: { type: 'boolean' },
        canDraw: { type: 'boolean' },
        drawnAt: { type: 'string', format: 'date-time' },
        winner: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', description: 'Email masqué' },
          },
        },
        prize: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            value: { type: 'string' },
          },
        },
      },
    },
  })
  async getDrawInfo() {
    return this.grandPrizeService.getDrawInfo();
  }

  // ===========================================
  // VÉRIFIER SI LE TIRAGE EST POSSIBLE
  // ===========================================
  @Get('can-draw')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Vérifier si le tirage au sort peut être effectué (Admin)' })
  @ApiResponse({ status: 200, description: 'Statut du tirage' })
  async canDraw() {
    return this.grandPrizeService.canDraw();
  }

  // ===========================================
  // GAGNANT EN CLAIR (BACK-OFFICE)
  // ===========================================
  @Get('winner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Coordonnées complètes du gagnant du grand prix (Admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Gagnant non masqué, ou drawn=false si le tirage n’a pas eu lieu',
    schema: {
      properties: {
        drawn: { type: 'boolean' },
        drawnAt: { type: 'string', format: 'date-time' },
        winner: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string', nullable: true },
          },
        },
        totalParticipants: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Accès réservé aux administrateurs' })
  @ApiResponse({ status: 404, description: 'Gagnant introuvable' })
  async getWinner() {
    return this.grandPrizeService.getWinner();
  }

  // ===========================================
  // EFFECTUER LE TIRAGE AU SORT
  // ===========================================
  @Post('draw')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Effectuer le tirage au sort du grand prix (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Résultat du tirage',
    schema: {
      properties: {
        success: { type: 'boolean' },
        winner: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
          },
        },
        totalParticipants: { type: 'number' },
        drawnAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Tirage impossible' })
  async draw() {
    return this.grandPrizeService.draw();
  }
}
