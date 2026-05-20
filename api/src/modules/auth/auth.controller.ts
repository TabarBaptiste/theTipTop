// ===========================================
// Contrôleur d'Authentification
// ===========================================

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

// Guards
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';

// Decorators
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { User } from '@prisma/client';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ===========================================
  // INSCRIPTION
  // ===========================================
  @Public()
  @Post('register')
  @ApiOperation({ summary: "Inscription d'un nouvel utilisateur" })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ===========================================
  // CONNEXION
  // ===========================================
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion avec email et mot de passe' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@CurrentUser() user: User) {
    return this.authService.login(user);
  }

  // ===========================================
  // REFRESH TOKEN
  // ===========================================
  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Rafraîchir le token d'accès" })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token rafraîchi',
  })
  @ApiResponse({ status: 401, description: 'Refresh token invalide' })
  async refreshToken(@CurrentUser() user: User, @Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(user.id, dto.refreshToken);
  }

  // ===========================================
  // DÉCONNEXION
  // ===========================================
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Déconnexion' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  async logout(@CurrentUser() user: User, @Body() dto: RefreshTokenDto) {
    await this.authService.logout(user.id, dto.refreshToken);
    return { message: 'Déconnexion réussie' };
  }

  // ===========================================
  // PROFIL UTILISATEUR CONNECTÉ
  // ===========================================
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Obtenir le profil de l'utilisateur connecté" })
  @ApiResponse({ status: 200, description: 'Profil utilisateur' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getProfile(@CurrentUser() user: User) {
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // ===========================================
  // OAUTH GOOGLE
  // ===========================================
  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initier la connexion Google OAuth' })
  @ApiResponse({ status: 302, description: 'Redirection vers Google' })
  async googleAuth() {
    // La redirection est gérée par Passport
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Callback Google OAuth' })
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const tokens = await this.authService.login(req.user);
    return this.redirectToFrontend(res, tokens.accessToken, tokens.refreshToken);
  }

  // ===========================================
  // OAUTH FACEBOOK
  // ===========================================
  @Public()
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Initier la connexion Facebook OAuth' })
  @ApiResponse({ status: 302, description: 'Redirection vers Facebook' })
  async facebookAuth() {
    // La redirection est gérée par Passport
  }

  @Public()
  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Callback Facebook OAuth' })
  async facebookAuthCallback(@Req() req: any, @Res() res: Response) {
    const tokens = await this.authService.login(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;

    return res.redirect(redirectUrl);
  }

  private redirectToFrontend(res: Response, accessToken: string, refreshToken: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;

    return res.redirect(redirectUrl);
  }
}
