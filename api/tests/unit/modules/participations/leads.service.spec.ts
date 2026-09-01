// ===========================================
// Tests unitaires - LeadsService (tunnel UC-05)
// ===========================================

import { BadRequestException, ConflictException, HttpException } from '@nestjs/common';
import { LeadsService } from '@/modules/participations/leads.service';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { MailService } from '@/mail/mail.service';
import { TicketsService } from '@/modules/tickets/tickets.service';
import { AuthService } from '@/modules/auth/auth.service';

describe('LeadsService', () => {
  let service: LeadsService;

  const mockPrisma = {
    lead: { create: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    ticket: { updateMany: jest.fn(), findUnique: jest.fn() },
    user: { findUnique: jest.fn(), create: jest.fn() },
    participation: { create: jest.fn() },
    gameConfig: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  };

  const mockRedis = { incr: jest.fn(), expire: jest.fn() };
  const mockMail = { sendVerificationCode: jest.fn(), sendPrizeWon: jest.fn() };
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
    mockPrisma.gameConfig.findFirst.mockResolvedValue({ claimEndDate: new Date('2026-10-30') });
    mockMail.sendPrizeWon.mockResolvedValue(true);
    // Par défaut la transaction exécute simplement le callback avec les mocks.
    mockPrisma.$transaction.mockImplementation(async (cb: never) =>
      (cb as unknown as (tx: unknown) => unknown)(mockPrisma),
    );
  });

  describe('initiate', () => {
    it('crée le lead en mémorisant le ticket visé, sans le consommer', async () => {
      mockTickets.verifyCode.mockResolvedValue({ isValid: true, ticket: { id: 't1' } });
      mockPrisma.lead.findFirst.mockResolvedValue(null);
      mockPrisma.lead.create.mockResolvedValue({ id: 'l1' });

      const result = await service.initiate(validDto, '10.0.0.1');

      expect(result.leadId).toBe('l1');
      // RG-09 : deux premiers caractères puis domaine complet.
      expect(result.maskedEmail).toBe('je*********@email.fr');
      // L'email est normalisé avant stockage, et le ticket visé est mémorisé.
      expect(mockPrisma.lead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'jean.dupont@email.fr', ticketId: 't1' }),
        }),
      );
      // Le code reste disponible : aucune écriture sur la table tickets.
      expect(mockPrisma.ticket.updateMany).not.toHaveBeenCalled();
      expect(mockMail.sendVerificationCode).toHaveBeenCalled();
    });

    it('génère un code à 6 chiffres', async () => {
      mockTickets.verifyCode.mockResolvedValue({ isValid: true, ticket: { id: 't1' } });
      mockPrisma.lead.findFirst.mockResolvedValue(null);
      mockPrisma.lead.create.mockResolvedValue({ id: 'l1' });

      await service.initiate(validDto, '10.0.0.1');

      const code = mockMail.sendVerificationCode.mock.calls[0][1];
      expect(code).toMatch(/^\d{6}$/);
    });

    // RG-01 : une adresse déjà active ne doit rien révéler ni rien consommer.
    it('applique le mode silencieux sans créer de lead ni toucher au ticket', async () => {
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
      ticketId: 't1',
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
      mockPrisma.ticket.findUnique.mockResolvedValue({
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

    // Le participant doit retrouver son lot et son code dans sa boite : l ecran
    // de resultat disparait des qu il ferme l onglet.
    it('annonce le lot par email, avec le code et la date limite de reclamation', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(pendingLead);
      mockPrisma.ticket.findUnique.mockResolvedValue({
        id: 't1',
        code: 'ABCDEFGH23',
        prizeType: 'INFUSER',
      });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'jean@email.fr',
        password: null,
      });
      mockPrisma.ticket.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.participation.create.mockResolvedValue({ id: 'p1', createdAt: new Date() });
      mockTickets.getPrizesMap.mockResolvedValue({
        INFUSER: { name: 'Infuseur à thé', value: null },
      });
      mockAuth.login.mockResolvedValue({ accessToken: 'jwt' });

      await service.verify({ leadId: 'l1', code: '123456' });

      expect(mockMail.sendPrizeWon).toHaveBeenCalledWith(
        'jean@email.fr',
        { name: 'Infuseur à thé', value: null },
        'ABCDEFGH23',
        new Date('2026-10-30'),
      );
    });

    // La participation est acquise avant l envoi : une panne de messagerie ne
    // doit pas la faire echouer ni priver l utilisateur de son resultat.
    it('rend le resultat meme si l annonce du gain echoue', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(pendingLead);
      mockPrisma.ticket.findUnique.mockResolvedValue({ id: 't1', code: 'C', prizeType: 'INFUSER' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', password: 'hash' });
      mockPrisma.ticket.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.participation.create.mockResolvedValue({ id: 'p1', createdAt: new Date() });
      mockTickets.getPrizesMap.mockResolvedValue({ INFUSER: { name: 'Infuseur' } });
      mockAuth.login.mockResolvedValue({ accessToken: 'jwt' });
      mockMail.sendPrizeWon.mockResolvedValue(false);

      const result = await service.verify({ leadId: 'l1', code: '123456' });

      expect(result.participation.prize.name).toBe('Infuseur');
    });

    it('rattache un compte existant au lieu de le dupliquer', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(pendingLead);
      mockPrisma.ticket.findUnique.mockResolvedValue({ id: 't1', code: 'C', prizeType: 'INFUSER' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existant', password: 'hash' });
      mockPrisma.ticket.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.participation.create.mockResolvedValue({ id: 'p1', createdAt: new Date() });
      mockTickets.getPrizesMap.mockResolvedValue({ INFUSER: { name: 'Infuseur' } });
      mockAuth.login.mockResolvedValue({ accessToken: 'jwt' });

      const result = await service.verify({ leadId: 'l1', code: '123456' });

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(result.passwordRequired).toBe(false);
    });

    // RG-12/RG-13 : le code n'étant jamais réservé, la course se tranche ici.
    // 0 ligne touchée = un autre participant a confirmé avant.
    it('refuse si le code a été consommé par un autre entre-temps', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(pendingLead);
      mockPrisma.ticket.findUnique.mockResolvedValue({
        id: 't1',
        code: 'ABCDEFGH23',
        prizeType: 'INFUSER',
      });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', password: 'hash' });
      mockPrisma.ticket.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.verify({ leadId: 'l1', code: '123456' })).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrisma.participation.create).not.toHaveBeenCalled();
    });

    it('refuse si le ticket visé est introuvable', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(pendingLead);
      mockPrisma.ticket.findUnique.mockResolvedValue(null);

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

    // RG-07 : le renvoi invalide le code précédent et repousse l'échéance,
    // sans jamais toucher au ticket.
    it('régénère le code et repousse l’échéance sans toucher au ticket', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(base);

      await service.resend({ leadId: 'l1' });

      const leadUpdate = mockPrisma.lead.update.mock.calls[0][0].data;
      expect(leadUpdate.verificationCode).toMatch(/^\d{6}$/);
      expect(leadUpdate.codeExpiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(mockPrisma.ticket.updateMany).not.toHaveBeenCalled();
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
