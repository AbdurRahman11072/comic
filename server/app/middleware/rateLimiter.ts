import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

// General API rate limiter: Max 500 requests per 15 minutes per IP (disabled in dev)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 500,
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes.',
    });
  },
});

// Sensitive points actions: Max 10 requests per minute per IP (disabled in dev)
export const pointsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isDev ? 1000 : 10,
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message: 'Too many actions. Please wait a minute before trying again.',
    });
  },
});

// Auth / Sign-in rate limiter: Max 20 requests per 15 minutes per IP (disabled in dev)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 20,
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const resetTime = (req as any).rateLimit?.resetTime;
    const remainingSeconds = resetTime
      ? Math.max(1, Math.ceil((new Date(resetTime).getTime() - Date.now()) / 1000))
      : 900;
    const remainingMinutes = Math.ceil(remainingSeconds / 60);

    res.status(options.statusCode).json({
      success: false,
      message: `Too many authentication attempts. Please try again after ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''} (${remainingSeconds}s).`,
      retryAfter: remainingSeconds,
      remainingMinutes,
    });
  },
});

// Reader session heartbeat rate limiter: Max 30 requests per minute per IP (disabled in dev)
export const readTrackLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isDev ? 5000 : 30,
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message: 'Reading session tracking rate exceeded. Please slow down.',
    });
  },
});

