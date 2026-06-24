// ===========================================
// Tests unitaires - Stratégies Passport
// ===========================================

import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { GoogleStrategy } from './google.strategy';
import { FacebookStrategy } from './facebook.strategy';
import { AuthService } from '../auth.service';

const mockConfigService = {
  getOrThrow: jest.fn((key: string) => {
    const config: Record<string, string> = {
      JWT_SECRET: 'test-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      GOOGLE_CLIENT_ID: 'google-id',
      GOOGLE_CLIENT_SECRET: 'google-secret',
      GOOGLE_CALLBACK_URL: 'http://localhost:3001/api/v1/auth/google/callback',
      FACEBOOK_APP_ID: 'fb-id',
      FACEBOOK_APP_SECRET: 'fb-secret',
      FACEBOOK_CALLBACK_URL: 'http://localhost:3001/api/v1/auth/facebook/callback',
    };
    return config[key];
  }),
} as unknown as ConfigService;

const mockAuthService = {
  validateUser: jest.fn(),
  validateJwtPayload: jest.fn(),
  validateOAuthUser: jest.fn(),
} as unknown as AuthService & {
  validateUser: jest.Mock;
  validateJwtPayload: jest.Mock;
  validateOAuthUser: jest.Mock;
};

const payload = { sub: 'u1', email: 'jean@email.fr', role: 'CLIENT' as const };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LocalStrategy', () => {
  const strategy = new LocalStrategy(mockAuthService);

  it('should return the user for valid credentials', async () => {
    mockAuthService.validateUser.mockResolvedValue({ id: 'u1', deletedAt: null });

    const user = await strategy.validate('jean@email.fr', 'password');

    expect(user.id).toBe('u1');
  });

  it('should throw UnauthorizedException for invalid credentials', async () => {
    mockAuthService.validateUser.mockResolvedValue(null);

    await expect(strategy.validate('jean@email.fr', 'wrong')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException for a soft-deleted account', async () => {
    mockAuthService.validateUser.mockResolvedValue({ id: 'u1', deletedAt: new Date() });

    await expect(strategy.validate('jean@email.fr', 'password')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

describe('JwtStrategy', () => {
  const strategy = new JwtStrategy(mockConfigService, mockAuthService);

  it('should resolve the user from the payload', async () => {
    mockAuthService.validateJwtPayload.mockResolvedValue({ id: 'u1', deletedAt: null });

    const user = await strategy.validate(payload);

    expect(user.id).toBe('u1');
  });

  it('should reject an unknown user', async () => {
    mockAuthService.validateJwtPayload.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('should reject a soft-deleted account', async () => {
    mockAuthService.validateJwtPayload.mockResolvedValue({ id: 'u1', deletedAt: new Date() });

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });
});

describe('JwtRefreshStrategy', () => {
  const strategy = new JwtRefreshStrategy(mockConfigService, mockAuthService);

  it('should resolve the user from the payload', async () => {
    mockAuthService.validateJwtPayload.mockResolvedValue({ id: 'u1' });

    const user = await strategy.validate(payload);

    expect(user.id).toBe('u1');
  });

  it('should reject an unknown user', async () => {
    mockAuthService.validateJwtPayload.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });
});

describe('GoogleStrategy', () => {
  const strategy = new GoogleStrategy(mockConfigService, mockAuthService);

  it('should create/find the user and call done with it', async () => {
    mockAuthService.validateOAuthUser.mockResolvedValue({ id: 'u1' });
    const done = jest.fn();

    await strategy.validate(
      'access',
      'refresh',
      {
        id: 'g1',
        name: { givenName: 'Jean', familyName: 'Dupont' },
        emails: [{ value: 'jean@gmail.com' }],
        photos: [],
      } as never,
      done,
    );

    expect(mockAuthService.validateOAuthUser).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'google', providerId: 'g1', email: 'jean@gmail.com' }),
    );
    expect(done).toHaveBeenCalledWith(null, { id: 'u1' });
  });

  it('should fail when Google does not provide an email', async () => {
    const done = jest.fn();

    await strategy.validate('access', 'refresh', { id: 'g1', emails: [] } as never, done);

    expect(done).toHaveBeenCalledWith(expect.any(Error), false);
  });

  it('should propagate service errors through done', async () => {
    mockAuthService.validateOAuthUser.mockRejectedValue(new Error('db down'));
    const done = jest.fn();

    await strategy.validate(
      'access',
      'refresh',
      { id: 'g1', emails: [{ value: 'jean@gmail.com' }] } as never,
      done,
    );

    expect(done).toHaveBeenCalledWith(expect.any(Error), false);
  });
});

describe('FacebookStrategy', () => {
  const strategy = new FacebookStrategy(mockConfigService, mockAuthService);

  it('should create/find the user with the profile email', async () => {
    mockAuthService.validateOAuthUser.mockResolvedValue({ id: 'u1' });
    const done = jest.fn();

    await strategy.validate(
      'access',
      'refresh',
      {
        id: 'f1',
        name: { givenName: 'Jean', familyName: 'Dupont' },
        emails: [{ value: 'jean@fb.com' }],
        photos: [],
      } as never,
      done,
    );

    expect(mockAuthService.validateOAuthUser).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'facebook', providerId: 'f1', email: 'jean@fb.com' }),
    );
    expect(done).toHaveBeenCalledWith(null, { id: 'u1' });
  });

  it('should fall back to a substitution email when Facebook provides none', async () => {
    mockAuthService.validateOAuthUser.mockResolvedValue({ id: 'u1' });
    const done = jest.fn();

    await strategy.validate('access', 'refresh', { id: 'f1', _json: {} } as never, done);

    expect(mockAuthService.validateOAuthUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'fb_f1@facebook-noreply.local' }),
    );
  });

  it('should propagate service errors through done', async () => {
    mockAuthService.validateOAuthUser.mockRejectedValue(new Error('db down'));
    const done = jest.fn();

    await strategy.validate(
      'access',
      'refresh',
      { id: 'f1', emails: [{ value: 'jean@fb.com' }] } as never,
      done,
    );

    expect(done).toHaveBeenCalledWith(expect.any(Error), null);
  });
});
