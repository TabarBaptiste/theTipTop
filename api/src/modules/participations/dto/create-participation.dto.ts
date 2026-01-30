// ===========================================
// DTO - Créer une participation
// ===========================================

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class CreateParticipationDto {
  @ApiProperty({
    example: 'ABC123XYZ9',
    description: 'Code à 10 caractères présent sur le ticket de caisse',
  })
  @IsString()
  @Length(10, 10, { message: 'Le code doit contenir exactement 10 caractères' })
  @Matches(/^[A-Za-z0-9]{10}$/, {
    message: 'Le code doit contenir uniquement des lettres et des chiffres',
  })
  code: string;
}
