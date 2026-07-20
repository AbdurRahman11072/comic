import Stripe from 'stripe';
import { envConfig } from '../../config/envConfig';
import { prisma } from '../../../lib/prisma';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';

const stripe = new Stripe(envConfig.STRIPE_SECRET_KEY as string);

export const POINT_PACKAGES = [
  { id: 'pkg_1', points: 100, price: 1.00, name: '100 Points Starter' },
  { id: 'pkg_2', points: 500, price: 4.50, name: '500 Points Pro' },
  { id: 'pkg_3', points: 1200, price: 10.00, name: '1200 Points Mega' },
  { id: 'pkg_4', points: 3000, price: 24.00, name: '3000 Points Ultimate' },
];

const createCheckoutSession = async (userId: string, packageId: string, userEmail: string) => {
  const pkg = POINT_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) {
    throw new AppError(httpStatus.NOT_FOUND, 'Package not found');
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
    success_url: `${envConfig.BACKEND_URL}/api/v1/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envConfig.BACKEND_URL}/api/v1/payments/cancel`,
    metadata: {
      userId,
      packageId,
      points: pkg.points.toString(),
    },
  });

  // Create a PENDING payment record in the database
  await prisma.payment.create({
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

const verifyPaymentAndAddPoints = async (sessionId: string) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      const userId = session.metadata?.userId;
      const packageId = session.metadata?.packageId;
      const points = parseInt(session.metadata?.points || '0');

      if (userId && points > 0) {
        const payment = await prisma.payment.findUnique({
          where: { stripeSessionId: sessionId },
        });

        if (payment && payment.status !== 'COMPLETED') {
          await prisma.$transaction([
            prisma.payment.update({
              where: { stripeSessionId: sessionId },
              data: {
                status: 'COMPLETED',
                stripePaymentId: session.payment_intent as string,
              },
            }),
            prisma.user.update({
              where: { id: userId },
              data: { points: { increment: points } },
            }),
            prisma.pointTransaction.create({
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
        } else if (payment && payment.status === 'COMPLETED') {
          // Already completed
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error('[Stripe Verification] Error manually verifying payment session:', error);
    return false;
  }
};

const handleWebhook = async (sig: string, payload: Buffer) => {
  let event;

  if (sig === 'mock-signature' && envConfig.NODE_ENV === 'development') {
    try {
      event = JSON.parse(payload.toString());
    } catch (err: any) {
      throw new AppError(httpStatus.BAD_REQUEST, `Mock Webhook Parse Error: ${err.message}`);
    }
  } else {
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        sig,
        envConfig.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err: any) {
      throw new AppError(httpStatus.BAD_REQUEST, `Webhook Error: ${err.message}`);
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const points = parseInt(session.metadata?.points || '0');
    
    console.log(`[Stripe Webhook] checkout.session.completed received. userId: ${userId}, points: ${points}`);

    if (userId && points > 0) {
      try {
        const payment = await prisma.payment.findUnique({
          where: { stripeSessionId: session.id },
        });

        if (payment && payment.status !== 'COMPLETED') {
          await prisma.$transaction([
            prisma.payment.update({
              where: { stripeSessionId: session.id },
              data: {
                status: 'COMPLETED',
                stripePaymentId: session.payment_intent as string,
              },
            }),
            prisma.user.update({
              where: { id: userId },
              data: { points: { increment: points } },
            }),
            prisma.pointTransaction.create({
              data: {
                userId,
                amount: points,
                type: 'BUY_POINTS',
                description: `Purchased ${points} points via Stripe`,
              },
            }),
          ]);
          console.log(`[Stripe Webhook] Successfully added ${points} points to user ${userId}`);
        } else {
          console.log(`[Stripe Webhook] Payment already completed or not found for session ${session.id}`);
        }
      } catch (dbError) {
        console.error('[Stripe Webhook] Database error while adding points:', dbError);
      }
    } else {
      console.warn(`[Stripe Webhook] Invalid metadata. userId: ${userId}, points: ${points}`);
    }
  } else if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await prisma.payment.update({
        where: { stripeSessionId: session.id },
        data: { status: 'FAILED' },
      });
      console.log(`[Stripe Webhook] Payment failed or expired for session ${session.id}. Updated status to FAILED.`);
    } catch (err) {
      console.error('[Stripe Webhook] Failed to update payment status for failed session:', err);
    }
  } else {
    console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }

  return { received: true };
};

export const PaymentService = {
  createCheckoutSession,
  verifyPaymentAndAddPoints,
  handleWebhook,
};
