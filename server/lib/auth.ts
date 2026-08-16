import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { prisma } from './prisma';
import { envConfig } from '../app/config/envConfig';

const additionalOrigins = process.env.ADDITIONAL_ORIGINS
  ? process.env.ADDITIONAL_ORIGINS.split(',').map((o) => o.trim())
  : [];

const trustedOrigins = Array.from(
  new Set([
    envConfig.FRONTEND_URL,
    envConfig.BACKEND_URL,
    'http://localhost:3000',
    'http://localhost:5000',
    ...additionalOrigins,
  ])
).filter(Boolean);

export const auth = betterAuth({
  baseURL: envConfig.BACKEND_URL,
  trustedOrigins,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin()],
});
