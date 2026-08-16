import Redis from 'ioredis';
import { envConfig } from '../config/envConfig';
import { logger } from './logger';

let redis: Redis | null = null;
let isRedisAvailable = false;

// Fallback in-memory cache for development or when Redis is offline
const memoryCache = new Map<string, { value: string; expiresAt: number }>();

export const getRedisClient = (): Redis | null => {
  if (!envConfig.REDIS_URL) {
    return null;
  }

  if (!redis) {
    try {
      redis = new Redis(envConfig.REDIS_URL, {
        maxRetriesPerRequest: 2,
        connectTimeout: 4000,
        retryStrategy: (times) => {
          if (times > 3) {
            isRedisAvailable = false;
            return null; // Stop retrying and fallback to in-memory
          }
          return Math.min(times * 500, 2000);
        },
      });

      redis.on('connect', () => {
        isRedisAvailable = true;
        logger.info('🚀 Redis connected successfully');
      });

      redis.on('error', (err) => {
        isRedisAvailable = false;
        logger.warn({ err: err.message }, 'Redis offline, using in-memory cache fallback');
      });
    } catch (e: any) {
      isRedisAvailable = false;
      logger.warn({ err: e.message }, 'Failed to initialize Redis client');
    }
  }

  return redis;
};

// Initialize client immediately
getRedisClient();

export const cacheService = {
  /** Get cached item parsed from JSON */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const client = getRedisClient();
      if (isRedisAvailable && client) {
        const raw = await client.get(key);
        if (raw) return JSON.parse(raw);
      }
    } catch (err) {
      // ignore redis error and check memory
    }

    // Check in-memory fallback
    const memItem = memoryCache.get(key);
    if (memItem) {
      if (Date.now() < memItem.expiresAt) {
        return JSON.parse(memItem.value);
      }
      memoryCache.delete(key);
    }

    return null;
  },

  /** Set cache key with TTL in seconds */
  set: async (key: string, data: any, ttlSeconds = 300): Promise<void> => {
    const stringified = JSON.stringify(data);

    try {
      const client = getRedisClient();
      if (isRedisAvailable && client) {
        await client.set(key, stringified, 'EX', ttlSeconds);
      }
    } catch (err) {
      // ignore
    }

    // Always keep in memory fallback
    memoryCache.set(key, {
      value: stringified,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  },

  /** Delete cache key */
  del: async (key: string): Promise<void> => {
    try {
      const client = getRedisClient();
      if (isRedisAvailable && client) {
        await client.del(key);
      }
    } catch (err) {
      // ignore
    }
    memoryCache.delete(key);
  },

  /** Invalidate multiple keys by pattern prefix (e.g. "series:*") */
  delByPattern: async (pattern: string): Promise<void> => {
    try {
      const client = getRedisClient();
      if (isRedisAvailable && client) {
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
          await client.del(...keys);
        }
      }
    } catch (err) {
      // ignore
    }

    // Invalidate matching memory keys
    const regex = new RegExp(`^${pattern.replace('*', '.*')}$`);
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
  },
};
