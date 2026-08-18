import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import type { Request, Response } from "express";
import express from "express";
import helmet from "helmet";
import httpStatus from "http-status";
import next from "next";
import { auth } from "./lib/auth";
import { prisma } from "./lib/prisma";

import { envConfig } from "./app/config/envConfig";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import { PaymentController } from "./app/modules/payment/payment.controller";
import { RootRoutes } from "./app/routes";
import { apiLimiter, authLimiter } from "./app/middleware/rateLimiter";
import { verifyCaptcha } from "./app/middleware/captchaMiddleware";

import pinoHttp from "pino-http";
import { logger } from "./app/utils/logger";
import { apiVersionMiddleware } from "./app/middleware/apiVersion";
import { HealthRoutes } from "./app/routes/health.routes";

import { initKeepAliveCron, stopKeepAliveCron } from "./app/utils/keepAlive";

const dev = process.env.NODE_ENV !== "production";
const server = next({ dev });
const handle = server.getRequestHandler();
const port = envConfig.PORT || 3000;
// Server initialized with full dynamic route indexing

server
  .prepare()
  .then(async () => {
    const app = express();

    app.set('trust proxy', 1);

    // Structured HTTP request logging
    app.use(
      pinoHttp({
        logger,
        autoLogging: {
          ignore: (req) =>
            req.url?.includes("/health") ||
            req.url?.includes("/_next") ||
            req.url?.includes("/api/health") ||
            false,
        },
      })
    );

    // Security & CORS
    app.use(
      cors({
        origin: envConfig.FRONTEND_URL || "*",
        credentials: true,
      }),
    );

    app.use(apiVersionMiddleware);
    app.use('/api', helmet());
    app.use('/api', apiLimiter);
    app.use('/api/auth', authLimiter);

    // Health checks (both root and api paths)
    app.use("/health", HealthRoutes);
    app.use("/api/health", HealthRoutes);

    // Stripe webhook MUST come before express.json() for raw body
    app.post(
      "/api/v1/payments/webhook",
      express.raw({ type: "application/json" }),
      PaymentController.handleWebhook,
    );

    app.use(express.json({ limit: "10mb" }));

    // Registration security: apply authLimiter and optional CAPTCHA verification
    app.post("/api/auth/sign-up/email", authLimiter, verifyCaptcha);

    // Better-auth handler
    app.all("/api/auth/*path", toNodeHandler(auth));

    // API routes - BEFORE Next.js handler
    app.use("/api/v1", RootRoutes);

    // Next.js handler for all other routes (must be last)
    app.use((req: Request, res: Response) => {
      return handle(req, res);
    });

    // Error handling (after Next.js catch-all to handle API errors)
    app.use(globalErrorHandler);
    app.use(notFound);

    // Database connection
    await prisma.$connect();
    console.log("Database connection successful");

    const httpServer = app.listen(port, () => {
      console.log(`> Server is running on: http://localhost:${port}`);
      initKeepAliveCron();
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      stopKeepAliveCron();
      httpServer.close(async () => {
        await prisma.$disconnect();
        console.log("Database connection closed.");
        process.exit(0);
      });

      setTimeout(() => {
        console.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  })
  .catch(async (err) => {
    await prisma.$disconnect();
    console.error("Error starting server", err);
    process.exit(1);
  });
