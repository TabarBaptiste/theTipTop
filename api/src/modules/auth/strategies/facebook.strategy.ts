// ===========================================
// Stratégie Facebook OAuth2
// ===========================================

import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { Injectable, Logger } from '@nestjs/common';
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

  private readonly logger = new Logger(FacebookStrategy.name);

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    // Facebook ne renvoie pas toujours d'adresse : compte cree avec un numero
    // de telephone, permission email refusee, ou compte de test sans email.
    const email = emails?.[0]?.value ?? (profile as any)._json?.email;

    // On refuse, comme le fait deja la strategie Google.
    //
    // La version precedente fabriquait une adresse a partir du Facebook ID.
    // Le compte etait alors cree mais injoignable, dans un jeu ou tout passe
    // par l'email : code de confirmation, annonce du lot, relances. Le
    // participant aurait gagne sans jamais l'apprendre, et sans pouvoir
    // reclamer son lot dans les trente jours.
    //
    // Le refus n'est pas un cul-de-sac : le controleur redirige vers
    // /auth/login?error=facebook_no_email, ou la page invite a passer par
    // Google ou par email et mot de passe. Ce chemin existait deja mais ne
    // pouvait jamais s'executer, la strategie renvoyant toujours un utilisateur.
    if (!email) {
      this.logger.warn(
        `Connexion Facebook refusee pour le compte ${id} : aucune adresse email fournie.`,
      );
      return done(new Error('Facebook n a fourni aucune adresse email'), false);
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
