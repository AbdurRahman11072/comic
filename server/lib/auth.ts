import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { prisma } from './prisma';
import { envConfig } from '../app/config/envConfig';
import { generateUniqueReferralCode } from '../app/utils/referralCode';
import { sendPasswordResetEmail, sendVerificationEmail } from '../app/utils/emailService';

const additionalOrigins = process.env.ADDITIONAL_ORIGINS
  ? process.env.ADDITIONAL_ORIGINS.split(',').map((o) => o.trim())
  : [];

const trustedOrigins: string[] = Array.from(
  new Set([
    envConfig.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.BETTER_AUTH_URL,
    process.env.RENDER_EXTERNAL_URL,
    'https://comicbd.onrender.com',
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
  user: {
    additionalFields: {
      referralCode: {
        type: 'string',
        required: false,
      },
      referredById: {
        type: 'string',
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user: any, context?: any) => {
          // 1. Always generate a fresh unique referral code for the newly registered user
          user.referralCode = await generateUniqueReferralCode();

          // 2. Resolve referrer if referral code was supplied during registration
          const bodyRefCode = (
            context?.body?.referredByCode ||
            context?.body?.referralCode ||
            ''
          )
            .toString()
            .trim();

          if (bodyRefCode) {
            const referrer = await prisma.user.findFirst({
              where: {
                referralCode: {
                  equals: bodyRefCode,
                  mode: 'insensitive',
                },
              },
              select: { id: true },
            });

            if (referrer && referrer.id !== user.id) {
              user.referredById = referrer.id;
            }
          }

          return { data: user };
        },
        after: async (user: any) => {
          if (!user?.referredById) return;

          try {
            const config = await prisma.siteConfig.findFirst({
              select: { referralSignupBonus: true },
            });
            const signupBonus = config?.referralSignupBonus ?? 50;

            if (signupBonus > 0) {
              // Award welcome bonus points to new user
              await prisma.user.update({
                where: { id: user.id },
                data: { points: { increment: signupBonus } },
              });
              await prisma.pointTransaction.create({
                data: {
                  userId: user.id,
                  type: 'REFERRAL_BONUS',
                  amount: signupBonus,
                  description: 'Welcome bonus for joining via referral code',
                },
              });

              // Award bonus points to referrer
              await prisma.user.update({
                where: { id: user.referredById },
                data: { points: { increment: signupBonus } },
              });
              await prisma.pointTransaction.create({
                data: {
                  userId: user.referredById,
                  type: 'REFERRAL_BONUS',
                  amount: signupBonus,
                  description: `Referral bonus for inviting ${user.name || user.email}`,
                },
              });
            }
          } catch (error) {
            console.error('Error granting referral signup bonus:', error);
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data) {
      await sendPasswordResetEmail({
        to: data.user.email,
        name: data.user.name,
        resetUrl: data.url,
      });
    },
  },
  emailVerification: {
    async sendVerificationEmail(data) {
      await sendVerificationEmail({
        to: data.user.email,
        name: data.user.name,
        verificationUrl: data.url,
      });
    },
  },
  plugins: [admin()],
});
