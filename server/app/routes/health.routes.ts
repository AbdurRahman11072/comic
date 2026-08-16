import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { getRedisClient } from '../utils/redis';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';

  // 1. Check PostgreSQL Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err: any) {
    dbStatus = `error: ${err?.message || 'failed to query'}`;
  }

  // 2. Check Redis (graceful)
  try {
    const redis = getRedisClient();
    if (redis) {
      const ping = await redis.ping();
      redisStatus = ping === 'PONG' ? 'connected' : 'degraded';
    } else {
      redisStatus = 'disabled_in_memory_fallback';
    }
  } catch (err: any) {
    redisStatus = 'disabled_in_memory_fallback';
  }

  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());
  const responseTimeMs = Date.now() - startTime;

  const isHealthy = dbStatus === 'connected';

  const healthData = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
    uptimeSeconds,
    responseTimeMs,
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
    system: {
      memoryUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      memoryTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      nodeVersion: process.version,
      platform: process.platform,
    },
  };

  return res.status(isHealthy ? 200 : 503).json(healthData);
});

export const HealthRoutes = router;
