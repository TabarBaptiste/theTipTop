// ===========================================
// DTO - Remise d'un lot
// ===========================================

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { DeliveryMethod } from '@prisma/client';

export class DeliverPrizeDto {
  @ApiProperty({
    enum: DeliveryMethod,
    example: 'IN_STORE',
    description: 'Méthode de remise du lot',
  })
  @IsEnum(DeliveryMethod)
  deliveryMethod: DeliveryMethod;
}
