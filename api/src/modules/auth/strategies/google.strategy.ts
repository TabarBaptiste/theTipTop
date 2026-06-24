// ===========================================
// Stratégie Google OAuth2
// ===========================================

import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    } as any);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const email = emails?.[0]?.value;
    if (!email) {
      return done(new Error('Email non fourni par Google'), false);
    }

    try {
      // Trouve ou crée l'utilisateur, puis le rattache à req.user.
      // Les tokens seront générés par le controller via authService.login().
      const user = await this.authService.validateOAuthUser({
        provider: 'google',
        providerId: id,
        email,
        firstName: name?.givenName || 'Utilisateur',
        lastName: name?.familyName || 'Google',
        picture: photos?.[0]?.value,
      });

      done(null, user);
    } catch (error) {
      done(error as Error, false);
    }
  }
}
