// ===========================================
// Module Principal
// ===========================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { GainsModule } from './modules/gains/gains.module';
import { StatsModule } from './modules/stats/stats.module';
import { GrandPrizeModule } from './modules/grand-prize/grand-prize.module';
import { AuditModule } from './modules/audit/audit.module';
import { GameConfigModule } from './modules/game-config/game-config.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting (100 requêtes par minute par IP)
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

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
    GainsModule,
    StatsModule,
    GrandPrizeModule,
    AuditModule,
    GameConfigModule,
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
