import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import AppError from '../error/AppError';

/**
 * Middleware to verify reCAPTCHA v3 or Cloudflare Turnstile tokens.
 * If CAPTCHA_SECRET_KEY is configured in .env, it verifies the token from req.body.captchaToken or req.headers['x-captcha-token'].
 * If no secret key is set, it gracefully allows requests (development/test mode).
 */
export const verifyCaptcha = async (req: Request, res: Response, next: NextFunction) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY;

  // If no captcha key configured, skip verification
  if (!secretKey) {
    return next();
  }

  const token = req.body?.captchaToken || req.headers['x-captcha-token'];

  if (!token) {
    return next(new AppError(httpStatus.BAD_REQUEST, 'Security verification token (CAPTCHA) is required.'));
  }

  try {
    // Check if Cloudflare Turnstile or Google reCAPTCHA
    const isTurnstile = !!process.env.TURNSTILE_SECRET_KEY;
    const verifyUrl = isTurnstile
      ? 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
      : 'https://www.google.com/recaptcha/api/siteverify';

    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', String(token));
    const remoteIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (remoteIp) {
      formData.append('remoteip', String(remoteIp));
    }

    const response = await fetch(verifyUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data: any = await response.json();

    if (!data.success) {
      return next(new AppError(httpStatus.FORBIDDEN, 'Security verification failed. Please try again.'));
    }

    // For reCAPTCHA v3, score threshold check (e.g. >= 0.5)
    if (data.score !== undefined && data.score < 0.5) {
      return next(new AppError(httpStatus.FORBIDDEN, 'Suspicious activity detected. Please try again.'));
    }

    next();
  } catch (error) {
    console.error('[CAPTCHA Verification Error]', error);
    next(new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to verify security token.'));
  }
};
