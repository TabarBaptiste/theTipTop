// ===========================================
// Tests unitaires - Rattachement d'une adresse reelle
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { User } from '@prisma/client';

import { EmailChangeService } from './email-change.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { MailService } from '../../mail/mail.service';

describe('EmailChangeService', () => {
  let service: EmailChangeService;

  const mockPrisma = {
    user: { findUnique: jest.fn(), update: jest.fn() },
  };
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
  };
  const mockMail = { sendEmailConfirmation: jest.fn() };

  // Compte Facebook sans adresse : le cas que cette fonctionnalite existe pour
  // traiter.
  const substitutionUser = {
    id: 'u1',
    email: 'fb_123@facebook-noreply.invalid',
  } as User;

  const joignableUser = { id: 'u2', email: 'jean@email.fr' } as User;

  /** Recupere la charge JSON ecrite dans Redis lors de la demande. */
  const storedPending = () => JSON.parse(mockRedis.set.mock.calls[0][1]);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailChangeService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: MailService, useValue: mockMail },
      ],
    }).compile();

    service = module.get(EmailChangeService);
    jest.clearAllMocks();

    // Etat par defaut : adresse libre, envoi reussi, pas de limite atteinte.
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockMail.sendEmailConfirmation.mockResolvedValue(true);
    mockRedis.incr.mockResolvedValue(1);
  });

  describe('request', () => {
    it('should refuse an account that already has a real address', async () => {
      await expect(service.request(joignableUser, 'autre@email.fr')).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockMail.sendEmailConfirmation).not.toHaveBeenCalled();
    });

    // Sans ce garde-fou, on validerait un compte qui ne recevra jamais rien.
    it('should refuse a substitution address as the new address', async () => {
      await expect(
        service.request(substitutionUser, 'fb_999@facebook-noreply.invalid'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should refuse an address already linked to another account', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'autre' });

      await expect(service.request(substitutionUser, 'pris@email.fr')).rejects.toThrow(
        ConflictException,
      );
      expect(mockMail.sendEmailConfirmation).not.toHaveBeenCalled();
    });

    it('should normalise the address and send a six-digit code', async () => {
      const result = await service.request(substitutionUser, '  Jean.Dupont@Email.FR ');

      expect(result.email).toBe('jean.dupont@email.fr');
      expect(storedPending().email).toBe('jean.dupont@email.fr');
      expect(storedPending().code).toMatch(/^\d{6}$/);

      const [to, code] = mockMail.sendEmailConfirmation.mock.calls[0];
      expect(to).toBe('jean.dupont@email.fr');
      expect(code).toBe(storedPending().code);
    });

    it('should start each request from a clean attempt counter', async () => {
      await service.request(substitutionUser, 'jean@email.fr');

      expect(mockRedis.del).toHaveBeenCalledWith('email-change-attempts:u1');
    });

    // Sans le code, l'utilisateur resterait devant un formulaire impossible a
    // remplir : mieux vaut echouer franchement.
    it('should discard the request when the email cannot be delivered', async () => {
      mockMail.sendEmailConfirmation.mockResolvedValue(false);

      await expect(service.request(substitutionUser, 'jean@email.fr')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRedis.del).toHaveBeenCalledWith('email-change:u1');
    });

    it('should cap the number of requests per hour', async () => {
      mockRedis.incr.mockResolvedValue(6);

      await expect(service.request(substitutionUser, 'jean@email.fr')).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockMail.sendEmailConfirmation).not.toHaveBeenCalled();
    });
  });

  describe('confirm', () => {
    const pending = JSON.stringify({ email: 'jean@email.fr', code: '123456' });

    it('should refuse when no request is pending', async () => {
      mockRedis.get.mockResolvedValue(null);

      await expect(service.confirm(substitutionUser, '123456')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should refuse a wrong code and count the attempt', async () => {
      mockRedis.get.mockResolvedValue(pending);
      mockRedis.incr.mockResolvedValue(1);

      await expect(service.confirm(substitutionUser, '000000')).rejects.toThrow(ForbiddenException);
      expect(mockRedis.incr).toHaveBeenCalledWith('email-change-attempts:u1');
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    // Le coeur de la protection : un code a six chiffres se parcourt en entier
    // par automatisation si rien ne plafonne les essais.
    it('should destroy the request after too many failed attempts', async () => {
      mockRedis.get.mockResolvedValue(pending);
      mockRedis.incr.mockResolvedValue(5);

      await expect(service.confirm(substitutionUser, '000000')).rejects.toThrow(ForbiddenException);
      expect(mockRedis.del).toHaveBeenCalledWith('email-change:u1', 'email-change-attempts:u1');
    });

    it('should refuse if the address was taken in the meantime', async () => {
      mockRedis.get.mockResolvedValue(pending);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'autre' });

      await expect(service.confirm(substitutionUser, '123456')).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('should attach the address and clear both keys', async () => {
      mockRedis.get.mockResolvedValue(pending);
      mockPrisma.user.update.mockResolvedValue({ ...substitutionUser, email: 'jean@email.fr' });

      const result = await service.confirm(substitutionUser, '123456');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { email: 'jean@email.fr' },
      });
      expect(result.email).toBe('jean@email.fr');
      expect(mockRedis.del).toHaveBeenCalledWith('email-change:u1', 'email-change-attempts:u1');
    });

    it('should refuse an account that already has a real address', async () => {
      await expect(service.confirm(joignableUser, '123456')).rejects.toThrow(ForbiddenException);
      expect(mockRedis.get).not.toHaveBeenCalled();
    });
  });
});
