// ===========================================
// Tests unitaires - GameConfig Controller
// ===========================================

import { NotFoundException } from '@nestjs/common';
import { GameConfigController } from '@/modules/game-config/game-config.controller';
import { GameConfigService } from '@/modules/game-config/game-config.service';

describe('GameConfigController', () => {
  let controller: GameConfigController;

  const mockGameConfigService = {
    getPublicConfig: jest.fn(),
    updateConfig: jest.fn(),
  };

  beforeEach(() => {
    controller = new GameConfigController(mockGameConfigService as unknown as GameConfigService);
    jest.clearAllMocks();
  });

  it('should return the public game config', async () => {
    const config = { phase: 'active', isActive: true };
    mockGameConfigService.getPublicConfig.mockResolvedValue(config);

    expect(await controller.getConfig()).toBe(config);
  });

  it('should throw 404 when no game is active', async () => {
    mockGameConfigService.getPublicConfig.mockResolvedValue(null);

    await expect(controller.getConfig()).rejects.toThrow(NotFoundException);
  });

  it('should forward the update to the service', async () => {
    const dto = { endDate: '2026-10-05T00:00:00.000Z' };
    const updated = { phase: 'active', isActive: true };
    mockGameConfigService.updateConfig.mockResolvedValue(updated);

    const result = await controller.updateConfig(dto);

    expect(mockGameConfigService.updateConfig).toHaveBeenCalledWith(dto);
    expect(result).toBe(updated);
  });
});
