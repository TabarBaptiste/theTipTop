// ===========================================
// Guard - Facebook OAuth
// ===========================================

import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuthMissingEmailError } from '../oauth-missing-email.error';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
  private readonly logger = new Logger(FacebookAuthGuard.name);

  /**
   * Redemande explicitement les permissions refusees.
   *
   * Facebook ne represente jamais une permission deja tranchee : une adresse
   * refusee au premier essai l'est silencieusement a tous les suivants, et la
   * personne ne comprend pas pourquoi rien ne change. auth_type=rerequest
   * rouvre l'ecran d'autorisation pour ces seules permissions ; celles deja
   * accordees ne sont pas redemandees.
   *
   * L'option se lit ici et non dans le constructeur de la strategie :
   * passport-facebook la resout depuis les options d'authentification
   * (authorizationParams), pas depuis sa configuration.
   */
  getAuthenticateOptions() {
    return { authType: 'rerequest' };
  }

  /**
   * Surcharge canActivate pour intercepter les erreurs OAuth sur le callback
   * (ex: code déjà utilisé, token expiré, accès refusé par l'utilisateur)
   * et rediriger proprement vers le frontend au lieu de renvoyer un 500.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // On n'intercepte les erreurs que sur la route de callback
    const isCallback = Boolean(request.query?.code || request.query?.error);

    try {
      return (await super.canActivate(context)) as boolean;
    } catch (err) {
      // Un compte sans adresse n'est pas une panne : c'est un cas prevu, qui
      // appelle un message specifique. Le confondre avec les autres echecs
      // laissait l'utilisateur devant un « la connexion a echoue » sans piste,
      // alors que la page sait expliquer ce cas precis et proposer Google ou
      // l'inscription par email.
      const missingEmail = err instanceof OAuthMissingEmailError;

      if (missingEmail) {
        this.logger.warn('Connexion Facebook sans adresse email : redirection avec explication.');
      } else {
        this.logger.error('Erreur OAuth sur le callback Facebook', err as Error);
      }

      if (isCallback) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const reason = missingEmail ? 'facebook_no_email' : 'facebook_failed';
        response.redirect(`${frontendUrl}/auth/login?error=${reason}`);
        return false;
      }
      throw err;
    }
  }
}
