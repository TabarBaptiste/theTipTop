// ===========================================
// Guard - Authentification locale
// ===========================================

import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  /**
   * Conformément aux specs projet : jamais de 401, y compris sur l'échec
   * d'authentification lui-même. Le message de la stratégie est conservé -
   * volontairement identique pour un mot de passe faux et pour une adresse
   * inconnue, afin de ne pas permettre d'énumérer les comptes.
   */
  handleRequest<TUser = any>(err: any, user: any, _info: any, _context: ExecutionContext): TUser {
    if (err || !user) {
      throw new ForbiddenException(
        (err as Error)?.message ?? 'Accès refusé : identifiants invalides',
      );
    }
    return user as TUser;
  }
}
