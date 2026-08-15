// ===========================================
// DTO - Renvoi du code de vérification (RG-07, RG-08)
// ===========================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsUUID } from 'class-validator';

export class ResendCodeDto {
  @ApiProperty({
    example: '3f1c9d0e-8b6a-4c2d-9f7e-1a2b3c4d5e6f',
    description: 'Identifiant du lead retourné par /participations/initiate',
  })
  @IsUUID()
  leadId: string;

  // RG-08 : après deux échecs de réception, la cause la plus probable est une
  // faute de frappe. On laisse corriger l'adresse plutôt que de renvoyer
  // indéfiniment vers un domaine erroné.
  @ApiPropertyOptional({
    example: 'jean.dupont@email.fr',
    description: "Nouvelle adresse email, si l'utilisateur corrige une faute de saisie",
  })
  @IsOptional()
  @IsEmail({}, { message: 'Adresse email invalide' })
  email?: string;
}
