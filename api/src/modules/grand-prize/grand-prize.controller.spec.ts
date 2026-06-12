// ===========================================
// Tests unitaires - Grand Prize Controller
// ===========================================

import { GrandPrizeController } from './grand-prize.controller';
import { GrandPrizeService } from './grand-prize.service';

describe('GrandPrizeController', () => {
  let controller: GrandPrizeController;

  const mockGrandPrizeService = {
    getDrawInfo: jest.fn(),
    canDraw: jest.fn(),
    draw: jest.fn(),
  };

  beforeEach(() => {
    controller = new GrandPrizeController(mockGrandPrizeService as unknown as GrandPrizeService);
    jest.clearAllMocks();
  });

  it('getDrawInfo should delegate to the service', async () => {
    mockGrandPrizeService.getDrawInfo.mockResolvedValue({ drawn: false });

    expect(await controller.getDrawInfo()).toEqual({ drawn: false });
  });

  it('canDraw should delegate to the service', async () => {
    mockGrandPrizeService.canDraw.mockResolvedValue({ canDraw: true, participantsCount: 5 });

    expect(await controller.canDraw()).toEqual({ canDraw: true, participantsCount: 5 });
  });

  it('draw should delegate to the service', async () => {
    mockGrandPrizeService.draw.mockResolvedValue({ success: true });

    expect(await controller.draw()).toEqual({ success: true });
  });
});
