import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { auth } from '../../lib/auth';
import AppError from '../error/AppError';

const authMiddleware = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });

      if (!session) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          'Unauthorized. Please log in first'
        );
      }

      req.user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role as 'user' | 'creator' | 'moderator' | 'admin',
      };

      if (roles.length > 0 && !roles.includes(session.user.role as string)) {
        throw new AppError(httpStatus.FORBIDDEN, 'Unauthorized access');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (session) {
      req.user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role as 'user' | 'creator' | 'moderator' | 'admin',
      };
    }
    next();
  } catch (error) {
    next();
  }
};

export default authMiddleware;
