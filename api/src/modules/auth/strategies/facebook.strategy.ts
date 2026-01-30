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
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET'),
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL'),
      scope: ['email'],
      profileFields: ['id', 'emails', 'name', 'photos'],
    });
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

    await this.authService.validateOAuthUser({
      provider: 'facebook',
      providerId: id,
      email,
      firstName: name?.givenName || 'Utilisateur',
      lastName: name?.familyName || 'Facebook',
      picture: photos?.[0]?.value,
    });

    // Pour le callback, on retourne l'utilisateur trouvé/créé
    const user = await this.authService.validateJwtPayload({
      sub: '',
      email,
      role: 'CLIENT',
    });

    done(null, user);
  }
}
