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
      profileFields: ['id', 'email', 'name', 'picture'],
    } as any);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    // L'email peut être absent si le compte Facebook est un compte de test
    // sans email configuré, ou si l'utilisateur a une confidentialité stricte.
    // Dans ce cas on génère un email de substitution basé sur le Facebook ID.
    const email =
      emails?.[0]?.value ??
      (profile as any)._json?.email ??
      `fb_${id}@facebook-noreply.local`;

    if (!emails?.[0]?.value && !(profile as any)._json?.email) {
      console.warn(
        `[FacebookStrategy] Aucun email reçu pour le compte Facebook ID ${id}. Email de substitution utilisé.`,
      );
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
