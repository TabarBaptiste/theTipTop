// ===========================================
// Module Principal
// ===========================================

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';

// Modules internes
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { ParticipationsModule } from './modules/participations/participations.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { GainsModule } from './modules/gains/gains.module';
import { StatsModule } from './modules/stats/stats.module';
import { GrandPrizeModule } from './modules/grand-prize/grand-prize.module';
import { AuditModule } from './modules/audit/audit.module';
import { GameConfigModule } from './modules/game-config/game-config.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting par IP, sur trois paliers : la rafale, la minute, l'heure
    // de pointe. Les plafonds sont configurables - sans quoi une campagne de
    // charge, émise depuis une seule adresse, ne mesurerait que le limiteur.
    // Les valeurs par défaut sont celles de production.
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'short',
          ttl: 1000,
          limit: config.get<number>('THROTTLE_SHORT_LIMIT', 3),
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: config.get<number>('THROTTLE_MEDIUM_LIMIT', 20),
        },
        {
          name: 'long',
          // Exprimé en secondes dans l'environnement, en millisecondes par
          // @nestjs/throttler depuis la v5.
          ttl: config.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    // Jobs planifiés (libération des réservations, relances, purge RGPD)
    ScheduleModule.forRoot(),

    // Database
    PrismaModule,

    // Health check
    HealthModule,

    // Cache
    RedisModule,

    // Features
    AuthModule,
    UsersModule,
    TicketsModule,
    ParticipationsModule,
    RegistrationModule,
    GainsModule,
    StatsModule,
    GrandPrizeModule,
    AuditModule,
    GameConfigModule,
    NewsletterModule,
  ],
  providers: [
    // Rate limiting global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
