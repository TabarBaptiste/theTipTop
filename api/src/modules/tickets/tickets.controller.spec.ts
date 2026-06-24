// ===========================================
// Tests unitaires - Tickets Controller
// ===========================================

import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

describe('TicketsController', () => {
  let controller: TicketsController;

  const mockTicketsService = {
    verifyCode: jest.fn(),
    findAllPrizes: jest.fn(),
    getStats: jest.fn(),
    getAvailableCodes: jest.fn(),
    markAsDistributed: jest.fn(),
  };

  beforeEach(() => {
    controller = new TicketsController(mockTicketsService as unknown as TicketsService);
    jest.clearAllMocks();
  });

  it('verifyCode should delegate to the service', async () => {
    mockTicketsService.verifyCode.mockResolvedValue({ isValid: true });

    const result = await controller.verifyCode({ code: 'ABCDEFGH23' });

    expect(result.isValid).toBe(true);
    expect(mockTicketsService.verifyCode).toHaveBeenCalledWith('ABCDEFGH23');
  });

  it('getPrizes should only expose the public prize fields', async () => {
    mockTicketsService.findAllPrizes.mockResolvedValue([
      {
        id: 'p1',
        code: 'INFUSER',
        name: 'Infuseur à thé',
        description: 'Un infuseur',
        value: null,
        percentage: 60,
        totalCount: 300000,
        displayOrder: 1,
        imageUrl: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await controller.getPrizes();

    expect(result).toEqual([
      {
        code: 'INFUSER',
        name: 'Infuseur à thé',
        description: 'Un infuseur',
        value: null,
        percentage: 60,
        displayOrder: 1,
        imageUrl: null,
      },
    ]);
    // totalCount (stock interne) ne doit pas fuiter
    expect(result[0]).not.toHaveProperty('totalCount');
  });

  it('getStats should delegate to the service', async () => {
    mockTicketsService.getStats.mockResolvedValue({ total: 500000 });

    expect(await controller.getStats()).toEqual({ total: 500000 });
  });

  it('getAvailableCodes should return the codes with their count', async () => {
    mockTicketsService.getAvailableCodes.mockResolvedValue(['AAAA', 'BBBB']);

    const result = await controller.getAvailableCodes(2);

    expect(result).toEqual({ codes: ['AAAA', 'BBBB'], count: 2 });
  });

  it('markAsDistributed should delegate to the service', async () => {
    mockTicketsService.markAsDistributed.mockResolvedValue({ isDistributed: true });

    const result = await controller.markAsDistributed('ABCDEFGH23');

    expect(result.isDistributed).toBe(true);
    expect(mockTicketsService.markAsDistributed).toHaveBeenCalledWith('ABCDEFGH23');
  });
});
