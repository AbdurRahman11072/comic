import express from 'express';
import { WithdrawalController } from './withdrawal.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware(['user', 'creator', 'moderator', 'admin']), WithdrawalController.requestWithdrawal);
router.get('/my-requests', authMiddleware(['user', 'creator', 'moderator', 'admin']), WithdrawalController.getMyRequests);

export const WithdrawalRoutes = router;
