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

    describe('sendPrizeWon', () => {
      const lot = { name: 'Coffret Découverte', value: '39€' };

      it('nomme le lot dans l objet et dans le corps', async () => {
        const service = new MailService(config);

        await service.sendPrizeWon('jean.dupont@email.fr', lot, 'ABCDEFGH23', null);

        const body = JSON.parse(fetchMock.mock.calls[0][1].body);
        expect(body.subject).toContain('Coffret Découverte');
        expect(body.htmlContent).toContain('Coffret Découverte');
        expect(body.htmlContent).toContain('39€');
      });

      // Contrairement au code de confirmation, celui du ticket est le
      // justificatif a presenter en boutique : il doit figurer dans le mail.
      it('inclut le code du ticket', async () => {
        const service = new MailService(config);

        await service.sendPrizeWon('jean.dupont@email.fr', lot, 'ABCDEFGH23', null);

        expect(JSON.parse(fetchMock.mock.calls[0][1].body).htmlContent).toContain('ABCDEFGH23');
      });

      it('rappelle les deux modes de retrait', async () => {
        const service = new MailService(config);

        await service.sendPrizeWon('jean.dupont@email.fr', lot, 'ABCDEFGH23', null);

        const html = JSON.parse(fetchMock.mock.calls[0][1].body).htmlContent;
        expect(html).toContain('boutique');
        expect(html).toContain('expédier');
      });

      it('annonce les jours restants pour reclamer', async () => {
        const service = new MailService(config);
        const dans10Jours = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

        await service.sendPrizeWon('jean.dupont@email.fr', lot, 'ABCDEFGH23', dans10Jours);

        const html = JSON.parse(fetchMock.mock.calls[0][1].body).htmlContent;
        expect(html).toContain('10 jours');
        expect(html).toContain('réclamer votre lot');
        // L action differe de l avis d expiration : le code est deja consomme.
        expect(html).not.toContain('saisir votre code');
      });

      it('omet la valeur quand le lot n en a pas', async () => {
        const service = new MailService(config);

        await service.sendPrizeWon(
          'jean.dupont@email.fr',
          { name: 'Infuseur à thé', value: null },
          'ABCDEFGH23',
          null,
        );

        const html = JSON.parse(fetchMock.mock.calls[0][1].body).htmlContent;
        expect(html).toContain('Infuseur à thé');
        expect(html).not.toContain('valeur de');
      });
    });

    it("n'expose aucun code dans l'avis d'expiration", async () => {
      const service = new MailService(config);

      await service.sendExpirationNotice('jean.dupont@email.fr');

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.htmlContent).not.toMatch(/\d{6}/);
    });

    // Le CDC accorde les 30 jours du jeu plus 30 jours a compter de la cloture.
    // C'est le nombre de jours restants qui est affiche, pas la duree totale :
    // seul le premier est exploitable par le destinataire.
    it('indique les jours restants pour reclamer son lot', async () => {
      const service = new MailService(config);
      const dans10Jours = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

      await service.sendExpirationNotice('jean.dupont@email.fr', dans10Jours);

      const html = JSON.parse(fetchMock.mock.calls[0][1].body).htmlContent;
      expect(html).toContain('10 jours');
      expect(html).toContain('reclamer votre lot'.replace('recl', 'récl'));
    });

    it('accorde le singulier au dernier jour', async () => {
      const service = new MailService(config);
      const demain = new Date(Date.now() + 12 * 60 * 60 * 1000);

      await service.sendExpirationNotice('jean.dupont@email.fr', demain);

      const html = JSON.parse(fetchMock.mock.calls[0][1].body).htmlContent;
      expect(html).toContain('1 jour');
      expect(html).not.toContain('1 jours');
    });

    it('annonce un delai ecoule plutot qu un nombre negatif', async () => {
      const service = new MailService(config);
      const hier = new Date(Date.now() - 24 * 60 * 60 * 1000);

      await service.sendExpirationNotice('jean.dupont@email.fr', hier);

      const html = JSON.parse(fetchMock.mock.calls[0][1].body).htmlContent;
      expect(html).toContain('écoulé');
      expect(html).not.toMatch(/-\d+ jour/);
    });

    it('omet la phrase quand aucune date de cloture n est connue', async () => {
      const service = new MailService(config);

      await service.sendExpirationNotice('jean.dupont@email.fr', null);

      const html = JSON.parse(fetchMock.mock.calls[0][1].body).htmlContent;
      expect(html).not.toContain('jour');
    });

    // Lever une exception afficherait une erreur a l'utilisateur alors que sa
    // participation est bien enregistree. L'echec est donc signale par la
    // valeur de retour, que les jobs de relance exploitent pour retenter.
    it('signale un refus de Brevo sans lever d exception', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 401, text: async () => 'Unauthorized' });
      const service = new MailService(config);

      await expect(
        service.sendVerificationCode('jean.dupont@email.fr', '123456', new Date()),
      ).resolves.toBe(false);
    });

    it('signale une panne reseau sans lever d exception', async () => {
      fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
      const service = new MailService(config);

      await expect(
        service.sendVerificationCode('jean.dupont@email.fr', '123456', new Date()),
      ).resolves.toBe(false);
    });

    it('renvoie vrai quand Brevo accepte', async () => {
      fetchMock.mockResolvedValue({ ok: true, status: 201, text: async () => '' });
      const service = new MailService(config);

      await expect(
        service.sendVerificationCode('jean.dupont@email.fr', '123456', new Date()),
      ).resolves.toBe(true);
    });
  });
});
