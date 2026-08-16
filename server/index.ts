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

const dev = process.env.NODE_ENV !== "production";
const server = next({ dev });
const handle = server.getRequestHandler();
const port = envConfig.PORT || 3000;

server
  .prepare()
  .then(async () => {
    const app = express();

    app.set('trust proxy', 1);

    // Security & CORS
    app.use(
      cors({
        origin: envConfig.FRONTEND_URL || "*",
        credentials: true,
      }),
    );
    app.use('/api', helmet());
    app.use('/api', apiLimiter);
    app.use('/api/auth', authLimiter);

    // Stripe webhook MUST come before express.json() for raw body
    app.post(
      "/api/v1/payments/webhook",
      express.raw({ type: "application/json" }),
      PaymentController.handleWebhook,
    );

    app.use(express.json());

    // Registration security: apply authLimiter and optional CAPTCHA verification
    app.post("/api/auth/sign-up/email", authLimiter, verifyCaptcha);

    // Better-auth handler
    app.all("/api/auth/*path", toNodeHandler(auth));

    // Health check
    app.get("/api/health", (req: Request, res: Response) => {
      res.json({
        status: "ok",
        timestamp: new Date(),
      });
    });

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
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
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
