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
import { type Request, type Response } from 'express';

import { AuthService } from './auth.service';
import { EmailChangeService } from './email-change.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestEmailChangeDto, ConfirmEmailChangeDto } from './dto/email-change.dto';

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

type OAuthRequest = Request & { user: User };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailChangeService: EmailChangeService,
  ) {}

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
  @ApiResponse({ status: 403, description: 'Identifiants invalides' })
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
  @ApiResponse({ status: 403, description: 'Refresh token invalide' })
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
  @ApiResponse({ status: 403, description: 'Non authentifié' })
  async getProfile(@CurrentUser() user: User) {
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // ===========================================
  // RATTACHEMENT D'UNE ADRESSE REELLE
  // ===========================================
  // Reserve aux comptes crees par un fournisseur qui n'a transmis aucune
  // adresse : ils fonctionnent sous une adresse de substitution injoignable.
  @UseGuards(JwtAuthGuard)
  @Post('email/request')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Envoyer un code de confirmation a une nouvelle adresse' })
  @ApiResponse({ status: 200, description: 'Code envoye a l’adresse indiquee' })
  @ApiResponse({ status: 400, description: 'Adresse invalide ou envoi impossible' })
  @ApiResponse({
    status: 403,
    description: 'Compte deja pourvu d’une adresse, ou trop de demandes',
  })
  @ApiResponse({ status: 409, description: 'Adresse deja associee a un compte' })
  async requestEmailChange(@CurrentUser() user: User, @Body() dto: RequestEmailChangeDto) {
    return this.emailChangeService.request(user, dto.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('email/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Confirmer la nouvelle adresse a l'aide du code recu" })
  @ApiResponse({ status: 200, description: 'Adresse rattachee au compte' })
  @ApiResponse({ status: 400, description: 'Aucune demande en cours ou delai depasse' })
  @ApiResponse({ status: 403, description: 'Code incorrect ou trop d’essais' })
  @ApiResponse({ status: 409, description: 'Adresse prise entre-temps' })
  async confirmEmailChange(@CurrentUser() user: User, @Body() dto: ConfirmEmailChangeDto) {
    const updated = await this.emailChangeService.confirm(user, dto.code);
    const { password: _password, ...userWithoutPassword } = updated;
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
  async googleAuthCallback(@Req() req: OAuthRequest, @Res() res: Response) {
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
  async facebookAuthCallback(@Req() req: OAuthRequest, @Res() res: Response) {
    if (!req.user) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/auth/login?error=facebook_no_email`);
    }
    const tokens = await this.authService.login(req.user);
    return this.redirectToFrontend(res, tokens.accessToken, tokens.refreshToken);
  }

  private redirectToFrontend(res: Response, accessToken: string, refreshToken: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;

    return res.redirect(redirectUrl);
  }
}
