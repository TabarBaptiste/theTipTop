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
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
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

    const result = await this.authService.validateOAuthUser({
      provider: 'google',
      providerId: id,
      email,
      firstName: name?.givenName || 'Utilisateur',
      lastName: name?.familyName || 'Google',
      picture: photos?.[0]?.value,
    });

    // Pour le callback, on retourne l'utilisateur trouvé/créé
    const user = await this.authService.validateJwtPayload({
      sub: '', // Sera extrait du token
      email,
      role: 'CLIENT',
    });

    done(null, user || undefined);
  }
}
