// ===========================================
// DTO - Échange du code OAuth
// ===========================================

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class OAuthExchangeDto {
  @ApiProperty({
    example: 'a3f1c9...64 caractères hexadécimaux',
    description:
      'Code à usage unique remis par la redirection OAuth. Valable 60 secondes, consommé au premier échange.',
  })
  @IsString()
  // 32 octets en hexadécimal. Le format est contraint pour que rien d'autre
  // qu'un code plausible n'atteigne le magasin.
  @Matches(/^[a-f0-9]{64}$/, { message: 'Code de connexion invalide' })
  code: string;
}
