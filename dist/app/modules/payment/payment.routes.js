"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const authMiddleware_1 = __importDefault(require("../../middleware/authMiddleware"));
const router = (0, express_1.Router)();
// Get available packages (public)
router.get('/packages', payment_controller_1.PaymentController.getPackages);
// Create checkout session (requires auth)
router.post('/create-checkout-session', (0, authMiddleware_1.default)(['user', 'admin']), payment_controller_1.PaymentController.createCheckoutSession);
// Payment Callbacks
router.get('/success', payment_controller_1.PaymentController.paymentSuccess);
router.get('/cancel', payment_controller_1.PaymentController.paymentCancel);
// Webhook (handled in app.ts for raw body, but logic is in controller)
router.post('/webhook', payment_controller_1.PaymentController.handleWebhook);
exports.PaymentRoutes = router;
