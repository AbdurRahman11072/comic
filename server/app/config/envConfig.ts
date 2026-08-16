import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const defaultAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';
const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || defaultAppUrl;
const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || defaultAppUrl;

export const envConfig = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',

  APP_URL: defaultAppUrl,
  FRONTEND_URL: frontendUrl,
  BACKEND_URL: backendUrl,

  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || 'dev_better_auth_secret_comic_bd_super_secure',
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || backendUrl,

  ADMIN_NAME: process.env.ADMIN_NAME,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  REDIS_URL: process.env.REDIS_URL,
};
