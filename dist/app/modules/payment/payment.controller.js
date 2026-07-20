"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const payment_service_1 = require("./payment.service");
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const envConfig_1 = require("../../config/envConfig");
const getPackages = (0, asyncHandler_1.default)(async (req, res) => {
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Point packages retrieved successfully',
        data: payment_service_1.POINT_PACKAGES,
    });
});
const createCheckoutSession = (0, asyncHandler_1.default)(async (req, res) => {
    const { packageId } = req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const checkoutUrl = await payment_service_1.PaymentService.createCheckoutSession(userId, packageId, userEmail);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Checkout session created successfully',
        data: { checkoutUrl },
    });
});
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const payload = req.body; // Buffer expected
    const result = await payment_service_1.PaymentService.handleWebhook(sig, payload);
    res.status(http_status_1.default.OK).send(result);
};
const paymentSuccess = async (req, res) => {
    const sessionId = req.query.session_id;
    const frontendUrl = envConfig_1.envConfig.FRONTEND_URL || "http://localhost:3000";
    if (sessionId) {
        await payment_service_1.PaymentService.verifyPaymentAndAddPoints(sessionId);
    }
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Successful</title>
      <style>
        body { font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #0a0a0a; color: #ffffff; text-align: center; }
        .container { background: rgba(255, 255, 255, 0.03); padding: 3.5rem; border-radius: 2rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); border: 1px solid rgba(255, 255, 255, 0.06); max-width: 500px; width: 90%; backdrop-filter: blur(12px); }
        h1 { margin-top: 0; color: #e11d48; font-size: 2.25rem; font-weight: 800; letter-spacing: -0.025em; }
        p { margin-bottom: 2.5rem; color: rgba(255, 255, 255, 0.6); line-height: 1.6; font-size: 1.1rem; }
        .btn { display: inline-block; padding: 1rem 2.25rem; background-color: #e11d48; color: #ffffff; text-decoration: none; border-radius: 1rem; font-weight: 700; transition: all 0.2s; box-shadow: 0 10px 15px -3px rgba(225, 29, 72, 0.3); }
        .btn:hover { background-color: #be123c; transform: translateY(-2px); box-shadow: 0 10px 20px -3px rgba(225, 29, 72, 0.45); }
        .icon { font-size: 5.5rem; margin-bottom: 1.5rem; filter: drop-shadow(0 0 20px rgba(225, 29, 72, 0.3)); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🌹</div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase. Your payment was processed successfully, and points have been added to your Genz Toon account.</p>
        <a href="${frontendUrl}/shop?success=true" class="btn">Return to Shop</a>
      </div>
    </body>
    </html>
  `;
    res.send(html);
};
const paymentCancel = (req, res) => {
    const frontendUrl = envConfig_1.envConfig.FRONTEND_URL || "http://localhost:3000";
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Cancelled</title>
      <style>
        body { font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #0a0a0a; color: #ffffff; text-align: center; }
        .container { background: rgba(255, 255, 255, 0.03); padding: 3.5rem; border-radius: 2rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); border: 1px solid rgba(255, 255, 255, 0.06); max-width: 500px; width: 90%; backdrop-filter: blur(12px); }
        h1 { margin-top: 0; color: #f59e0b; font-size: 2.25rem; font-weight: 800; letter-spacing: -0.025em; }
        p { margin-bottom: 2.5rem; color: rgba(255, 255, 255, 0.6); line-height: 1.6; font-size: 1.1rem; }
        .btn { display: inline-block; padding: 1rem 2.25rem; background-color: #f59e0b; color: #000000; text-decoration: none; border-radius: 1rem; font-weight: 700; transition: all 0.2s; box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3); }
        .btn:hover { background-color: #d97706; transform: translateY(-2px); box-shadow: 0 10px 20px -3px rgba(245, 158, 11, 0.45); }
        .icon { font-size: 5.5rem; margin-bottom: 1.5rem; filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.3)); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">⚠️</div>
        <h1>Payment Cancelled</h1>
        <p>You cancelled the payment process. No points were added to your account.</p>
        <a href="${frontendUrl}/shop?canceled=true" class="btn">Return to Shop</a>
      </div>
    </body>
    </html>
  `;
    res.send(html);
};
exports.PaymentController = {
    getPackages,
    createCheckoutSession,
    handleWebhook,
    paymentSuccess,
    paymentCancel,
};
