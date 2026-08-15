// ===========================================
// DTO - Validation du code de vérification email (UC-05)
// ===========================================

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Matches } from 'class-validator';

export class VerifyParticipationDto {
  @ApiProperty({
    example: '3f1c9d0e-8b6a-4c2d-9f7e-1a2b3c4d5e6f',
    description: 'Identifiant du lead retourné par /participations/initiate',
  })
  @IsUUID()
  leadId: string;

  @ApiProperty({
    example: '482913',
    description: 'Code à 6 chiffres reçu par email (RG-06)',
  })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Le code doit contenir exactement 6 chiffres' })
  code: string;
}
