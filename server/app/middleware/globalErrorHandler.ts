import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { logger } from '../utils/logger';

const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isDev = process.env.NODE_ENV === 'development';
  let statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = error.message || 'Something went wrong';

  if (error.code === 'P2002') {
    statusCode = httpStatus.CONFLICT;
    message = 'A record with this value already exists';
  }

  // Structured logging
  logger.error({
    err: error,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip,
    statusCode,
  }, `[API_ERROR] ${req.method} ${req.originalUrl || req.url} - ${message}`);

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(isDev && {
      stackTrace: error.stack,
    }),
  });
};

export default globalErrorHandler;
