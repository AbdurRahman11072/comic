"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("better-auth/node");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_1 = __importDefault(require("express"));
const http_status_1 = __importDefault(require("http-status"));
const globalErrorHandler_1 = __importDefault(require("./app/middleware/globalErrorHandler"));
const routes_1 = require("./app/routes");
const envConfig_1 = require("./app/config/envConfig");
const auth_1 = require("./lib/auth");
const payment_controller_1 = require("./app/modules/payment/payment.controller");
const prisma_1 = require("./lib/prisma");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: envConfig_1.envConfig.FRONTEND_URL,
    credentials: true,
}));
app.use('/api', (0, helmet_1.default)());
// Stripe webhook must come before express.json() to get raw body
// Both the raw body parser AND the handler must be on this route
app.post('/api/v1/payments/webhook', express_1.default.raw({ type: 'application/json' }), payment_controller_1.PaymentController.handleWebhook);
app.use(express_1.default.json());
// IP Address restriction for signup (1 account per IP)
app.post('/api/auth/sign-up/email', async (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ipStr = String(ip);
    try {
        const existingSession = await prisma_1.prisma.session.findFirst({
            where: { ipAddress: ipStr }
        });
        if (existingSession) {
            return res.status(http_status_1.default.FORBIDDEN).json({
                success: false,
                message: 'An account has already been created from this IP address.'
            });
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
app.all('/api/auth/*path', (0, node_1.toNodeHandler)(auth_1.auth));
app.use('/api/v1', routes_1.RootRoutes);
app.use(globalErrorHandler_1.default);
exports.default = app;
