import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../error/AppError';

const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isDev = process.env.NODE_ENV === 'development';
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Something went wrong';

  if (error.code === 'P2002') {
    statusCode = httpStatus.CONFLICT;
    message = 'Record already exists';
  }

  if (isDev) {
    console.error('API Error:', error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && {
      error: error,
      stackTrace: error.stack,
    }),
  });
};

export default globalErrorHandler;
