import { toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import helmet from 'helmet';
import express, { Application } from 'express';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import notFound from './app/middleware/notFound';
import { RootRoutes } from './app/routes';

import { envConfig } from './app/config/envConfig';
import { auth } from './lib/auth';
import { PaymentController } from './app/modules/payment/payment.controller';
import { prisma } from './lib/prisma';

const app: Application = express();

app.use(
  cors({
    origin: envConfig.FRONTEND_URL,
    credentials: true,
  })
);

app.use('/api', helmet());

// Stripe webhook must come before express.json() to get raw body
// Both the raw body parser AND the handler must be on this route
app.post(
  '/api/v1/payments/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleWebhook
);

app.use(express.json());

// IP Address restriction for signup (1 account per IP)
app.post('/api/auth/sign-up/email', async (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const ipStr = String(ip);

  try {
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
