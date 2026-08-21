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
  Ip,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { ParticipationsService } from './participations.service';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { InitiateParticipationDto } from './dto/initiate-participation.dto';
import { VerifyParticipationDto } from './dto/verify-participation.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { User } from '@prisma/client';

@ApiTags('participations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('participations')
export class ParticipationsController {
  constructor(
    private readonly participationsService: ParticipationsService,
    private readonly leadsService: LeadsService,
  ) {}

  // ===========================================
  // TUNNEL PUBLIC (UC-05) - sans authentification
  // ===========================================

  @Public()
  @Post('initiate')
  @ApiOperation({
    summary: 'Ouvrir une participation sans compte (formulaire public)',
    description:
      'Réserve le ticket et envoie un code de vérification à 6 chiffres, valable 48 h. ' +
      "Si l'adresse correspond déjà à un lead actif, la réponse est identique mais " +
      'aucun nouveau code n’est généré (RG-01).',
  })
  @ApiResponse({
    status: 201,
    description: 'Code de vérification envoyé',
    schema: {
      properties: {
        leadId: { type: 'string' },
        maskedEmail: { type: 'string', example: 'je*********@email.fr' },
        expiresAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Code invalide, jeu clos ou données refusées' })
  @ApiResponse({ status: 409, description: 'Code déjà utilisé ou en cours de validation' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives depuis cette adresse IP' })
  async initiate(@Body() dto: InitiateParticipationDto, @Ip() ip: string) {
    return this.leadsService.initiate(dto, ip);
  }

  @Public()
  @Post('verify')
  @ApiOperation({
    summary: 'Valider le code reçu par email et révéler le gain',
    description:
      'Crée le compte et la participation, consomme le ticket et ouvre une session. ' +
      'passwordRequired indique si un mot de passe reste à définir.',
  })
  @ApiResponse({ status: 201, description: 'Participation confirmée, session ouverte' })
  @ApiResponse({ status: 400, description: 'Code invalide ou expiré' })
  @ApiResponse({ status: 409, description: 'Réservation expirée, code libéré' })
  async verify(@Body() dto: VerifyParticipationDto) {
    return this.leadsService.verify(dto);
  }

  @Public()
  @Post('resend')
  @ApiOperation({
    summary: 'Renvoyer le code de vérification',
    description:
      'Possible 60 s après le dernier envoi. Le code précédent est invalidé et la ' +
      "réservation du ticket est prolongée d'autant. Une adresse peut être corrigée.",
  })
  @ApiResponse({
    status: 201,
    description: 'Nouveau code envoyé',
    schema: {
      properties: {
        maskedEmail: { type: 'string' },
        expiresAt: { type: 'string', format: 'date-time' },
        shouldOfferEmailCorrection: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Demande introuvable ou déjà finalisée' })
  @ApiResponse({ status: 429, description: 'Renvoi trop rapproché' })
  async resend(@Body() dto: ResendCodeDto) {
    return this.leadsService.resend(dto);
  }

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
  async participate(@CurrentUser() user: User, @Body() dto: CreateParticipationDto) {
    return this.participationsService.participate(user, dto);
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
  @ApiOperation({ summary: "Détail d'une participation" })
  @ApiResponse({ status: 200, description: 'Détails de la participation' })
  @ApiResponse({ status: 404, description: 'Participation non trouvée' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const participation = await this.participationsService.findById(id);
    // Anti-IDOR : un client ne peut consulter que ses propres participations.
    // 404 (et non 403) pour ne pas révéler l'existence de la ressource.
    if (user.role === 'CLIENT' && participation.user.id !== user.id) {
      throw new NotFoundException('Participation non trouvée');
    }
    return participation;
  }
}
