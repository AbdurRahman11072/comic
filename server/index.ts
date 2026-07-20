import next from 'next';
import { Request, Response } from 'express';
import app from './app';
import { prisma } from './lib/prisma';
import { envConfig } from './app/config/envConfig';
import notFound from './app/middleware/notFound';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const port = envConfig.PORT || 5000;

nextApp.prepare().then(async () => {
  try {
    await prisma.$connect();
    console.log('Database connection successful');

    // Route non-API requests to Next.js
    app.use((req: Request, res: Response, nextMiddleware) => {
      if (req.path.startsWith('/api')) {
        return nextMiddleware();
      }
      return handle(req, res);
    });

    // Unmatched API requests fall through to the notFound handler
    app.use(notFound);

    app.listen(port, () => {
      console.log(`> Server is running on: http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}).catch((err) => {
  console.error('Error preparing Next.js:', err);
  process.exit(1);
});
