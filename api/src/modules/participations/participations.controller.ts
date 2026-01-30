// ===========================================
// Contrôleur Participations
// ===========================================

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { ParticipationsService } from './participations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { User } from '@prisma/client';

@ApiTags('participations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('participations')
export class ParticipationsController {
  constructor(private readonly participationsService: ParticipationsService) {}

  // ===========================================
  // PARTICIPER (Utiliser un code)
  // ===========================================
  @Post()
  @ApiOperation({ summary: 'Participer au jeu-concours avec un code' })
  @ApiResponse({
    status: 201,
    description: 'Participation réussie',
    schema: {
      properties: {
        id: { type: 'string' },
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
        participatedAt: { type: 'string', format: 'date-time' },
        prizeDelivered: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Code invalide ou déjà utilisé' })
  async participate(
    @CurrentUser() user: User,
    @Body() dto: CreateParticipationDto,
  ) {
    return this.participationsService.participate(user.id, dto.code);
  }

  // ===========================================
  // MES PARTICIPATIONS
  // ===========================================
  @Get('me')
  @ApiOperation({ summary: 'Mes participations' })
  @ApiResponse({ status: 200, description: 'Liste de mes participations' })
  async getMyParticipations(@CurrentUser() user: User) {
    return this.participationsService.findByUser(user.id);
  }

  // ===========================================
  // RECHERCHER PAR CODE (Employé/Admin)
  // ===========================================
  @Get('by-code/:code')
  @UseGuards(RolesGuard)
  @Roles('EMPLOYEE', 'ADMIN')
  @ApiOperation({ summary: 'Rechercher une participation par code (Employé/Admin)' })
  @ApiResponse({ status: 200, description: 'Détails de la participation' })
  @ApiResponse({ status: 404, description: 'Ticket non trouvé' })
  async findByCode(@Param('code') code: string) {
    return this.participationsService.findByCode(code);
  }

  // ===========================================
  // LISTE DES PARTICIPATIONS (Admin)
  // ===========================================
  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Liste de toutes les participations (Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'prizeDelivered', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Liste des participations' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('prizeDelivered') prizeDelivered?: boolean,
  ) {
    return this.participationsService.findAll({ page, limit, prizeDelivered });
  }

  // ===========================================
  // DÉTAIL D'UNE PARTICIPATION
  // ===========================================
  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une participation' })
  @ApiResponse({ status: 200, description: 'Détails de la participation' })
  @ApiResponse({ status: 404, description: 'Participation non trouvée' })
  async findOne(@Param('id') id: string) {
    return this.participationsService.findById(id);
  }
}
