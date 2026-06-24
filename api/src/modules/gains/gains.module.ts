// ===========================================
// Module Gains (Remise des lots)
// ===========================================

import { Module } from '@nestjs/common';
import { GainsController } from './gains.controller';
import { GainsService } from './gains.service';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [TicketsModule],
  controllers: [GainsController],
  providers: [GainsService],
  exports: [GainsService],
})
export class GainsModule {}
