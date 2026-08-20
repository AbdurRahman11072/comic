import { Router } from 'express';
import authMiddleware from '../../middleware/authMiddleware';
import { ReferralController } from './referral.controller';

const router = Router();

// Public validation of referral code during sign-up / link visit
router.get('/validate/:code', ReferralController.validateReferralCode);

// Protected referral stats for logged-in users
router.get(
  '/stats',
  authMiddleware(['user', 'creator', 'moderator', 'admin']),
  ReferralController.getReferralStats
);

export const ReferralRoutes = router;
