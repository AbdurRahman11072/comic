import { NextFunction, Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      clientPlatform?: string;
      apiVersion?: string;
    }
  }
}

export const apiVersionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const CURRENT_API_VERSION = '1.0.0';
  const requestedVersion = (req.headers['x-api-version'] as string) || '1.0.0';
  const clientPlatform = (req.headers['x-client-platform'] as string) || 'web';

  req.apiVersion = requestedVersion;
  req.clientPlatform = clientPlatform;

  // Set API negotiation headers
  res.setHeader('X-API-Version', CURRENT_API_VERSION);
  res.setHeader('X-Supported-Versions', '1.0.0');

  next();
};
