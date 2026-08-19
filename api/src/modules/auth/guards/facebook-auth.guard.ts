// ===========================================
// Guard - Facebook OAuth
// ===========================================

import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

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
      // Un compte sans adresse ne passe plus par ici : la strategie lui attribue
      // une adresse de substitution et le laisse entrer. Ne restent donc que
      // les vraies pannes — code deja consomme, token expire, acces refuse.
      this.logger.error('Erreur OAuth sur le callback Facebook', err as Error);

      if (isCallback) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        response.redirect(`${frontendUrl}/auth/login?error=facebook_failed`);
        return false;
      }
      throw err;
    }
  }
}
