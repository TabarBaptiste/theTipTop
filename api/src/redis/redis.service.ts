// ===========================================
// Service Redis (cache, compteurs, rate limiting)
// ===========================================

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(configService: ConfigService) {
    this.client = new Redis({
      host: configService.get<string>('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
      password: configService.get<string>('REDIS_PASSWORD') || undefined,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => Math.min(times * 200, 2000),
    });

    this.client.on('error', (err) => {
      this.logger.warn(`Connexion Redis indisponible : ${err.message}`);
    });

    this.client.on('connect', () => {
      this.logger.log('Connecté à Redis');
    });
  }

  async onModuleDestroy() {
    this.client.disconnect();
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (err) {
      this.logger.warn(`GET ${key} a échoué : ${(err as Error).message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (err) {
      this.logger.warn(`SET ${key} a échoué : ${(err as Error).message}`);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      await this.client.del(...keys);
    } catch (err) {
      this.logger.warn(`DEL ${keys.join(', ')} a échoué : ${(err as Error).message}`);
    }
  }

  /**
   * Supprime toutes les clés correspondant à un pattern (ex: "stats:*")
   * via SCAN, sans bloquer Redis comme le ferait KEYS.
   */
  async delByPattern(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== '0');
    } catch (err) {
      this.logger.warn(`DEL pattern "${pattern}" a échoué : ${(err as Error).message}`);
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (err) {
      this.logger.warn(`INCR ${key} a échoué : ${(err as Error).message}`);
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<number> {
    try {
      return await this.client.expire(key, seconds);
    } catch (err) {
      this.logger.warn(`EXPIRE ${key} a échoué : ${(err as Error).message}`);
      return 0;
    }
  }

  /**
   * Pattern cache-aside : lit `key` dans Redis, sinon calcule via `fn`,
   * stocke le résultat (TTL `ttlSeconds`) et le retourne.
   * Si Redis est indisponible, `fn` est exécutée sans cache (fallback silencieux).
   */
  async getOrSet<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const cached = await this.get(key);
    if (cached !== null) {
      try {
        return JSON.parse(cached) as T;
      } catch {
        this.logger.warn(`Cache corrompu pour la clé ${key}, recalcul`);
      }
    }

    const value = await fn();
    await this.set(key, JSON.stringify(value), ttlSeconds);
    return value;
  }

  /**
   * Healthcheck Redis (utilisable par les probes Docker)
   */
  async isHealthy(): Promise<boolean> {
    try {
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }
}
