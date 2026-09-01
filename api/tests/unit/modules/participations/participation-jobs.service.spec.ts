// ===========================================
// Tests unitaires - Jobs planifiés du tunnel
// ===========================================

import { ParticipationJobsService } from '@/modules/participations/participation-jobs.service';
import { PrismaService } from '@/prisma/prisma.service';
import { MailService } from '@/mail/mail.service';

describe('ParticipationJobsService', () => {
  let service: ParticipationJobsService;

  const mockPrisma = {
    ticket: { updateMany: jest.fn() },
    lead: { findMany: jest.fn(), updateMany: jest.fn(), update: jest.fn() },
    gameConfig: { findFirst: jest.fn() },
  };

  const mockMail = {
    sendExpirationNotice: jest.fn(),
    sendVerificationReminder: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ParticipationJobsService(
      mockPrisma as unknown as PrismaService,
      mockMail as unknown as MailService,
    );
    mockPrisma.ticket.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.lead.findMany.mockResolvedValue([]);
    mockPrisma.lead.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.gameConfig.findFirst.mockResolvedValue({ claimEndDate: new Date('2026-11-01') });
    // Le service n'incremente qu'apres un envoi confirme.
    mockMail.sendVerificationReminder.mockResolvedValue(true);
    mockMail.sendExpirationNotice.mockResolvedValue(true);
  });

  describe('expireStaleLeads', () => {
    it('ne cible que les leads en attente dont le code est échu', async () => {
      await service.expireStaleLeads();

      const where = mockPrisma.lead.findMany.mock.calls[0][0].where;
      expect(where.status).toBe('EN_ATTENTE_VERIFICATION');
      expect(where.codeExpiresAt.lt).toBeInstanceOf(Date);
    });

    it('ne touche jamais à la table tickets : aucun code n’était réservé', async () => {
      mockPrisma.lead.findMany.mockResolvedValue([{ id: 'l1', email: 'a@b.fr' }]);

      await service.expireStaleLeads();

      expect(mockPrisma.ticket.updateMany).not.toHaveBeenCalled();
    });

    it('expire les leads, efface leur code et fixe la date de purge', async () => {
      mockPrisma.lead.findMany.mockResolvedValue([{ id: 'l1', email: 'a@b.fr' }]);

      await service.expireStaleLeads();

      const data = mockPrisma.lead.updateMany.mock.calls[0][0].data;
      expect(data.status).toBe('EXPIRE');
      expect(data.verificationCode).toBeNull();
      expect(data.purgeAfter).toBeInstanceOf(Date);
      // RG-21 : 30 jours de conservation.
      const days = Math.round((data.purgeAfter.getTime() - Date.now()) / 86_400_000);
      expect(days).toBe(30);
      expect(mockMail.sendExpirationNotice).toHaveBeenCalledWith('a@b.fr', new Date('2026-11-01'));
    });

    it("ne touche à rien quand aucun lead n'a expiré", async () => {
      await service.expireStaleLeads();

      expect(mockPrisma.lead.updateMany).not.toHaveBeenCalled();
      expect(mockMail.sendExpirationNotice).not.toHaveBeenCalled();
    });
  });

  describe('sendVerificationReminders (RG-20)', () => {
    it('parcourt les trois échéances 24 h, 12 h et 1 h', async () => {
      await service.sendVerificationReminders();

      expect(mockPrisma.lead.findMany).toHaveBeenCalledTimes(3);
      const compteurs = mockPrisma.lead.findMany.mock.calls.map(
        (call) => call[0].where.remindersSent,
      );
      expect(compteurs).toEqual([0, 1, 2]);
    });

    it('ignore les leads déjà expirés, qui relèvent du job de libération', async () => {
      await service.sendVerificationReminders();

      const where = mockPrisma.lead.findMany.mock.calls[0][0].where;
      expect(where.codeExpiresAt.gt).toBeInstanceOf(Date);
      expect(where.codeExpiresAt.lte).toBeInstanceOf(Date);
    });

    it('envoie la relance puis incremente le compteur', async () => {
      mockPrisma.lead.findMany
        .mockResolvedValueOnce([{ id: 'l1', email: 'a@b.fr', verificationCode: '123456' }])
        .mockResolvedValue([]);
      mockPrisma.lead.updateMany.mockResolvedValue({ count: 1 });

      await service.sendVerificationReminders();

      expect(mockMail.sendVerificationReminder).toHaveBeenCalledWith('a@b.fr', '123456', 24);
      expect(mockPrisma.lead.updateMany).toHaveBeenCalledWith({
        where: { id: 'l1', remindersSent: 0 },
        data: { remindersSent: 1 },
      });
    });

    // La garantie que l'ordre inverse apporte : un envoi echoue laisse le
    // compteur intact, donc le balayage suivant retentera. Auparavant la
    // reservation precedait l'envoi et la relance etait perdue pour de bon.
    it("n'incremente pas le compteur si l'envoi a echoue", async () => {
      mockPrisma.lead.findMany
        .mockResolvedValueOnce([{ id: 'l1', email: 'a@b.fr', verificationCode: '123456' }])
        .mockResolvedValue([]);
      mockMail.sendVerificationReminder.mockResolvedValue(false);

      await service.sendVerificationReminders();

      expect(mockMail.sendVerificationReminder).toHaveBeenCalled();
      expect(mockPrisma.lead.updateMany).not.toHaveBeenCalled();
    });

    // Le compromis assume : deux executions simultanees peuvent chacune envoyer
    // avant que l'une n'incremente. Le UPDATE conditionnel empeche au moins le
    // double comptage, de sorte que l'etape suivante ne soit pas sautee.
    it('ne compte pas deux fois une relance deja prise par une autre execution', async () => {
      mockPrisma.lead.findMany
        .mockResolvedValueOnce([{ id: 'l1', email: 'a@b.fr', verificationCode: '123456' }])
        .mockResolvedValue([]);
      mockPrisma.lead.updateMany.mockResolvedValue({ count: 0 });

      await service.sendVerificationReminders();

      expect(mockPrisma.lead.updateMany).toHaveBeenCalledWith({
        where: { id: 'l1', remindersSent: 0 },
        data: { remindersSent: 1 },
      });
    });

    it('ignore un lead sans code de verification', async () => {
      mockPrisma.lead.findMany
        .mockResolvedValueOnce([{ id: 'l1', email: 'a@b.fr', verificationCode: null }])
        .mockResolvedValue([]);

      await service.sendVerificationReminders();

      expect(mockMail.sendVerificationReminder).not.toHaveBeenCalled();
      expect(mockPrisma.lead.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('purgeExpiredLeads (RG-21)', () => {
    it('anonymise sans supprimer la ligne, pour préserver la statistique', async () => {
      mockPrisma.lead.findMany.mockResolvedValue([{ id: 'l1' }]);

      await service.purgeExpiredLeads();

      const data = mockPrisma.lead.update.mock.calls[0][0].data;
      expect(data.email).toBe('purge-l1@anonymise.invalid');
      expect(data.firstName).toBe('anonymise');
      expect(data.phone).toBeNull();
      expect(data.birthDate).toBeNull();
      expect(data.gender).toBeNull();
      expect(data.purgeAfter).toBeNull();
    });

    it('exclut les leads déjà anonymisés pour ne pas rejouer indéfiniment', async () => {
      await service.purgeExpiredLeads();

      const where = mockPrisma.lead.findMany.mock.calls[0][0].where;
      expect(where.status).toBe('EXPIRE');
      expect(where.email.not.endsWith).toBe('@anonymise.invalid');
    });
  });
});
