"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const envConfig_1 = require("../config/envConfig");
let redis = null;
const getRedisClient = () => {
    if (!redis) {
        redis = new ioredis_1.default(envConfig_1.envConfig.REDIS_URL);
        redis.on('error', (err) => console.error('Redis Client Error', err));
        redis.on('connect', () => console.log('Redis connected successfully'));
    }
    return redis;
};
exports.getRedisClient = getRedisClient;
