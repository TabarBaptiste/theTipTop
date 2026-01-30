// ===========================================
// Service d'Authentification
// ===========================================

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User, Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface TokenResponse {
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
  ) {}

  /**
   * Valide les credentials d'un utilisateur
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(dto: RegisterDto): Promise<TokenResponse> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        password: hashedPassword,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        gender: dto.gender,
        phone: dto.phone,
        consentEmail: dto.consentEmail ?? false,
        consentData: dto.consentData ?? false,
        role: 'CLIENT',
      },
    });

    this.logger.log(`Nouvel utilisateur inscrit: ${user.email}`);

    return this.generateTokens(user);
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
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    // Révoquer l'ancien refresh token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
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
   * Connexion/inscription via OAuth (Google/Facebook)
   */
  async validateOAuthUser(profile: {
    provider: 'google' | 'facebook';
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
  }): Promise<TokenResponse> {
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

    return this.generateTokens(user);
  }

  /**
   * Génère les tokens JWT
   */
  private async generateTokens(user: User): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Générer le refresh token
    const refreshTokenExpiry = this.configService.get<number>(
      'JWT_REFRESH_EXPIRES_IN',
      7 * 24 * 60 * 60, // 7 jours par défaut
    );
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshTokenExpiry,
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    // Stocker le refresh token
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + refreshTokenExpiry * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes en secondes
    };
  }

  /**
   * Valide un JWT payload
   */
  async validateJwtPayload(payload: JwtPayload): Promise<User | null> {
    return this.usersService.findById(payload.sub);
  }
}
