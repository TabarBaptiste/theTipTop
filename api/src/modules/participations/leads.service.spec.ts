// ===========================================
// Tests unitaires - LeadsService (tunnel UC-05)
// ===========================================

import { BadRequestException, ConflictException, HttpException } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { MailService } from '../../mail/mail.service';
import { TicketsService } from '../tickets/tickets.service';
import { AuthService } from '../auth/auth.service';

describe('LeadsService', () => {
  let service: LeadsService;

  const mockPrisma = {
    lead: { create: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    ticket: { updateMany: jest.fn(), findFirst: jest.fn() },
    user: { findUnique: jest.fn(), create: jest.fn() },
    participation: { create: jest.fn() },
    $transaction: jest.fn(),
  };

  const mockRedis = { incr: jest.fn(), expire: jest.fn() };
  const mockMail = { sendVerificationCode: jest.fn() };
  const mockTickets = { verifyCode: jest.fn(), getPrizesMap: jest.fn() };
  const mockAuth = { login: jest.fn() };

  const validDto = {
    code: 'ABCDEFGH23',
    email: 'Jean.Dupont@Email.FR',
    firstName: 'Jean',
    lastName: 'Dupont',
    consentData: true,
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LeadsService(
      mockPrisma as unknown as PrismaService,
      mockRedis as unknown as RedisService,
      mockMail as unknown as MailService,
      mockTickets as unknown as TicketsService,
      mockAuth as unknown as AuthService,
    );
    mockRedis.incr.mockResolvedValue(1);
    // Par défaut la transaction exécute simplement le callback avec les mocks.
    mockPrisma.$transaction.mockImplementation(async (cb: never) =>
      (cb as unknown as (tx: unknown) => unknown)(mockPrisma),
    );
  });

  describe('initiate', () => {
    it('crée le lead, réserve le ticket et envoie le code', async () => {
      mockTickets.verifyCode.mockResolvedValue({ isValid: true, ticket: { id: 't1' } });
      mockPrisma.lead.findFirst.mockResolvedValue(null);
      mockPrisma.lead.create.mockResolvedValue({ id: 'l1' });
      mockPrisma.ticket.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.initiate(validDto, '10.0.0.1');

      expect(result.leadId).toBe('l1');
      // RG-09 : deux premiers caractères puis domaine complet.
      expect(result.maskedEmail).toBe('je*********@email.fr');
      // L'email est normalisé avant stockage.
      expect(mockPrisma.lead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'jean.dupont@email.fr' }),
        }),
      );
      expect(mockMail.sendVerificationCode).toHaveBeenCalled();
    });

    it('génère un code à 6 chiffres', async () => {
      mockTickets.verifyCode.mockResolvedValue({ isValid: true, ticket: { id: 't1' } });
      mockPrisma.lead.findFirst.mockResolvedValue(null);
      mockPrisma.lead.create.mockResolvedValue({ id: 'l1' });
      mockPrisma.ticket.updateMany.mockResolvedValue({ count: 1 });

      await service.initiate(validDto, '10.0.0.1');

      const code = mockMail.sendVerificationCode.mock.calls[0][1];
      expect(code).toMatch(/^\d{6}$/);
    });

    // RG-01 : une adresse déjà active ne doit rien révéler ni rien consommer.
    it('applique le mode silencieux sans créer de lead ni réserver de ticket', async () => {
      mockTickets.verifyCode.mockResolvedValue({ isValid: true, ticket: { id: 't1' } });
      mockPrisma.lead.findFirst.mockResolvedValue({
        id: 'existant',
        status: 'EN_ATTENTE_VERIFICATION',
        codeExpiresAt: new Date(Date.now() + 3600_000),
      });

      const result = await service.initiate(validDto, '10.0.0.1');

      expect(result.leadId).toBe('existant');
      expect(result.maskedEmail).toBe('je*********@email.fr');
      expect(mockPrisma.lead.create).not.toHaveBeenCalled();
      expect(mockPrisma.ticket.updateMany).not.toHaveBeenCalled();
      expect(mockMail.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('rejette un code refusé par verifyCode', async () => {
      mockTickets.verifyCode.mockResolvedValue({
        isValid: false,
        error: 'Ce code a déjà été utilisé.',
      });

      await expect(service.initiate(validDto, '10.0.0.1')).rejects.toThrow(BadRequestException);
      expect(mockPrisma.lead.create).not.toHaveBeenCalled();
    });

    // La réservation est un UPDATE conditionnel : 0 ligne touchée = code pris
    // entre-temps par une autre requête.
    it('refuse si le ticket a été réservé entre-temps', async () => {
      mockTickets.verifyCode.mockResolvedValue({ isValid: true, ticket: { id: 't1' } });
      mockPrisma.lead.findFirst.mockResolvedValue(null);
      mockPrisma.lead.create.mockResolvedValue({ id: 'l1' });
      mockPrisma.ticket.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.initiate(validDto, '10.0.0.1')).rejects.toThrow(ConflictException);
    });

    // RG-03
    it('bloque au-delà du plafond horaire par IP', async () => {
      mockRedis.incr.mockResolvedValue(11);

      await expect(service.initiate(validDto, '10.0.0.1')).rejects.toThrow(HttpException);
      expect(mockTickets.verifyCode).not.toHaveBeenCalled();
    });
  });

  describe('verify', () => {
    const pendingLead = {
      id: 'l1',
      email: 'jean.dupont@email.fr',
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: null,
      birthDate: null,
      gender: null,
      status: 'EN_ATTENTE_VERIFICATION',
      verificationCode: '123456',
      codeExpiresAt: new Date(Date.now() + 3600_000),
      consentEmail: true,
    };

    it('rejette un code erroné', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(pendingLead);

      await expect(service.verify({ leadId: 'l1', code: '999999' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejette un code expiré', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue({
        ...pendingLead,
        codeExpiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.verify({ leadId: 'l1', code: '123456' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('crée le compte, consomme le ticket et ouvre la session', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(pendingLead);
      mockPrisma.ticket.findFirst.mockResolvedValue({
        id: 't1',
        code: 'ABCDEFGH23',
        prizeType: 'INFUSER',
      });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'u1', password: null });
      mockPrisma.ticket.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.participation.create.mockResolvedValue({ id: 'p1', createdAt: new Date() });
      mockTickets.getPrizesMap.mockResolvedValue({ INFUSER: { name: 'Infuseur à thé' } });
      mockAuth.login.mockResolvedValue({ accessToken: 'jwt' });

      const result = await service.verify({ leadId: 'l1', code: '123456' });

      expect(result.participation.prize.name).toBe('Infuseur à thé');
      // Option A : le mot de passe reste à définir après la validation.
      expect(result.passwordRequired).toBe(true);
      expect(mockAuth.login).toHaveBeenCalled();
    });

    it('rattache un compte existant au lieu de le dupliquer', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(pendingLead);
      mockPrisma.ticket.findFirst.mockResolvedValue({ id: 't1', code: 'C', prizeType: 'INFUSER' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existant', password: 'hash' });
      mockPrisma.ticket.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.participation.create.mockResolvedValue({ id: 'p1', createdAt: new Date() });
      mockTickets.getPrizesMap.mockResolvedValue({ INFUSER: { name: 'Infuseur' } });
      mockAuth.login.mockResolvedValue({ accessToken: 'jwt' });

      const result = await service.verify({ leadId: 'l1', code: '123456' });

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(result.passwordRequired).toBe(false);
    });

    it('refuse si la réservation a expiré entre-temps', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(pendingLead);
      mockPrisma.ticket.findFirst.mockResolvedValue(null);

      await expect(service.verify({ leadId: 'l1', code: '123456' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('resend', () => {
    const base = {
      id: 'l1',
      email: 'jean.dupont@email.fr',
      status: 'EN_ATTENTE_VERIFICATION',
      resendCount: 0,
      lastCodeSentAt: new Date(Date.now() - 120_000),
    };

    // RG-07
    it('refuse un renvoi avant 60 secondes', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue({ ...base, lastCodeSentAt: new Date() });

      await expect(service.resend({ leadId: 'l1' })).rejects.toThrow(HttpException);
      expect(mockMail.sendVerificationCode).not.toHaveBeenCalled();
    });

    // RG-17 : sans cela on aurait un code valide sans ticket réservé.
    it('prolonge la réservation du ticket en même temps que le code', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(base);

      await service.resend({ leadId: 'l1' });

      const leadUpdate = mockPrisma.lead.update.mock.calls[0][0].data;
      const ticketUpdate = mockPrisma.ticket.updateMany.mock.calls[0][0].data;
      expect(ticketUpdate.pendingExpiresAt).toEqual(leadUpdate.codeExpiresAt);
    });

    // RG-08
    it('signale au front de proposer une correction après deux renvois', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue({ ...base, resendCount: 1 });

      const result = await service.resend({ leadId: 'l1' });

      expect(result.shouldOfferEmailCorrection).toBe(true);
    });

    it('remet le compteur à zéro quand l’adresse est corrigée', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue({ ...base, resendCount: 2 });
      mockPrisma.lead.findFirst.mockResolvedValue(null);

      const result = await service.resend({ leadId: 'l1', email: 'nouvelle@email.fr' });

      expect(result.shouldOfferEmailCorrection).toBe(false);
      // « nouvelle » : 2 caractères visibles, 6 masqués.
      expect(result.maskedEmail).toBe('no******@email.fr');
      expect(mockPrisma.lead.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'nouvelle@email.fr', resendCount: 0 }),
        }),
      );
    });
  });
});
