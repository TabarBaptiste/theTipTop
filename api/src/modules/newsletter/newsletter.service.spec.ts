// ===========================================
// Tests unitaires - NewsletterService
// ===========================================

import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { NewsletterService } from './newsletter.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  newsletterSubscriber: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
};

const config: Record<string, string> = {
  BREVO_API_KEY: 'cle-de-test',
  BREVO_NEWSLETTER_LIST_ID: '7',
};

async function construire(surcharges: Record<string, string | undefined> = {}) {
  const module = await Test.createTestingModule({
    providers: [
      NewsletterService,
      { provide: PrismaService, useValue: mockPrisma },
      {
        provide: ConfigService,
        useValue: { get: (cle: string) => ({ ...config, ...surcharges })[cle] },
      },
    ],
  }).compile();

  return module.get(NewsletterService);
}

describe('NewsletterService', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock as unknown as typeof fetch;
    fetchMock.mockResolvedValue({ ok: true, status: 201, text: async () => '' });
    mockPrisma.newsletterSubscriber.upsert.mockResolvedValue({ id: 'n1' });
    mockPrisma.newsletterSubscriber.update.mockResolvedValue({ id: 'n1' });
  });

  it('enregistre l adresse normalisee en minuscules', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null);
    const service = await construire();

    await service.subscribe('  Jean.Dupont@Email.FR  ');

    expect(mockPrisma.newsletterSubscriber.upsert).toHaveBeenCalledWith({
      where: { email: 'jean.dupont@email.fr' },
      update: { unsubscribedAt: null },
      create: { email: 'jean.dupont@email.fr' },
      select: { id: true },
    });
  });

  it('pousse le contact dans la liste configuree', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null);
    const service = await construire();

    await service.subscribe('jean@email.fr');

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.brevo.com/v3/contacts');
    expect(JSON.parse(options.body)).toEqual({
      email: 'jean@email.fr',
      listIds: [7],
      // Sans cela, Brevo refuse un contact qu'il connait deja au lieu de le
      // rattacher a la liste.
      updateEnabled: true,
    });
    expect(options.headers['api-key']).toBe('cle-de-test');
  });

  it('horodate la synchronisation reussie', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null);
    const service = await construire();

    await service.subscribe('jean@email.fr');

    const { data } = mockPrisma.newsletterSubscriber.update.mock.calls.at(-1)![0];
    expect(data.brevoSyncedAt).toBeInstanceOf(Date);
    expect(data.brevoError).toBeNull();
  });

  // Le coeur du dispositif : c'est ce qui distingue une inscription perdue
  // d'une inscription differee.
  describe('quand Brevo est indisponible', () => {
    it('conserve l inscription et consigne le motif', async () => {
      mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null);
      fetchMock.mockRejectedValue(new Error('getaddrinfo ENOTFOUND'));
      const service = await construire();

      await expect(service.subscribe('jean@email.fr')).resolves.toEqual({ dejaInscrit: false });

      expect(mockPrisma.newsletterSubscriber.upsert).toHaveBeenCalled();
      const { data } = mockPrisma.newsletterSubscriber.update.mock.calls.at(-1)![0];
      expect(data.brevoError).toContain('ENOTFOUND');
      expect(data.brevoSyncedAt).toBeUndefined();
    });

    it('consigne aussi un refus explicite de Brevo', async () => {
      mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null);
      fetchMock.mockResolvedValue({ ok: false, status: 401, text: async () => 'Key not found' });
      const service = await construire();

      await service.subscribe('jean@email.fr');

      const { data } = mockPrisma.newsletterSubscriber.update.mock.calls.at(-1)![0];
      expect(data.brevoError).toContain('401');
    });
  });

  it('enregistre sans appeler Brevo quand la liste n est pas configuree', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue(null);
    const service = await construire({ BREVO_NEWSLETTER_LIST_ID: undefined });

    await service.subscribe('jean@email.fr');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockPrisma.newsletterSubscriber.upsert).toHaveBeenCalled();
  });

  // Une reinscription ne doit ni echouer sur la contrainte d'unicite, ni
  // repousser inutilement un contact deja synchronise.
  it('tolere une adresse deja inscrite sans rappeler Brevo', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue({
      id: 'n1',
      brevoSyncedAt: new Date(),
      unsubscribedAt: null,
    });
    const service = await construire();

    await expect(service.subscribe('jean@email.fr')).resolves.toEqual({ dejaInscrit: true });

    expect(mockPrisma.newsletterSubscriber.upsert).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('leve une desinscription anterieure et resynchronise', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue({
      id: 'n1',
      brevoSyncedAt: new Date(),
      unsubscribedAt: new Date(),
    });
    const service = await construire();

    await expect(service.subscribe('jean@email.fr')).resolves.toEqual({ dejaInscrit: false });

    const upsert = mockPrisma.newsletterSubscriber.upsert.mock.calls[0][0];
    expect(upsert.update.unsubscribedAt).toBeNull();
    expect(fetchMock).toHaveBeenCalled();
  });
});
