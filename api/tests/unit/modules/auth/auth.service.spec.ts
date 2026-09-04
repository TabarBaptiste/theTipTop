// ===========================================
// Tests unitaires - Auth Service
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '@/modules/users/users.service';

describe('AuthService', () => {
  let service: AuthService;

  const futureExp = Math.floor(Date.now() / 1000) + 900;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn(),
    decode: jest.fn().mockReturnValue({ exp: futureExp }),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, fallback?: unknown) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_EXPIRATION: '15m',
        JWT_REFRESH_EXPIRATION: '7d',
        FRONTEND_URL: 'http://localhost:3000',
      };
      return config[key] ?? fallback;
    }),
    getOrThrow: jest.fn((key: string) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
      };
      return config[key];
    }),
  };

  const mockRedisService = {
    set: jest.fn(),
    getDel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
    mockJwtService.sign.mockReturnValue('mock-token');
    mockJwtService.decode.mockReturnValue({ exp: futureExp });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================
  // validateUser
  // ===========================================
  describe('validateUser', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: bcrypt.hashSync('password123', 10),
      firstName: 'Test',
      lastName: 'User',
      role: 'CLIENT',
    };

    it('should return user (without password) if credentials are valid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result?.email).toBe(mockUser.email);
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('notfound@example.com', 'password');
      expect(result).toBeNull();
    });

    it('should return null if user has no password (OAuth-only account)', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ ...mockUser, password: null });

      const result = await service.validateUser('test@example.com', 'password123');
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  // ===========================================
  // login + génération du JWT
  // ===========================================
  describe('login', () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      role: 'CLIENT',
      firstName: 'Test',
      lastName: 'User',
    } as any;

    it('should return a valid token set with the public user info', async () => {
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.login(user);

      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(result.expiresIn).toBeGreaterThan(0);
      expect(result.user.email).toBe(user.email);
      expect(result.user).not.toHaveProperty('password');
      // sub/email/role dans le payload
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: user.id, email: user.email, role: user.role }),
        expect.anything(),
      );
      // refresh token persisté
      expect(mockPrismaService.refreshToken.create).toHaveBeenCalled();
    });
  });

  // ===========================================
  // refreshToken
  // ===========================================
  describe('refreshToken', () => {
    it('should rotate the token when the refresh token is valid', async () => {
      mockPrismaService.refreshToken.findFirst.mockResolvedValue({
        id: 'rt1',
        userId: '1',
        token: 'old-token',
      });
      mockPrismaService.refreshToken.update.mockResolvedValue({});
      mockUsersService.findById.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'CLIENT',
      });
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.refreshToken('1', 'old-token');

      expect(result).toHaveProperty('accessToken');
      expect(mockPrismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'rt1' },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('should throw ForbiddenException if the refresh token is unknown/expired', async () => {
      mockPrismaService.refreshToken.findFirst.mockResolvedValue(null);

      await expect(service.refreshToken('1', 'bad-token')).rejects.toThrow(ForbiddenException);
    });
  });

  // ===========================================
  // logout
  // ===========================================
  describe('logout', () => {
    it('should revoke the refresh token', async () => {
      mockPrismaService.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      await service.logout('1', 'some-token');

      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: '1', token: 'some-token' },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  // ===========================================
  // Code d'echange OAuth
  // ===========================================
  describe('code d echange OAuth', () => {
    const jetons = {
      user: { id: '1' },
      accessToken: 'acces',
      refreshToken: 'rafraichissement',
      expiresIn: 900,
    } as never;

    it('produit un code imprevisible et le range avec une duree de vie courte', async () => {
      const code = await service.createOAuthExchangeCode(jetons);

      // 32 octets en hexadecimal : un code devinable donnerait une session
      // complete a qui le trouverait.
      expect(code).toMatch(/^[a-f0-9]{64}$/);

      const [cle, charge, ttl] = mockRedisService.set.mock.calls[0];
      expect(cle).toBe(`oauth:exchange:${code}`);
      expect(JSON.parse(charge)).toEqual(jetons);
      expect(ttl).toBe(60);
    });

    it('ne produit jamais deux fois le meme code', async () => {
      const premier = await service.createOAuthExchangeCode(jetons);
      const second = await service.createOAuthExchangeCode(jetons);

      expect(premier).not.toBe(second);
    });

    it('rend les jetons et consomme le code dans la meme operation', async () => {
      mockRedisService.getDel.mockResolvedValue(JSON.stringify(jetons));

      const resultat = await service.consumeOAuthExchangeCode('a'.repeat(64));

      expect(resultat).toEqual(jetons);
      // getDel et non get puis del : deux requetes simultanees ne doivent pas
      // pouvoir obtenir les memes jetons.
      expect(mockRedisService.getDel).toHaveBeenCalledWith(`oauth:exchange:${'a'.repeat(64)}`);
    });

    it('refuse un code inconnu, expire ou deja consomme', async () => {
      mockRedisService.getDel.mockResolvedValue(null);

      await expect(service.consumeOAuthExchangeCode('b'.repeat(64))).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('refuse plutot que de laisser passer quand le magasin est injoignable', async () => {
      mockRedisService.getDel.mockRejectedValue(new Error('redis indisponible'));

      // Sans magasin, l'usage unique n'est plus garanti : laisser passer
      // reviendrait a accepter un code rejouable.
      await expect(service.consumeOAuthExchangeCode('c'.repeat(64))).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ===========================================
  // validateOAuthUser
  // ===========================================
  describe('validateOAuthUser', () => {
    const profile = {
      provider: 'google' as const,
      providerId: 'google-123',
      email: 'oauth@example.com',
      firstName: 'OAuth',
      lastName: 'User',
    };

    it('should create a new user when none exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '3',
        email: profile.email,
        googleId: profile.providerId,
        role: 'CLIENT',
      });

      const result = await service.validateOAuthUser(profile);

      expect(result.id).toBe('3');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should link the provider id to an existing account (same email)', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: '4',
        email: profile.email,
        googleId: null,
      });
      mockPrismaService.user.update.mockResolvedValue({
        id: '4',
        email: profile.email,
        googleId: profile.providerId,
      });

      const result = await service.validateOAuthUser(profile);

      expect(result.googleId).toBe(profile.providerId);
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });
  });

  // ===========================================
  // validateJwtPayload
  // ===========================================
  describe('validateJwtPayload', () => {
    it('should resolve the user from the payload sub', async () => {
      mockUsersService.findById.mockResolvedValue({ id: '1', email: 'test@example.com' });

      const result = await service.validateJwtPayload({
        sub: '1',
        email: 'test@example.com',
        role: 'CLIENT' as any,
      });

      expect(result?.id).toBe('1');
      expect(mockUsersService.findById).toHaveBeenCalledWith('1');
    });
  });
});
