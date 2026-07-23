// ===========================================
// Tests unitaires - Stats Controller
// ===========================================

import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

describe('StatsController', () => {
  let controller: StatsController;

  const mockStatsService = {
    getGlobalStats: jest.fn(),
    getPrizeStats: jest.fn(),
    getDemographicStats: jest.fn(),
    getTimelineStats: jest.fn(),
    getEmailingData: jest.fn(),
  };

  beforeEach(() => {
    controller = new StatsController(mockStatsService as unknown as StatsService);
    jest.clearAllMocks();
  });

  it('getGlobalStats should delegate to the service', async () => {
    mockStatsService.getGlobalStats.mockResolvedValue({ tickets: {} });

    expect(await controller.getGlobalStats()).toEqual({ tickets: {} });
  });

  it('getPrizeStats should delegate to the service', async () => {
    mockStatsService.getPrizeStats.mockResolvedValue({ byType: [] });

    expect(await controller.getPrizeStats()).toEqual({ byType: [] });
  });

  it('getDemographicStats should delegate to the service', async () => {
    mockStatsService.getDemographicStats.mockResolvedValue({ byGender: [] });

    expect(await controller.getDemographicStats()).toEqual({ byGender: [] });
  });

  it('getTimelineStats should forward the days window', async () => {
    mockStatsService.getTimelineStats.mockResolvedValue({ timeline: [] });

    await controller.getTimelineStats(7);

    expect(mockStatsService.getTimelineStats).toHaveBeenCalledWith(7);
  });

  it('getEmailingData should forward the participation segment', async () => {
    mockStatsService.getEmailingData.mockResolvedValue({ count: 0, users: [] });

    await controller.getEmailingData(false);

    expect(mockStatsService.getEmailingData).toHaveBeenCalledWith({
      hasParticipated: false,
    });
  });
});
