import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../utils/redis';

/**
 * Express cache middleware for high-traffic GET endpoints.
 * @param ttlSeconds Time-to-live in seconds (default: 300 = 5 minutes)
 * @param keyPrefix Optional custom prefix for the cache key
 */
export const cacheResponse = (ttlSeconds = 300, keyPrefix?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests without user-specific authorization tokens
    if (req.method !== 'GET' || req.headers.authorization || req.headers.cookie) {
      return next();
    }

    const key = `cache:${keyPrefix || req.baseUrl || ''}:${req.originalUrl || req.url}`;

    try {
      const cached = await cacheService.get(key);
      if (cached) {
        res.setHeader('X-Cache-Status', 'HIT');
        return res.json(cached);
      }

      res.setHeader('X-Cache-Status', 'MISS');

      // Intercept res.json to capture response payload and cache it
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(key, body, ttlSeconds).catch(() => null);
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      next();
    }
  };
};
