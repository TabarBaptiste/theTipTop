// ===========================================
// Module Participations
// ===========================================

import { Module } from '@nestjs/common';
import { ParticipationsController } from './participations.controller';
import { ParticipationsService } from './participations.service';
import { LeadsService } from './leads.service';
import { ParticipationJobsService } from './participation-jobs.service';
import { TicketsModule } from '../tickets/tickets.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../../mail/mail.module';

@Module({
  imports: [TicketsModule, AuthModule, MailModule],
  controllers: [ParticipationsController],
  providers: [ParticipationsService, LeadsService, ParticipationJobsService],
  exports: [ParticipationsService],
})
export class ParticipationsModule {}
