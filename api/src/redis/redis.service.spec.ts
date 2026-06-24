// ===========================================
// Tests unitaires - Redis Service
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

// Mock ioredis : aucun serveur Redis requis pour les tests unitaires
const mockRedisClient = {
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  scan: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  ping: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedisClient);
});

describe('RedisService', () => {
  let service: RedisService;

  const mockConfigService = {
    get: jest.fn((_key: string, fallback?: unknown) => fallback),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = module.get<RedisService>(RedisService);
    jest.clearAllMocks();
  });

  describe('get / set', () => {
    it('should return the stored value', async () => {
      mockRedisClient.get.mockResolvedValue('value');

      expect(await service.get('key')).toBe('value');
    });

    it('should return null when Redis is unavailable (graceful fallback)', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('down'));

      expect(await service.get('key')).toBeNull();
    });

    it('should set with a TTL when provided', async () => {
      await service.set('key', 'value', 60);

      expect(mockRedisClient.set).toHaveBeenCalledWith('key', 'value', 'EX', 60);
    });

    it('should set without TTL when omitted', async () => {
      await service.set('key', 'value');

      expect(mockRedisClient.set).toHaveBeenCalledWith('key', 'value');
    });

    it('should swallow set errors', async () => {
      mockRedisClient.set.mockRejectedValue(new Error('down'));

      await expect(service.set('key', 'value')).resolves.toBeUndefined();
    });
  });

  describe('del / delByPattern', () => {
    it('should do nothing for an empty key list', async () => {
      await service.del();

      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    it('should delete the given keys', async () => {
      await service.del('a', 'b');

      expect(mockRedisClient.del).toHaveBeenCalledWith('a', 'b');
    });

    it('should scan and delete keys matching a pattern', async () => {
      mockRedisClient.scan
        .mockResolvedValueOnce(['42', ['stats:a', 'stats:b']])
        .mockResolvedValueOnce(['0', ['stats:c']]);

      await service.delByPattern('stats:*');

      expect(mockRedisClient.del).toHaveBeenCalledWith('stats:a', 'stats:b');
      expect(mockRedisClient.del).toHaveBeenCalledWith('stats:c');
    });
  });

  describe('incr / expire', () => {
    it('should return the incremented value', async () => {
      mockRedisClient.incr.mockResolvedValue(3);

      expect(await service.incr('counter')).toBe(3);
    });

    it('should return 0 when Redis is unavailable', async () => {
      mockRedisClient.incr.mockRejectedValue(new Error('down'));

      expect(await service.incr('counter')).toBe(0);
    });

    it('should return 0 when expire fails', async () => {
      mockRedisClient.expire.mockRejectedValue(new Error('down'));

      expect(await service.expire('counter', 60)).toBe(0);
    });
  });

  describe('getOrSet', () => {
    it('should return the cached value without calling the factory', async () => {
      mockRedisClient.get.mockResolvedValue(JSON.stringify({ cached: true }));
      const factory = jest.fn();

      const result = await service.getOrSet('key', 60, factory);

      expect(result).toEqual({ cached: true });
      expect(factory).not.toHaveBeenCalled();
    });

    it('should compute, cache and return the value on cache miss', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      const factory = jest.fn().mockResolvedValue({ fresh: true });

      const result = await service.getOrSet('key', 60, factory);

      expect(result).toEqual({ fresh: true });
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'key',
        JSON.stringify({ fresh: true }),
        'EX',
        60,
      );
    });

    it('should recompute when the cached JSON is corrupted', async () => {
      mockRedisClient.get.mockResolvedValue('{not-json');
      const factory = jest.fn().mockResolvedValue('ok');

      const result = await service.getOrSet('key', 60, factory);

      expect(result).toBe('ok');
      expect(factory).toHaveBeenCalled();
    });
  });

  describe('isHealthy', () => {
    it('should return true on PONG', async () => {
      mockRedisClient.ping.mockResolvedValue('PONG');

      expect(await service.isHealthy()).toBe(true);
    });

    it('should return false when ping fails', async () => {
      mockRedisClient.ping.mockRejectedValue(new Error('down'));

      expect(await service.isHealthy()).toBe(false);
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect the client', async () => {
      await service.onModuleDestroy();

      expect(mockRedisClient.disconnect).toHaveBeenCalled();
    });
  });
});
