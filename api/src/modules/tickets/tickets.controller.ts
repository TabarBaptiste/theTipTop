// ===========================================
// Contrôleur Tickets
// ===========================================

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { VerifyCodeDto } from './dto/verify-code.dto';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // ===========================================
  // VÉRIFICATION D'UN CODE (Public)
  // ===========================================
  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérifier si un code est valide' })
  @ApiResponse({
    status: 200,
    description: 'Résultat de la vérification',
    schema: {
      properties: {
        isValid: { type: 'boolean' },
        error: { type: 'string', nullable: true },
        ticket: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            prizeType: { type: 'string' },
            prize: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                value: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  async verifyCode(@Body() dto: VerifyCodeDto) {
    return this.ticketsService.verifyCode(dto.code);
  }

  // ===========================================
  // LISTE DES LOTS DISPONIBLES (Public)
  // ===========================================
  @Public()
  @Get('prizes')
  @ApiOperation({ summary: 'Liste des lots à gagner' })
  @ApiResponse({ status: 200, description: 'Liste des lots' })
  async getPrizes() {
    return this.ticketsService.findAllPrizes();
  }

  // ===========================================
  // STATISTIQUES (Admin)
  // ===========================================
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Statistiques des tickets (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistiques des tickets' })
  async getStats() {
    return this.ticketsService.getStats();
  }

  // ===========================================
  // RÉCUPÉRER DES CODES DISPONIBLES (Employé/Admin - API Caisses)
  // ===========================================
  @Get('available')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE', 'ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Récupérer des codes disponibles (API Caisses)' })
  @ApiQuery({
    name: 'count',
    required: false,
    type: Number,
    description: 'Nombre de codes (max 100)',
  })
  @ApiResponse({ status: 200, description: 'Codes disponibles' })
  async getAvailableCodes(@Query('count') count?: number) {
    const codes = await this.ticketsService.getAvailableCodes(count);
    return { codes, count: codes.length };
  }

  // ===========================================
  // MARQUER COMME DISTRIBUÉ (Employé/Admin - API Caisses)
  // ===========================================
  @Post(':code/distribute')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE', 'ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Marquer un ticket comme distribué' })
  @ApiResponse({ status: 200, description: 'Ticket mis à jour' })
  async markAsDistributed(@Param('code') code: string) {
    return this.ticketsService.markAsDistributed(code);
  }
}
