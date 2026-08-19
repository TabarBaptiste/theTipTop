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
