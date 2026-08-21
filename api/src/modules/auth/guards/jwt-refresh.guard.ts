// ===========================================
// Guard - JWT Refresh
// ===========================================

import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  /**
   * Conformément aux specs projet : un refresh token absent, expiré ou révoqué
   * doit renvoyer HTTP 403 (Forbidden) et non 401 (Unauthorized), comme toute
   * autre route protégée.
   *
   * La stratégie lève une UnauthorizedException dont le message reste utile ;
   * seul le statut change.
   */
  handleRequest<TUser = any>(err: any, user: any, _info: any, _context: ExecutionContext): TUser {
    if (err || !user) {
      throw new ForbiddenException(
        (err as Error)?.message ?? 'Accès refusé : refresh token absent ou invalide',
      );
    }
    return user as TUser;
  }
}
