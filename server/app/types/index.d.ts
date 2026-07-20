import { Role } from '../generated/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: 'user' | 'creator' | 'moderator' | 'admin';
      };
    }
  }
}
