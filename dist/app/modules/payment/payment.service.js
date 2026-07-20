"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = exports.POINT_PACKAGES = void 0;
const stripe_1 = __importDefault(require("stripe"));
const envConfig_1 = require("../../config/envConfig");
const prisma_1 = require("../../../lib/prisma");
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const stripe = new stripe_1.default(envConfig_1.envConfig.STRIPE_SECRET_KEY);
exports.POINT_PACKAGES = [
    { id: 'pkg_1', points: 100, price: 1.00, name: '100 Points Starter' },
    { id: 'pkg_2', points: 500, price: 4.50, name: '500 Points Pro' },
    { id: 'pkg_3', points: 1200, price: 10.00, name: '1200 Points Mega' },
    { id: 'pkg_4', points: 3000, price: 24.00, name: '3000 Points Ultimate' },
];
const createCheckoutSession = async (userId, packageId, userEmail) => {
    const pkg = exports.POINT_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Package not found');
    }
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: userEmail,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: pkg.name,
                        description: `Purchase ${pkg.points} points for Genz Toon`,
                    },
                    unit_amount: Math.round(pkg.price * 100), // Stripe expects cents
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${envConfig_1.envConfig.BACKEND_URL}/api/v1/payments/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${envConfig_1.envConfig.BACKEND_URL}/api/v1/payments/cancel`,
        metadata: {
            userId,
            packageId,
            points: pkg.points.toString(),
        },
    });
    // Create a PENDING payment record in the database
    await prisma_1.prisma.payment.create({
        data: {
            amount: pkg.price,
            points: pkg.points,
            currency: 'usd',
            status: 'PENDING',
            stripeSessionId: session.id,
            userId,
            packageId,
        },
    });
    return session.url;
};
const verifyPaymentAndAddPoints = async (sessionId) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
            const userId = session.metadata?.userId;
            const packageId = session.metadata?.packageId;
            const points = parseInt(session.metadata?.points || '0');
            if (userId && points > 0) {
                const payment = await prisma_1.prisma.payment.findUnique({
                    where: { stripeSessionId: sessionId },
                });
                if (payment && payment.status !== 'COMPLETED') {
                    await prisma_1.prisma.$transaction([
                        prisma_1.prisma.payment.update({
                            where: { stripeSessionId: sessionId },
                            data: {
                                status: 'COMPLETED',
                                stripePaymentId: session.payment_intent,
                            },
                        }),
                        prisma_1.prisma.user.update({
                            where: { id: userId },
                            data: { points: { increment: points } },
                        }),
                        prisma_1.prisma.pointTransaction.create({
                            data: {
                                userId,
                                amount: points,
                                type: 'BUY_POINTS',
                                description: `Purchased ${points} points via Stripe`,
                            },
                        }),
                    ]);
                    console.log(`[Stripe Verification] Successfully added ${points} points to user ${userId}`);
                    return true;
                }
                else if (payment && payment.status === 'COMPLETED') {
                    // Already completed
                    return true;
                }
            }
        }
        return false;
    }
    catch (error) {
        console.error('[Stripe Verification] Error manually verifying payment session:', error);
        return false;
    }
};
const handleWebhook = async (sig, payload) => {
    let event;
    if (sig === 'mock-signature' && envConfig_1.envConfig.NODE_ENV === 'development') {
        try {
            event = JSON.parse(payload.toString());
        }
        catch (err) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Mock Webhook Parse Error: ${err.message}`);
        }
    }
    else {
        try {
            event = stripe.webhooks.constructEvent(payload, sig, envConfig_1.envConfig.STRIPE_WEBHOOK_SECRET);
        }
        catch (err) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Webhook Error: ${err.message}`);
        }
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const points = parseInt(session.metadata?.points || '0');
        console.log(`[Stripe Webhook] checkout.session.completed received. userId: ${userId}, points: ${points}`);
        if (userId && points > 0) {
            try {
                const payment = await prisma_1.prisma.payment.findUnique({
                    where: { stripeSessionId: session.id },
                });
                if (payment && payment.status !== 'COMPLETED') {
                    await prisma_1.prisma.$transaction([
                        prisma_1.prisma.payment.update({
                            where: { stripeSessionId: session.id },
                            data: {
                                status: 'COMPLETED',
                                stripePaymentId: session.payment_intent,
                            },
                        }),
                        prisma_1.prisma.user.update({
                            where: { id: userId },
                            data: { points: { increment: points } },
                        }),
                        prisma_1.prisma.pointTransaction.create({
                            data: {
                                userId,
                                amount: points,
                                type: 'BUY_POINTS',
                                description: `Purchased ${points} points via Stripe`,
                            },
                        }),
                    ]);
                    console.log(`[Stripe Webhook] Successfully added ${points} points to user ${userId}`);
                }
                else {
                    console.log(`[Stripe Webhook] Payment already completed or not found for session ${session.id}`);
                }
            }
            catch (dbError) {
                console.error('[Stripe Webhook] Database error while adding points:', dbError);
            }
        }
        else {
            console.warn(`[Stripe Webhook] Invalid metadata. userId: ${userId}, points: ${points}`);
        }
    }
    else if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
        const session = event.data.object;
        try {
            await prisma_1.prisma.payment.update({
                where: { stripeSessionId: session.id },
                data: { status: 'FAILED' },
            });
            console.log(`[Stripe Webhook] Payment failed or expired for session ${session.id}. Updated status to FAILED.`);
        }
        catch (err) {
            console.error('[Stripe Webhook] Failed to update payment status for failed session:', err);
        }
    }
    else {
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
    return { received: true };
};
exports.PaymentService = {
    createCheckoutSession,
    verifyPaymentAndAddPoints,
    handleWebhook,
};
