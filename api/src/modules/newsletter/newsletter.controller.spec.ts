// ===========================================
// Tests unitaires - Newsletter Controller
// ===========================================

import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';

describe('NewsletterController', () => {
  let controller: NewsletterController;

  const mockNewsletterService = {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  };

  beforeEach(() => {
    controller = new NewsletterController(mockNewsletterService as unknown as NewsletterService);
    jest.clearAllMocks();
  });

  it('subscribe should delegate to the service', async () => {
    mockNewsletterService.subscribe.mockResolvedValue({ dejaInscrit: false });

    const result = await controller.subscribe({ email: 'jean.dupont@email.fr' });

    expect(result).toEqual({ dejaInscrit: false });
    expect(mockNewsletterService.subscribe).toHaveBeenCalledWith('jean.dupont@email.fr');
  });

  it('unsubscribe should delegate to the service', async () => {
    mockNewsletterService.unsubscribe.mockResolvedValue({ email: 'jean.dupont@email.fr' });

    const result = await controller.unsubscribe({ token: 'a'.repeat(64) });

    expect(result).toEqual({ email: 'jean.dupont@email.fr' });
    expect(mockNewsletterService.unsubscribe).toHaveBeenCalledWith('a'.repeat(64));
  });
});
