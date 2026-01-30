// ===========================================
// Module Grand Prize (Tirage au sort)
// ===========================================

import { Module } from '@nestjs/common';
import { GrandPrizeController } from './grand-prize.controller';
import { GrandPrizeService } from './grand-prize.service';

@Module({
  controllers: [GrandPrizeController],
  providers: [GrandPrizeService],
  exports: [GrandPrizeService],
})
export class GrandPrizeModule {}
