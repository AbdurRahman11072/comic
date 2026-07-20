import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { prisma } from './prisma';
import { envConfig } from '../app/config/envConfig';

export const auth = betterAuth({
  baseURL: envConfig.BACKEND_URL,
  trustedOrigins: [envConfig.FRONTEND_URL as string],
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin()],
});
