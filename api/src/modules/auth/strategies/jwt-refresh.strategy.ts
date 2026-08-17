// ===========================================
// Stratégie JWT Refresh
// ===========================================

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    } as any);
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateJwtPayload(payload);
    if (!user) {
      throw new UnauthorizedException('Refresh token invalide');
    }
    return user;
  }
}
