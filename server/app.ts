import { toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import { RootRoutes } from './app/routes';

import { envConfig } from './app/config/envConfig';
import { apiLimiter, authLimiter } from './app/middleware/rateLimiter';
import { PaymentController } from './app/modules/payment/payment.controller';
import { auth } from './lib/auth';
import { prisma } from './lib/prisma';

const app: Application = express();

app.set('trust proxy', 1);

app.use(
  cors({
    origin: envConfig.FRONTEND_URL,
    credentials: true,
  })
);

app.use('/api', helmet());
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Stripe webhook must come before express.json() to get raw body
// Both the raw body parser AND the handler must be on this route
app.post(
  '/api/v1/payments/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleWebhook
);

app.use(express.json());

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
