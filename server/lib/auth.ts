import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { prisma } from './prisma';
import { envConfig } from '../app/config/envConfig';

const additionalOrigins = process.env.ADDITIONAL_ORIGINS
  ? process.env.ADDITIONAL_ORIGINS.split(',').map((o) => o.trim())
  : [];

const trustedOrigins: string[] = Array.from(
  new Set([
    envConfig.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    ...additionalOrigins,
  ])
).filter((o): o is string => Boolean(o));

export const auth = betterAuth({
  baseURL: envConfig.APP_URL,
  trustedOrigins,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin()],
});
