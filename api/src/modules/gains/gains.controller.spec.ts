// ===========================================
// Tests unitaires - Gains Controller
// ===========================================

import { GainsController } from './gains.controller';
import { GainsService } from './gains.service';
import { User } from '@prisma/client';

describe('GainsController', () => {
  let controller: GainsController;

  const mockGainsService = {
    deliverPrize: jest.fn(),
    deliverPrizeByCode: jest.fn(),
    getPendingDeliveries: jest.fn(),
    getDeliveryHistory: jest.fn(),
    getDeliveryStats: jest.fn(),
  };

  const employee = { id: 'e1', role: 'EMPLOYEE' } as User;

  beforeEach(() => {
    controller = new GainsController(mockGainsService as unknown as GainsService);
    jest.clearAllMocks();
  });

  it('deliverPrize should record the employee who delivered the prize', async () => {
    mockGainsService.deliverPrize.mockResolvedValue({ id: 'p1' });

    await controller.deliverPrize('p1', { deliveryMethod: 'IN_STORE' }, employee);

    expect(mockGainsService.deliverPrize).toHaveBeenCalledWith('p1', 'e1', 'IN_STORE');
  });

  it('deliverPrizeByCode should delegate with the code', async () => {
    mockGainsService.deliverPrizeByCode.mockResolvedValue({ id: 'p1' });

    await controller.deliverPrizeByCode('ABCDEFGH23', { deliveryMethod: 'ONLINE' }, employee);

    expect(mockGainsService.deliverPrizeByCode).toHaveBeenCalledWith('ABCDEFGH23', 'e1', 'ONLINE');
  });

  it('getPendingDeliveries should delegate the pagination', async () => {
    mockGainsService.getPendingDeliveries.mockResolvedValue({ data: [], meta: {} });

    await controller.getPendingDeliveries(2, 10);

    expect(mockGainsService.getPendingDeliveries).toHaveBeenCalledWith({ page: 2, limit: 10 });
  });

  it('getDeliveryHistory should delegate the filters', async () => {
    mockGainsService.getDeliveryHistory.mockResolvedValue({ data: [], meta: {} });

    await controller.getDeliveryHistory(1, 20, 'e1');

    expect(mockGainsService.getDeliveryHistory).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      employeeId: 'e1',
    });
  });

  it('getDeliveryStats should delegate to the service', async () => {
    mockGainsService.getDeliveryStats.mockResolvedValue({ total: 10 });

    expect(await controller.getDeliveryStats()).toEqual({ total: 10 });
  });
});
