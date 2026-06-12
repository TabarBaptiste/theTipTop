// ===========================================
// Tests unitaires - Guards (JWT + Roles)
// ===========================================

import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

function createContext(user: unknown): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it('should allow public routes without authentication', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    expect(guard.canActivate(createContext(null))).toBe(true);
  });

  describe('handleRequest', () => {
    it('should throw HTTP 403 (convention projet, jamais 401) when no user', () => {
      expect(() => guard.handleRequest(null, null, null, createContext(null))).toThrow(
        ForbiddenException,
      );
    });

    it('should throw HTTP 403 on error', () => {
      expect(() =>
        guard.handleRequest(new Error('expired'), null, null, createContext(null)),
      ).toThrow(ForbiddenException);
    });

    it('should return the user when authenticated', () => {
      const user = { id: 'u1' };

      expect(guard.handleRequest(null, user, null, createContext(user))).toBe(user);
    });
  });
});

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no role is required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(createContext({ role: 'CLIENT' }))).toBe(true);
  });

  it('should allow access when the user has a required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN', 'EMPLOYEE']);

    expect(guard.canActivate(createContext({ role: 'ADMIN' }))).toBe(true);
  });

  it('should deny access when the user role does not match', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    expect(guard.canActivate(createContext({ role: 'CLIENT' }))).toBe(false);
  });

  it('should deny access when the user is missing on the request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    expect(guard.canActivate(createContext(undefined))).toBe(false);
  });
});
