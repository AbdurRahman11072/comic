import { Router } from 'express';
import { PromoController } from './promo.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();

router.post('/redeem', authMiddleware(['user', 'creator', 'moderator', 'admin']), PromoController.redeemPromoCode);
router.get('/', authMiddleware(['creator', 'admin']), PromoController.getPromoCodes);
router.post('/', authMiddleware(['creator', 'admin']), PromoController.createPromoCode);
router.delete('/:id', authMiddleware(['creator', 'admin']), PromoController.deletePromoCode);

export const PromoRoutes = router;
