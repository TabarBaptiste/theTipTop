// ===========================================
// Module d'Authentification
// ===========================================

import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SignOptions } from 'jsonwebtoken';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailChangeService } from './email-change.service';
import { UsersModule } from '../users/users.module';
// Redis et Prisma sont globaux, MailModule ne l'est pas : il doit etre importe.
import { MailModule } from '../../mail/mail.module';

// Strategies
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';

const logger = new Logger('AuthModule');

// Factory pour Google Strategy (optionnel)
const GoogleStrategyFactory = {
  provide: 'GOOGLE_STRATEGY',
  useFactory: (configService: ConfigService, authService: AuthService) => {
    const clientId = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (clientId && clientSecret && !clientId.includes('your-google')) {
      logger.log('Google OAuth strategy enabled');
      return new GoogleStrategy(configService, authService);
    }
    logger.warn('Google OAuth strategy disabled - credentials not configured');
    return null;
  },
  inject: [ConfigService, AuthService],
};

// Factory pour Facebook Strategy (optionnel)
const FacebookStrategyFactory = {
  provide: 'FACEBOOK_STRATEGY',
  useFactory: (configService: ConfigService, authService: AuthService) => {
    const appId = configService.get<string>('FACEBOOK_APP_ID');
    const appSecret = configService.get<string>('FACEBOOK_APP_SECRET');

    if (appId && appSecret && !appId.includes('your-facebook')) {
      logger.log('Facebook OAuth strategy enabled');
      return new FacebookStrategy(configService, authService);
    }
    logger.warn('Facebook OAuth strategy disabled - credentials not configured');
    return null;
  },
  inject: [ConfigService, AuthService],
};

@Module({
  imports: [
    UsersModule,
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '15m') as SignOptions['expiresIn'],
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailChangeService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategyFactory,
    FacebookStrategyFactory,
  ],
  exports: [AuthService],
})
export class AuthModule {}
