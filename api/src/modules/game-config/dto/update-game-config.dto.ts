// ===========================================
// DTO - Mise à jour de la configuration du jeu
// ===========================================

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateGameConfigDto {
  @ApiPropertyOptional({
    example: '2026-06-05T00:00:00.000Z',
    description: 'Date de début du jeu-concours',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-10-05T00:00:00.000Z',
    description: 'Date de fin de la période de participation',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: '2026-11-04T00:00:00.000Z',
    description: 'Date limite de réclamation des lots',
  })
  @IsOptional()
  @IsDateString()
  claimEndDate?: string;
}
