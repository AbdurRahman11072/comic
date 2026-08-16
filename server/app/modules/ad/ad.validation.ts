import { z } from 'zod';

export const createAdSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(150),
    provider: z.enum(['CUSTOM', 'ADSENSE', 'ADMOB']).default('CUSTOM'),
    format: z.enum(['BANNER', 'INTERSTITIAL', 'REWARDED', 'NATIVE']).default('BANNER'),
    placement: z.string().min(1, 'Placement is required'),
    imageUrl: z.string().optional().or(z.literal('')),
    linkUrl: z.string().optional().or(z.literal('')),
    videoUrl: z.string().optional().or(z.literal('')),
    adType: z.enum(['BANNER', 'VIDEO', 'SOCIAL']).optional().default('BANNER'),
    adClient: z.string().optional(),
    adSlotId: z.string().optional(),
    adUnitId: z.string().optional(),
    points: z.number().min(0).optional().default(10),
    isActive: z.boolean().optional().default(true),
    status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).optional().default('ACTIVE'),
    targetCountries: z.array(z.string()).optional().default([]),
  }),
});

export const updateAdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Ad ID is required'),
  }),
  body: z.object({
    title: z.string().min(1).max(150).optional(),
    provider: z.enum(['CUSTOM', 'ADSENSE', 'ADMOB']).optional(),
    format: z.enum(['BANNER', 'INTERSTITIAL', 'REWARDED', 'NATIVE']).optional(),
    placement: z.string().optional(),
    imageUrl: z.string().optional().or(z.literal('')),
    linkUrl: z.string().optional().or(z.literal('')),
    videoUrl: z.string().optional().or(z.literal('')),
    adType: z.enum(['BANNER', 'VIDEO', 'SOCIAL']).optional(),
    adClient: z.string().optional(),
    adSlotId: z.string().optional(),
    adUnitId: z.string().optional(),
    points: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
    status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
    targetCountries: z.array(z.string()).optional(),
  }),
});

export const earnAdPointsSchema = z.object({
  body: z.object({
    adId: z.string().optional(),
  }),
});
