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
const server = next({
  dev,
  dir: process.cwd(),
  turbopack: false,
});
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

    // Security & CORS (Dynamic multi-origin support for local and cloud deployments)
    app.use(
      cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (mobile apps, curl, same-origin)
          if (!origin) {
            return callback(null, true);
          }
          // Dynamically allow requesting origin for seamless CORS with credentials
          return callback(null, origin);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'Cookie',
          'X-Requested-With',
          'Accept',
          'Origin',
          'Cache-Control',
          'Pragma',
          'X-Api-Version',
        ],
        exposedHeaders: ['Set-Cookie'],
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

    const getBaseUrl = (req: Request): string => {
      const configuredUrl = (envConfig.FRONTEND_URL || envConfig.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/+$/, "");
      if (configuredUrl) return configuredUrl;
      const protocol = (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";
      const host = (req.headers["x-forwarded-host"] as string) || req.get("host") || "";
      return host ? `${protocol}://${host}` : "";
    };

    // SEO routes (robots.txt and dynamic sitemap.xml)
    app.get("/robots.txt", (req: Request, res: Response) => {
      const baseUrl = getBaseUrl(req);
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

    app.get("/sitemap.xml", (req: Request, res: Response) => {
      const baseUrl = getBaseUrl(req);
      const now = new Date().toISOString();
      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap>
<loc>${baseUrl}/sitemap-static.xml</loc>
<lastmod>${now}</lastmod>
</sitemap>
<sitemap>
<loc>${baseUrl}/sitemap-series.xml</loc>
<lastmod>${now}</lastmod>
</sitemap>
<sitemap>
<loc>${baseUrl}/sitemap-novels.xml</loc>
<lastmod>${now}</lastmod>
</sitemap>
<sitemap>
<loc>${baseUrl}/sitemap-novel-chapters.xml</loc>
<lastmod>${now}</lastmod>
</sitemap>
<sitemap>
<loc>${baseUrl}/sitemap-chapters-1.xml</loc>
<lastmod>${now}</lastmod>
</sitemap>
</sitemapindex>`;

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.status(200).send(sitemapIndex);
    });

    // Sub-sitemaps referenced in sitemapindex
    app.get("/sitemap-static.xml", (req: Request, res: Response) => {
      const baseUrl = getBaseUrl(req);
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

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      for (const page of staticPages) {
        xml += `  <url>\n    <loc>${page.url}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
      }
      xml += `</urlset>`;

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.status(200).send(xml);
    });

    app.get("/sitemap-series.xml", async (req: Request, res: Response) => {
      const baseUrl = getBaseUrl(req);
      try {
        const seriesList = await prisma.series.findMany({
          where: { isHidden: false },
          select: {
            slug: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: "desc" },
          take: 50000,
        });

        const creators = await prisma.creatorProfile.findMany({
          select: {
            userId: true,
            updatedAt: true,
          },
          take: 500,
        });

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        for (const s of seriesList) {
          xml += `  <url>\n    <loc>${baseUrl}/series/${s.slug}</loc>\n    <lastmod>${new Date(s.updatedAt).toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
        }

        for (const cr of creators) {
          xml += `  <url>\n    <loc>${baseUrl}/channel/${cr.userId}</loc>\n    <lastmod>${new Date(cr.updatedAt).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
        }

        xml += `</urlset>`;

        res.setHeader("Content-Type", "application/xml; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.status(200).send(xml);
      } catch (error) {
        console.error("Error generating series sitemap XML:", error);
        res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
      }
    });

    app.get("/sitemap-novels.xml", (req: Request, res: Response) => {
      const baseUrl = getBaseUrl(req);
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${baseUrl}/series</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.5</priority>\n  </url>\n</urlset>`;
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.status(200).send(xml);
    });

    app.get("/sitemap-novel-chapters.xml", (req: Request, res: Response) => {
      const baseUrl = getBaseUrl(req);
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${baseUrl}/latest</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>0.5</priority>\n  </url>\n</urlset>`;
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.status(200).send(xml);
    });

    const handleChapterSitemap = async (req: Request, res: Response) => {
      const baseUrl = getBaseUrl(req);
      const pageNum = parseInt((req.params as any).page || "1", 10) || 1;
      const pageSize = 10000;
      const skip = (pageNum - 1) * pageSize;

      try {
        const chapters = await prisma.chapter.findMany({
          where: {
            series: { isHidden: false },
          },
          select: {
            number: true,
            createdAt: true,
            series: {
              select: {
                slug: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        });

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        for (const c of chapters) {
          if (c.series?.slug) {
            xml += `  <url>\n    <loc>${baseUrl}/series/${c.series.slug}/chapter-${c.number}</loc>\n    <lastmod>${new Date(c.createdAt).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
          }
        }

        xml += `</urlset>`;

        res.setHeader("Content-Type", "application/xml; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.status(200).send(xml);
      } catch (error) {
        console.error("Error generating chapters sitemap XML:", error);
        res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
      }
    };

    app.get("/sitemap-chapters-1.xml", handleChapterSitemap);
    app.get("/sitemap-chapters-:page.xml", handleChapterSitemap);

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
