// ===========================================
// Tests unitaires - MailService
// ===========================================
// fetch est remplacé : aucun appel ne part vers Brevo.

import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

describe('MailService', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  const makeConfig = (values: Record<string, string | undefined>) =>
    ({
      get: (key: string, fallback?: string) => values[key] ?? fallback,
    }) as unknown as ConfigService;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 201, text: async () => '' });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('sans clé API', () => {
    it("n'appelle pas Brevo et retombe sur la journalisation", async () => {
      const service = new MailService(makeConfig({ BREVO_API_KEY: undefined }));

      await service.sendVerificationCode('jean.dupont@email.fr', '123456', new Date());

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('avec clé API', () => {
    const config = makeConfig({
      BREVO_API_KEY: 'xkeysib-test',
      BREVO_SENDER_EMAIL: 'noreply@thetiptop.fr',
      BREVO_SENDER_NAME: 'Thé Tip Top',
    });

    it('poste sur l’API transactionnelle avec la clé en en-tête', async () => {
      const service = new MailService(config);

      await service.sendVerificationCode('jean.dupont@email.fr', '123456', new Date());

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe('https://api.brevo.com/v3/smtp/email');
      expect(init.method).toBe('POST');
      expect(init.headers['api-key']).toBe('xkeysib-test');
    });

    // Recommandation CNIL du 14/04/2026 : ces envois sont transactionnels et
    // ne doivent pas embarquer de suivi d'ouverture individuel.
    it('désactive explicitement le suivi individuel du destinataire', async () => {
      const service = new MailService(config);

      await service.sendVerificationCode('jean.dupont@email.fr', '123456', new Date());

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.to).toEqual([
        { email: 'jean.dupont@email.fr', contactPixelTrackingConsent: false },
      ]);
    });

    it('place le code dans l’objet et dans le corps du message', async () => {
      const service = new MailService(config);

      await service.sendVerificationCode('jean.dupont@email.fr', '482913', new Date());

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.subject).toContain('482913');
      expect(body.htmlContent).toContain('482913');
    });

    it('accorde la relance au nombre d’heures restantes', async () => {
      const service = new MailService(config);

      await service.sendVerificationReminder('jean.dupont@email.fr', '482913', 1);
      expect(JSON.parse(fetchMock.mock.calls[0][1].body).subject).toContain('une heure');

      await service.sendVerificationReminder('jean.dupont@email.fr', '482913', 12);
      expect(JSON.parse(fetchMock.mock.calls[1][1].body).subject).toContain('12 heures');
    });

    it("n'expose aucun code dans l'avis d'expiration", async () => {
      const service = new MailService(config);

      await service.sendExpirationNotice('jean.dupont@email.fr');

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.htmlContent).not.toMatch(/\d{6}/);
    });

    // Le lead est déjà créé et le ticket réservé quand l'envoi a lieu : lever
    // une exception afficherait une erreur alors que la participation est bien
    // enregistrée, sur un ticket désormais bloqué.
    it('ne propage pas un refus de Brevo', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 401, text: async () => 'Unauthorized' });
      const service = new MailService(config);

      await expect(
        service.sendVerificationCode('jean.dupont@email.fr', '123456', new Date()),
      ).resolves.toBeUndefined();
    });

    it('ne propage pas une panne réseau', async () => {
      fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
      const service = new MailService(config);

      await expect(
        service.sendVerificationCode('jean.dupont@email.fr', '123456', new Date()),
      ).resolves.toBeUndefined();
    });
  });
});
