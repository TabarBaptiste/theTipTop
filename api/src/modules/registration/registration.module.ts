// ===========================================
// Module Inscription
// ===========================================
// Ne fournit qu'un contrôleur : toute la logique vit dans LeadsService, partagé
// avec le tunnel de participation.

import { Module } from '@nestjs/common';
import { RegistrationController } from './registration.controller';
import { ParticipationsModule } from '../participations/participations.module';

@Module({
  imports: [ParticipationsModule],
  controllers: [RegistrationController],
})
export class RegistrationModule {}
