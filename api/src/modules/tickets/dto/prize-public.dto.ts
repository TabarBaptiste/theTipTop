// ===========================================
// DTO - Lot public (endpoint /tickets/prizes)
// ===========================================
// Ne retourne que les champs utiles côté client.
// Exclut : totalCount, timestamps, etc.

import { ApiProperty } from '@nestjs/swagger';

export class PrizePublicDto {
  @ApiProperty({ example: 'INFUSER' })
  code: string;

  @ApiProperty({ example: 'Infuseur à thé' })
  name: string;

  @ApiProperty({ example: 'Un élégant infuseur à thé en inox de qualité' })
  description: string;

  @ApiProperty({ example: '4,90€', nullable: true })
  value: string | null;

  @ApiProperty({ example: 60 })
  percentage: number;

  @ApiProperty({ example: 1 })
  displayOrder: number;

  @ApiProperty({ example: null, nullable: true })
  imageUrl: string | null;
}
