import { toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import httpStatus from 'http-status';
import pinoHttp from 'pino-http';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import { RootRoutes } from './app/routes';
import { HealthRoutes } from './app/routes/health.routes';
import { apiVersionMiddleware } from './app/middleware/apiVersion';
import { logger } from './app/utils/logger';

import { envConfig } from './app/config/envConfig';
import { apiLimiter, authLimiter } from './app/middleware/rateLimiter';
import { PaymentController } from './app/modules/payment/payment.controller';
import { auth } from './lib/auth';
import { prisma } from './lib/prisma';

const app: Application = express();

app.set('trust proxy', 1);

// Structured HTTP request logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url?.includes('/health') || req.url?.includes('/_next') || false,
    },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = [
        envConfig.FRONTEND_URL,
        envConfig.BACKEND_URL,
        'http://localhost:3000',
        'http://localhost:5000',
        ...(process.env.ADDITIONAL_ORIGINS ? process.env.ADDITIONAL_ORIGINS.split(',').map((s) => s.trim()) : []),
      ];
      if (allowed.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Versioning and client platform detection
app.use(apiVersionMiddleware);

// Security and rate limiting
app.use('/api', helmet());
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// 🩺 Health & Readiness Probes (publicly accessible by orchestrators / uptime bots)
app.use('/health', HealthRoutes);
app.use('/api/health', HealthRoutes);

// Stripe webhook must come before express.json() to get raw body
app.post(
  '/api/v1/payments/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleWebhook
);

app.use(express.json({ limit: '10mb' }));

// Sign-up guard: Check if registration is open and check IP restriction
app.post('/api/auth/sign-up/email', async (req, res, next) => {
  try {
    const config = await prisma.siteConfig.findUnique({ where: { id: 'global' } });
    if (config && config.allowNewRegistrations === false) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: 'New user registrations are currently paused by administration.',
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      return next();
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ipStr = String(ip);

    const existingSession = await prisma.session.findFirst({
      where: { ipAddress: ipStr }
    });

    if (existingSession) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: 'An account has already been created from this IP address.'
      });
    }
    next();
  } catch (error) {
    next(error);
  }
});

app.all('/api/auth/*path', toNodeHandler(auth));
app.use('/api/v1', RootRoutes);

app.use(globalErrorHandler);

export default app;
