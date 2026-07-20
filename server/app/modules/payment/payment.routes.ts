import { Router } from 'express';
import { PaymentController } from './payment.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();

// Get available packages (public)
router.get('/packages', PaymentController.getPackages);

// Create checkout session (requires auth)
router.post(
  '/create-checkout-session',
  authMiddleware(['user', 'admin']),
  PaymentController.createCheckoutSession
);

// Payment Callbacks
router.get('/success', PaymentController.paymentSuccess);
router.get('/cancel', PaymentController.paymentCancel);

// Webhook (handled in app.ts for raw body, but logic is in controller)
router.post('/webhook', PaymentController.handleWebhook);

export const PaymentRoutes = router;
