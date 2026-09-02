// ===========================================
// Contrôleur Inscription
// ===========================================
// L'inscription classique emprunte le tunnel de vérification du jeu : un lead
// est ouvert, un code à 6 chiffres part par email, et le compte naît à la
// confirmation. Seule l'absence de ticket la distingue d'une participation.
//
// Les routes restent sous /auth : c'est leur place pour qui consomme l'API, et
// l'URL publique ne bouge pas. Elles vivent en revanche dans leur propre
// contrôleur, car AuthModule est importé par ParticipationsModule : les loger
// dans AuthController obligerait à un forwardRef entre les deux modules pour
// atteindre LeadsService.

import { Body, Controller, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { LeadsService } from '../participations/leads.service';
import { Public } from '../auth/decorators/public.decorator';
import { RegisterDto } from '../auth/dto/register.dto';
import { VerifyParticipationDto } from '../participations/dto/verify-participation.dto';
import { ResendCodeDto } from '../participations/dto/resend-code.dto';

@ApiTags('auth')
@Controller('auth')
export class RegistrationController {
  constructor(private readonly leadsService: LeadsService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Ouvrir une inscription et envoyer le code de confirmation',
    description:
      "Ne crée ni compte ni session : un code à 6 chiffres valable 48 h part à l'adresse " +
      "indiquée, et le compte n'est créé qu'à sa confirmation via /auth/register/verify. " +
      "Si l'adresse porte déjà un compte, la réponse est identique au parcours nominal et " +
      'son titulaire en est informé par email (RG-01).',
  })
  @ApiResponse({
    status: 201,
    description: 'Code de confirmation envoyé',
    schema: {
      properties: {
        leadId: { type: 'string' },
        maskedEmail: { type: 'string', example: 'je*********@email.fr' },
        expiresAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives depuis cette adresse IP' })
  async register(@Body() dto: RegisterDto, @Ip() ip: string) {
    return this.leadsService.initiateRegistration(dto, ip);
  }

  @Public()
  @Post('register/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmer le code et créer le compte',
    description:
      "Crée le compte avec le mot de passe choisi à l'inscription et ouvre une session. " +
      "participation vaut null : aucune participation n'est en jeu sur ce parcours.",
  })
  @ApiResponse({ status: 200, description: 'Compte créé, session ouverte' })
  @ApiResponse({ status: 400, description: 'Code invalide ou expiré' })
  async verify(@Body() dto: VerifyParticipationDto) {
    return this.leadsService.verify(dto);
  }

  @Public()
  @Post('register/resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renvoyer le code de confirmation',
    description: 'Possible 60 s après le dernier envoi. Le code précédent est invalidé.',
  })
  @ApiResponse({ status: 200, description: 'Nouveau code envoyé' })
  @ApiResponse({ status: 404, description: 'Demande introuvable ou déjà finalisée' })
  @ApiResponse({ status: 429, description: 'Renvoi trop rapproché' })
  async resend(@Body() dto: ResendCodeDto) {
    return this.leadsService.resend(dto);
  }
}
