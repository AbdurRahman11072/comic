import Redis from 'ioredis';
import { envConfig } from '../config/envConfig';

let redis: Redis | null = null;

export const getRedisClient = () => {
  if (!redis) {
    redis = new Redis(envConfig.REDIS_URL as string);
    redis.on('error', (err) => console.error('Redis Client Error', err));
    redis.on('connect', () => console.log('Redis connected successfully'));
  }
  return redis;
};
