// ===========================================
// Service d'Authentification
// ===========================================

import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes, randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { UsersService } from '../users/users.service';
import { User, Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export type SafeUser = Omit<User, 'password'>;

export interface TokenResponse {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {}

  // ===========================================
  // Code d'échange OAuth
  // ===========================================
  // Le retour de Google et de Facebook est une redirection : le navigateur
  // suit une URL, et tout ce qu'elle contient entre dans l'historique, part
  // dans l'en-tête Referer vers les ressources tierces de la page d'arrivée,
  // et s'inscrit dans les journaux de chaque intermédiaire traversé.
  //
  // Les jetons ne transitent donc plus par l'URL. Elle ne porte qu'un code
  // opaque, sans valeur en soi, que le front échange contre les jetons par une
  // requête POST — dont le corps n'est ni journalisé ni historisé.

  /** Durée de vie du code. Le front l'échange dans la seconde qui suit. */
  private static readonly EXCHANGE_TTL_SECONDS = 60;

  private exchangeKey(code: string): string {
    return `oauth:exchange:${code}`;
  }

  /**
   * Met les jetons de côté et renvoie le code qui permettra de les retirer.
   *
   * 32 octets tirés du générateur cryptographique : un code devinable
   * donnerait une session complète à qui le trouverait.
   */
  async createOAuthExchangeCode(tokens: TokenResponse): Promise<string> {
    const code = randomBytes(32).toString('hex');
    await this.redis.set(
      this.exchangeKey(code),
      JSON.stringify(tokens),
      AuthService.EXCHANGE_TTL_SECONDS,
    );
    return code;
  }

  /**
   * Échange le code contre les jetons, une seule fois.
   *
   * La lecture et la suppression sont atomiques : deux requêtes simultanées ne
   * peuvent pas obtenir les mêmes jetons. Un code inconnu, expiré ou déjà
   * consommé donne le même refus, sans distinction — la nuance renseignerait
   * un attaquant sur ce qu'il a deviné juste.
   */
  async consumeOAuthExchangeCode(code: string): Promise<TokenResponse> {
    let charge: string | null;
    try {
      charge = await this.redis.getDel(this.exchangeKey(code));
    } catch (err) {
      // Sans magasin joignable, l'usage unique n'est plus garanti : on refuse
      // plutôt que de laisser passer.
      this.logger.error(`Echange OAuth impossible : ${(err as Error).message}`);
      throw new ForbiddenException('Connexion impossible. Veuillez réessayer.');
    }

    if (!charge) {
      throw new ForbiddenException('Code de connexion invalide ou expiré.');
    }

    return JSON.parse(charge) as TokenResponse;
  }

  /**
   * Valide les credentials d'un utilisateur
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user?.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _pw, ...safeUser } = user as any;
    return safeUser as User;
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(user: User): Promise<TokenResponse> {
    this.logger.log(`Connexion: ${user.email}`);
    return this.generateTokens(user);
  }

  /**
   * Rafraîchissement du token
   */
  async refreshToken(userId: string, refreshToken: string): Promise<TokenResponse> {
    // Vérifier le refresh token
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        token: refreshToken,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!storedToken) {
      // Convention projet : 403 et jamais 401, y compris hors des gardes.
      throw new ForbiddenException('Refresh token invalide ou expiré');
    }

    // Révoquer l'ancien refresh token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException('Utilisateur non trouvé');
    }

    return this.generateTokens(user);
  }

  /**
   * Déconnexion (révocation du refresh token)
   */
  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        token: refreshToken,
      },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Connexion/inscription via OAuth (Google/Facebook).
   * Retourne l'utilisateur (trouvé ou créé) ; la génération des tokens
   * est déléguée au controller via login() après le flux Passport.
   */
  async validateOAuthUser(profile: {
    provider: 'google' | 'facebook';
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
  }): Promise<User> {
    // Chercher l'utilisateur par provider ID ou email
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          profile.provider === 'google'
            ? { googleId: profile.providerId }
            : { facebookId: profile.providerId },
          { email: profile.email.toLowerCase() },
        ],
      },
    });

    if (user) {
      // Mettre à jour le provider ID si non défini
      const updateData: any = {};
      if (profile.provider === 'google' && !user.googleId) {
        updateData.googleId = profile.providerId;
      } else if (profile.provider === 'facebook' && !user.facebookId) {
        updateData.facebookId = profile.providerId;
      }

      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    } else {
      // Créer un nouvel utilisateur
      user = await this.prisma.user.create({
        data: {
          email: profile.email.toLowerCase().trim(),
          firstName: profile.firstName,
          lastName: profile.lastName,
          googleId: profile.provider === 'google' ? profile.providerId : undefined,
          facebookId: profile.provider === 'facebook' ? profile.providerId : undefined,
          consentData: true, // Implicite via OAuth
          role: 'CLIENT',
        },
      });

      this.logger.log(`Nouvel utilisateur OAuth (${profile.provider}): ${user.email}`);
    }

    return user;
  }

  /**
   * Génère les tokens JWT (access + refresh) et persiste le refresh token.
   * - Access token : signé avec JWT_SECRET, durée JWT_EXPIRATION (défaut 15m)
   * - Refresh token : signé avec JWT_REFRESH_SECRET, durée JWT_REFRESH_EXPIRATION (défaut 7d)
   */
  private async generateTokens(user: User): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessExpiration = this.configService.get<string>('JWT_EXPIRATION', '15m');
    const refreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessExpiration,
    } as any);

    // `jwtid` ajoute un claim `jti` unique : sans lui, deux refresh tokens
    // émis pour le même user dans la même seconde produisent une chaîne JWT
    // identique (mêmes claims sub/email/role/iat/exp) et violent la contrainte
    // UNIQUE sur refresh_tokens.token (Prisma P2002).
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshExpiration,
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      jwtid: randomUUID(),
    } as any);

    // Stocker le refresh token (permet la révocation côté serveur)
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: this.getTokenExpiry(refreshToken, 7 * 24 * 60 * 60),
      },
    });

    const { password: _pw, ...safeUser } = user as any;
    return {
      user: safeUser as SafeUser,
      accessToken,
      refreshToken,
      expiresIn: this.getTokenTtlSeconds(accessToken, 15 * 60),
    };
  }

  /**
   * Date d'expiration d'un JWT (depuis le claim `exp`), avec repli.
   */
  private getTokenExpiry(token: string, fallbackSeconds: number): Date {
    const decoded = this.jwtService.decode(token) as { exp?: number } | null;
    if (decoded?.exp) {
      return new Date(decoded.exp * 1000);
    }
    return new Date(Date.now() + fallbackSeconds * 1000);
  }

  /**
   * Durée de vie restante d'un JWT en secondes (depuis le claim `exp`), avec repli.
   */
  private getTokenTtlSeconds(token: string, fallbackSeconds: number): number {
    const decoded = this.jwtService.decode(token) as { exp?: number } | null;
    if (decoded?.exp) {
      return Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
    }
    return fallbackSeconds;
  }

  /**
   * Valide un JWT payload
   */
  async validateJwtPayload(payload: JwtPayload): Promise<User | null> {
    return this.usersService.findById(payload.sub);
  }
}
