import { z } from 'zod';

export const buyPointsSchema = z.object({
  body: z.object({
    packageId: z.string().min(1, 'Package ID is required'),
    paymentMethod: z.enum(['STRIPE', 'BKASH', 'NAGAD', 'ROCKET', 'MANUAL']).default('STRIPE'),
  }),
});

export const buyChapterSchema = z.object({
  body: z.object({
    chapterId: z.string().min(1, 'Chapter ID is required'),
  }),
});

export const buyBulkChaptersSchema = z.object({
  body: z.object({
    chapterIds: z.array(z.string().min(1)).min(1, 'Please select at least one chapter'),
    promoCode: z.string().optional(),
  }),
});

export const requestWithdrawalSchema = z.object({
  body: z.object({
    points: z.number().min(100, 'Minimum withdrawal is 100 points'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
    accountDetails: z.string().min(3, 'Account details are required'),
  }),
});

export const redeemPromoSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Promo code is required').max(50),
  }),
});
