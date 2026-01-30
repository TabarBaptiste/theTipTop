// ===========================================
// Module Stats
// ===========================================

import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { ParticipationsModule } from '../participations/participations.module';

@Module({
  imports: [ParticipationsModule],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
