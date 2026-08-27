import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.BETTER_AUTH_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  (process.env.PORT ? `http://127.0.0.1:${process.env.PORT}` : 'http://localhost:5000');

export const envConfig = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,

  APP_URL: appUrl,
  FRONTEND_URL: appUrl,
  BACKEND_URL: appUrl,

  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,

  ADMIN_NAME: process.env.ADMIN_NAME,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  REDIS_URL: process.env.REDIS_URL,

  RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL,
  KEEP_ALIVE_URL: process.env.KEEP_ALIVE_URL,
  KEEP_ALIVE_INTERVAL_MINUTES: Number(process.env.KEEP_ALIVE_INTERVAL_MINUTES) || 10,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || 'Comic BD <onboarding@resend.dev>',
};

