// ===========================================
// Tests unitaires - RegistrationController
// ===========================================
// Le contrôleur ne fait que déléguer : ce qui se vérifie ici, c'est qu'il
// délègue bien, et que l'IP de l'appelant parvient au plafond horaire.

import { RegistrationController } from '@/modules/registration/registration.controller';
import { LeadsService } from '@/modules/participations/leads.service';

describe('RegistrationController', () => {
  let controller: RegistrationController;

  const mockLeads = {
    initiateRegistration: jest.fn(),
    verify: jest.fn(),
    resend: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new RegistrationController(mockLeads as unknown as LeadsService);
  });

  it('register transmet le dto et l’adresse IP', async () => {
    const attendu = { leadId: 'l1', maskedEmail: 'je***@email.fr', expiresAt: new Date() };
    mockLeads.initiateRegistration.mockResolvedValue(attendu);
    const dto = { email: 'jean@email.fr', password: 'MonMotDePasse123!' };

    const result = await controller.register(dto as never, '10.0.0.1');

    expect(result).toBe(attendu);
    expect(mockLeads.initiateRegistration).toHaveBeenCalledWith(dto, '10.0.0.1');
  });

  it('verify délègue au tunnel partagé', async () => {
    const attendu = { accessToken: 'jwt', participation: null };
    mockLeads.verify.mockResolvedValue(attendu);
    const dto = { leadId: 'l1', code: '123456' };

    const result = await controller.verify(dto as never);

    expect(result).toBe(attendu);
    expect(mockLeads.verify).toHaveBeenCalledWith(dto);
  });

  it('resend délègue au tunnel partagé', async () => {
    const attendu = { maskedEmail: 'je***@email.fr', shouldOfferEmailCorrection: false };
    mockLeads.resend.mockResolvedValue(attendu);
    const dto = { leadId: 'l1' };

    const result = await controller.resend(dto as never);

    expect(result).toBe(attendu);
    expect(mockLeads.resend).toHaveBeenCalledWith(dto);
  });
});
