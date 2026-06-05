// ===========================================
// Stratégie Facebook OAuth2
// ===========================================

import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.getOrThrow<string>('FACEBOOK_APP_SECRET'),
      callbackURL: configService.getOrThrow<string>('FACEBOOK_CALLBACK_URL'),
      scope: ['email'],
      profileFields: ['id', 'emails', 'name', 'photos'],
    } as any);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const email = emails?.[0]?.value;
    if (!email) {
      return done(new Error('Email non fourni par Facebook'), null);
    }

    try {
      // Trouve ou crée l'utilisateur, puis le rattache à req.user.
      // Les tokens seront générés par le controller via authService.login().
      const user = await this.authService.validateOAuthUser({
        provider: 'facebook',
        providerId: id,
        email,
        firstName: name?.givenName || 'Utilisateur',
        lastName: name?.familyName || 'Facebook',
        picture: photos?.[0]?.value,
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
