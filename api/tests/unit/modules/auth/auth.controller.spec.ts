// ===========================================
// Tests unitaires - Auth Controller
// ===========================================

import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { EmailChangeService } from '@/modules/auth/email-change.service';
import { User } from '@prisma/client';
import { type Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    createOAuthExchangeCode: jest.fn(),
    consumeOAuthExchangeCode: jest.fn(),
  };

  const user = {
    id: 'u1',
    email: 'jean@email.fr',
    password: 'hashed',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'CLIENT',
  } as User;

  const mockEmailChangeService = {
    request: jest.fn(),
    confirm: jest.fn(),
  };

  const tokens = { accessToken: 'at', refreshToken: 'rt', expiresIn: 900, user };

  const createRes = () => ({ redirect: jest.fn() }) as unknown as Response;

  beforeEach(() => {
    controller = new AuthController(
      mockAuthService as unknown as AuthService,
      mockEmailChangeService as unknown as EmailChangeService,
    );
    jest.clearAllMocks();
    process.env.FRONTEND_URL = 'http://localhost:3000';
  });

  it('register should delegate to the service', async () => {
    mockAuthService.register.mockResolvedValue(tokens);
    const dto = { email: 'jean@email.fr', password: 'Password123!' };

    const result = await controller.register(dto as never);

    expect(result).toBe(tokens);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  it('login should generate tokens for the validated user', async () => {
    mockAuthService.login.mockResolvedValue(tokens);

    const result = await controller.login(user);

    expect(result).toBe(tokens);
    expect(mockAuthService.login).toHaveBeenCalledWith(user);
  });

  it('refreshToken should rotate the token', async () => {
    mockAuthService.refreshToken.mockResolvedValue(tokens);

    await controller.refreshToken(user, { refreshToken: 'rt' });

    expect(mockAuthService.refreshToken).toHaveBeenCalledWith('u1', 'rt');
  });

  it('logout should revoke the refresh token', async () => {
    const result = await controller.logout(user, { refreshToken: 'rt' });

    expect(mockAuthService.logout).toHaveBeenCalledWith('u1', 'rt');
    expect(result.message).toContain('Déconnexion');
  });

  it('getProfile should never expose the password hash', async () => {
    const result = await controller.getProfile(user);

    expect(result).not.toHaveProperty('password');
    expect(result.email).toBe('jean@email.fr');
  });

  it('googleAuth / facebookAuth are handled by Passport (no-op)', async () => {
    await expect(controller.googleAuth()).resolves.toBeUndefined();
    await expect(controller.facebookAuth()).resolves.toBeUndefined();
  });

  it('googleAuthCallback redirige avec un code d echange, jamais avec les jetons', async () => {
    mockAuthService.login.mockResolvedValue(tokens);
    mockAuthService.createOAuthExchangeCode.mockResolvedValue('code-opaque');
    const res = createRes();

    await controller.googleAuthCallback({ user } as never, res);

    expect(mockAuthService.createOAuthExchangeCode).toHaveBeenCalledWith(tokens);
    expect(res.redirect).toHaveBeenCalledWith(
      'http://localhost:3000/auth/callback?code=code-opaque',
    );

    // Le point essentiel : une URL de redirection entre dans l'historique du
    // navigateur, l'en-tete Referer et les journaux des intermediaires. Aucun
    // jeton ne doit s'y trouver.
    const url = (res.redirect as jest.Mock).mock.calls[0][0] as string;
    expect(url).not.toContain(tokens.accessToken);
    expect(url).not.toContain(tokens.refreshToken);
  });

  it('facebookAuthCallback redirige lui aussi avec un code d echange', async () => {
    mockAuthService.login.mockResolvedValue(tokens);
    mockAuthService.createOAuthExchangeCode.mockResolvedValue('autre-code');
    const res = createRes();

    await controller.facebookAuthCallback({ user } as never, res);

    const url = (res.redirect as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('/auth/callback?code=autre-code');
    expect(url).not.toContain(tokens.refreshToken);
  });

  it('echange le code contre les jetons', async () => {
    mockAuthService.consumeOAuthExchangeCode.mockResolvedValue(tokens);

    const resultat = await controller.exchangeOAuthCode({ code: 'a'.repeat(64) });

    expect(resultat).toEqual(tokens);
    expect(mockAuthService.consumeOAuthExchangeCode).toHaveBeenCalledWith('a'.repeat(64));
  });

  it('facebookAuthCallback should redirect to the login page when no user (email missing)', async () => {
    const res = createRes();

    await controller.facebookAuthCallback({ user: undefined } as never, res);

    expect(res.redirect).toHaveBeenCalledWith(
      'http://localhost:3000/auth/login?error=facebook_no_email',
    );
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });
});
