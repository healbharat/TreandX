import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis | null = null;
  private inMemoryCache = new Map<string, { value: string; expiry: number }>();

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get('REDIS_HOST');
    const port = this.configService.get('REDIS_PORT');

    if (host && port) {
      this.redisClient = new Redis({
        host,
        port,
        lazyConnect: true,
        retryStrategy: (times) => {
          if (times > 1) {
            console.warn('[REDIS] Connection failed. Falling back to In-Memory storage.');
            return null; // Stop retrying
          }
          return 50;
        },
      });

      this.redisClient.on('error', (err) => {
        // Silently handle error to allow fallback
        this.redisClient = null;
      });
    }
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.quit();
    }
  }

  async set(key: string, value: string, expirySeconds?: number) {
    if (this.redisClient) {
      try {
        if (expirySeconds) {
          await this.redisClient.set(key, value, 'EX', expirySeconds);
          return;
        } else {
          await this.redisClient.set(key, value);
          return;
        }
      } catch (err) {
        this.redisClient = null;
      }
    }

    // Fallback: In-Memory
    const expiry = expirySeconds ? Date.now() + expirySeconds * 1000 : Infinity;
    this.inMemoryCache.set(key, { value, expiry });
  }

  async get(key: string): Promise<string | null> {
    if (this.redisClient) {
      try {
        return await this.redisClient.get(key);
      } catch (err) {
        this.redisClient = null;
      }
    }

    // Fallback: In-Memory
    const item = this.inMemoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.inMemoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  async del(key: string) {
    if (this.redisClient) {
      try {
        await this.redisClient.del(key);
        return;
      } catch (err) {
        this.redisClient = null;
      }
    }
    this.inMemoryCache.delete(key);
  }
}
