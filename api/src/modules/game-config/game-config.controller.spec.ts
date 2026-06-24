// ===========================================
// Tests unitaires - GameConfig Controller
// ===========================================

import { NotFoundException } from '@nestjs/common';
import { GameConfigController } from './game-config.controller';
import { GameConfigService } from './game-config.service';

describe('GameConfigController', () => {
  let controller: GameConfigController;

  const mockGameConfigService = {
    getPublicConfig: jest.fn(),
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
});
