import crypto from 'crypto';
import { prisma } from '../../lib/prisma';

/**
 * Generates a clean, user-friendly, unique referral code (e.g., CBD-7X9K2M)
 */
export const generateUniqueReferralCode = async (prefix: string = 'CBD'): Promise<string> => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars like 0, O, 1, I
  let attempts = 0;
  
  while (attempts < 10) {
    let code = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      code += chars[bytes[i] % chars.length];
    }
    const fullCode = `${prefix}-${code}`;

    const existing = await prisma.user.findUnique({
      where: { referralCode: fullCode },
      select: { id: true },
    });

    if (!existing) {
      return fullCode;
    }
    attempts++;
  }

  // Fallback with timestamp suffix if collisions happen
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
};
