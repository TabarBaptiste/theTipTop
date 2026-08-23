// ===========================================
// Contrôleur Newsletter
// ===========================================

import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { UnsubscribeNewsletterDto } from './dto/unsubscribe-newsletter.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Inscrire une adresse à la newsletter',
    description:
      "L'adresse est enregistrée en base, puis poussée vers la liste Brevo. Une " +
      'indisponibilité de Brevo ne fait pas échouer la demande : la synchronisation ' +
      'reste en attente et peut être rejouée.',
  })
  @ApiBody({ type: SubscribeNewsletterDto })
  @ApiResponse({
    status: 200,
    description: 'Adresse inscrite',
    schema: {
      properties: {
        // Permet a l'interface de distinguer « merci » de « vous l'etiez
        // deja », sans revelation utile a un tiers : il faut deja connaitre
        // l'adresse pour interroger.
        dejaInscrit: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Adresse invalide' })
  async subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.newsletterService.subscribe(dto.email);
  }

  @Public()
  @Post('unsubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Désinscrire le porteur d’un jeton',
    description:
      "Le jeton du lien fait foi : un abonné n'a pas de compte. L'opération est " +
      'idempotente, un lien reçu par courriel étant souvent cliqué deux fois.',
  })
  @ApiBody({ type: UnsubscribeNewsletterDto })
  @ApiResponse({
    status: 200,
    description: 'Adresse désinscrite',
    schema: { properties: { email: { type: 'string' } } },
  })
  @ApiResponse({ status: 400, description: 'Jeton au format invalide' })
  @ApiResponse({ status: 404, description: 'Jeton inconnu' })
  async unsubscribe(@Body() dto: UnsubscribeNewsletterDto) {
    return this.newsletterService.unsubscribe(dto.token);
  }
}
