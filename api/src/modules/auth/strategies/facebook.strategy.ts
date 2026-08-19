// ===========================================
// Stratégie Facebook OAuth2
// ===========================================

import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { buildPlaceholderEmail } from '../placeholder-email';

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
    let email = emails?.[0]?.value ?? (profile as any)._json?.email;

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
    // Facebook ne transmet pas toujours d'adresse : compte cree avec un numero
    // de telephone, permission refusee, compte de test, ou compte ancien.
    //
    // On n'interdit pas la connexion pour autant, sinon ces personnes n'ont
    // aucun moyen d'entrer. Une adresse de substitution est fabriquee, et
    // l'application reclamera une vraie adresse avant toute participation :
    // isPlaceholderEmail sert de garde a cet endroit.
    if (!email) {
      // Noms des champs seulement, jamais leur contenu : « email » absent
      // signale une permission non accordee, « email » vide un compte sans
      // adresse confirmee. La distinction guide le message d'aide.
      const champsRecus = Object.keys((profile as any)._json ?? {}).sort();
      this.logger.warn(
        `Compte Facebook ${id} sans adresse email : adresse de substitution utilisee. ` +
          `Champs transmis par Meta : ${champsRecus.length ? champsRecus.join(', ') : 'aucun'}.`,
      );
      email = buildPlaceholderEmail(id);
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
