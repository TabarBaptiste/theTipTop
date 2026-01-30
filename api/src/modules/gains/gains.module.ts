// ===========================================
// Module Gains (Remise des lots)
// ===========================================

import { Module } from '@nestjs/common';
import { GainsController } from './gains.controller';
import { GainsService } from './gains.service';

@Module({
  controllers: [GainsController],
  providers: [GainsService],
  exports: [GainsService],
})
export class GainsModule {}
