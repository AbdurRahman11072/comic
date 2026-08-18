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
// Server initialized with full dynamic robots, sitemap & contact route indexing

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

    // SEO routes (robots.txt and dynamic sitemap.xml)
    app.get("/robots.txt", (req: Request, res: Response) => {
      const baseUrl = envConfig.FRONTEND_URL || "https://comicbd.com";
      const robotsTxt = `# Comic BD - Search Engine & Crawler Policy
User-agent: *
Allow: /
Allow: /series
Allow: /series/*
Allow: /latest
Allow: /bookmarks
Allow: /history
Allow: /channel/*
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /terms
Allow: /dmca
Allow: /shop
Allow: /rewards
Allow: /become-creator

# Restricted Private Routes
Disallow: /dashboard
Disallow: /dashboard/*
Disallow: /api/*
Disallow: /stripe-sandbox
Disallow: /profile
Disallow: /transactions

# Crawl Delay & Sitemap Index
Crawl-delay: 1
Sitemap: ${baseUrl}/sitemap.xml
`;
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.status(200).send(robotsTxt);
    });

    app.get("/sitemap.xml", async (req: Request, res: Response) => {
      const baseUrl = envConfig.FRONTEND_URL || "https://comicbd.com";
      try {
        const staticPages = [
          { url: `${baseUrl}/`, priority: "1.0", changefreq: "always" },
          { url: `${baseUrl}/latest`, priority: "0.9", changefreq: "hourly" },
          { url: `${baseUrl}/about`, priority: "0.7", changefreq: "monthly" },
          { url: `${baseUrl}/contact`, priority: "0.7", changefreq: "monthly" },
          { url: `${baseUrl}/privacy`, priority: "0.5", changefreq: "monthly" },
          { url: `${baseUrl}/terms`, priority: "0.5", changefreq: "monthly" },
          { url: `${baseUrl}/dmca`, priority: "0.5", changefreq: "monthly" },
          { url: `${baseUrl}/become-creator`, priority: "0.6", changefreq: "monthly" },
          { url: `${baseUrl}/rewards`, priority: "0.6", changefreq: "weekly" },
          { url: `${baseUrl}/shop`, priority: "0.7", changefreq: "weekly" },
        ];

        const seriesList = await prisma.series.findMany({
          where: { isHidden: false },
          select: {
            slug: true,
            updatedAt: true,
            chapters: {
              select: {
                number: true,
                createdAt: true,
              },
              orderBy: { number: "desc" },
            },
          },
          take: 1000,
        });

        const creators = await prisma.creatorProfile.findMany({
          select: {
            userId: true,
            updatedAt: true,
          },
          take: 200,
        });

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        for (const page of staticPages) {
          xml += `  <url>\n    <loc>${page.url}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
        }

        for (const s of seriesList) {
          xml += `  <url>\n    <loc>${baseUrl}/series/${s.slug}</loc>\n    <lastmod>${new Date(s.updatedAt).toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;

          for (const c of s.chapters) {
            xml += `  <url>\n    <loc>${baseUrl}/series/${s.slug}/chapter-${c.number}</loc>\n    <lastmod>${new Date(c.createdAt).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
          }
        }

        for (const cr of creators) {
          xml += `  <url>\n    <loc>${baseUrl}/channel/${cr.userId}</loc>\n    <lastmod>${new Date(cr.updatedAt).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
        }

        xml += `</urlset>`;

        res.setHeader("Content-Type", "application/xml");
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.status(200).send(xml);
      } catch (error) {
        console.error("Error generating sitemap XML:", error);
        res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
      }
    });

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
