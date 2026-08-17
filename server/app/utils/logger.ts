import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino(
  isProduction
    ? {
        level: process.env.LOG_LEVEL || 'info',
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'password',
            'token',
            'stripeSecret',
            'accessToken',
            'refreshToken',
          ],
          remove: true,
        },
        base: {
          env: 'production',
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }
    : {
        level: process.env.LOG_LEVEL || 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname,env',
            singleLine: false,
            messageFormat: '{msg}',
            errorLikeObjectKeys: ['err', 'error'],
          },
        },
      }
);
