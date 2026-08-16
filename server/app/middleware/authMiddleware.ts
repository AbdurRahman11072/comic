import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { auth } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
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

      // Fetch user from DB to check current banned / frozen / role status in real time
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          banned: true,
          banReason: true,
          banExpires: true,
          transactionsFrozen: true,
        },
      });

      if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User no longer exists');
      }

      // Check if user is banned
      if (user.banned) {
        const isExpired = user.banExpires && new Date(user.banExpires) < new Date();
        if (!isExpired) {
          throw new AppError(
            httpStatus.FORBIDDEN,
            `Account suspended: ${user.banReason || 'Terms violation. Please contact support.'}`
          );
        }
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'user' | 'creator' | 'moderator' | 'admin',
        banned: user.banned,
        banReason: user.banReason,
        transactionsFrozen: user.transactionsFrozen,
      };

      if (roles.length > 0 && !roles.includes(user.role as string)) {
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
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          banned: true,
          banReason: true,
          transactionsFrozen: true,
        },
      });

      if (user && !user.banned) {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as 'user' | 'creator' | 'moderator' | 'admin',
          banned: user.banned,
          banReason: user.banReason,
          transactionsFrozen: user.transactionsFrozen,
        };
      }
    }
    next();
  } catch (error) {
    next();
  }
};

export default authMiddleware;
