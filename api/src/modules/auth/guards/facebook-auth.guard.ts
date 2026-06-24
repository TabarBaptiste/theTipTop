// ===========================================
// Guard - Facebook OAuth
// ===========================================

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
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
      console.error('[FacebookAuthGuard] Erreur OAuth sur le callback:', err);
      if (isCallback) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        response.redirect(`${frontendUrl}/auth/login?error=facebook_failed`);
        return false;
      }
      throw err;
    }
  }
}
