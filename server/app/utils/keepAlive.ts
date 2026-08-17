import { envConfig } from '../config/envConfig';
import { logger } from './logger';

let keepAliveIntervalId: NodeJS.Timeout | null = null;

/**
 * Resolves the target external URL for keep-alive pings.
 * Render automatically provides RENDER_EXTERNAL_URL (e.g. https://my-service.onrender.com).
 */
export function getKeepAliveTargetUrl(): string | null {
  if (envConfig.KEEP_ALIVE_URL) {
    return envConfig.KEEP_ALIVE_URL.replace(/\/$/, '');
  }

  if (envConfig.RENDER_EXTERNAL_URL) {
    return envConfig.RENDER_EXTERNAL_URL.replace(/\/$/, '');
  }

  // Fallback to APP_URL or BACKEND_URL if it is not localhost
  const potentialUrls = [envConfig.APP_URL, envConfig.BACKEND_URL, envConfig.FRONTEND_URL];
  for (const candidate of potentialUrls) {
    if (candidate && !candidate.includes('localhost') && !candidate.includes('127.0.0.1')) {
      return candidate.replace(/\/$/, '');
    }
  }

  return null;
}

/**
 * Pings the target server endpoint to prevent Render from idling/sleeping.
 */
export async function pingServer(targetUrl: string): Promise<boolean> {
  const healthEndpoint = `${targetUrl}/health`;
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const res = await fetch(healthEndpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'Render-KeepAlive-Bot/1.0',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;

    if (res.ok) {
      logger.info({
        msg: `[KeepAlive] 🟢 Heartbeat ping successful`,
        url: healthEndpoint,
        status: res.status,
        durationMs,
      });
      return true;
    } else {
      logger.warn({
        msg: `[KeepAlive] ⚠️ Heartbeat ping returned non-200 status`,
        url: healthEndpoint,
        status: res.status,
        durationMs,
      });
      return false;
    }
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    if (error.name === 'AbortError') {
      logger.warn(`[KeepAlive] ⏱️ Heartbeat ping timed out after 20s (${healthEndpoint})`);
    } else {
      logger.warn({
        msg: `[KeepAlive] ⚠️ Heartbeat ping failed (${healthEndpoint})`,
        error: error.message,
        durationMs,
      });
    }
    return false;
  }
}

/**
 * Starts the automatic Keep-Alive cron/interval.
 * Prevents Render free tier from going into sleep mode after 15 minutes of inactivity.
 */
export function startKeepAlive(): void {
  // If already running, do nothing
  if (keepAliveIntervalId) {
    return;
  }

  const targetUrl = getKeepAliveTargetUrl();
  const intervalMinutes = envConfig.KEEP_ALIVE_INTERVAL_MINUTES || 10;
  const intervalMs = Math.max(intervalMinutes, 1) * 60 * 1000;

  if (!targetUrl) {
    if (envConfig.NODE_ENV === 'production' || process.env.RENDER) {
      logger.warn(
        '[KeepAlive] ⚠️ No external URL detected for keep-alive. Set RENDER_EXTERNAL_URL or KEEP_ALIVE_URL in environment variables to prevent Render sleep mode.'
      );
    } else {
      logger.info(
        '[KeepAlive] ℹ️ Local environment detected. Keep-alive self-ping is in standby. It will activate automatically when deployed with RENDER_EXTERNAL_URL or KEEP_ALIVE_URL.'
      );
    }
    return;
  }

  logger.info(
    `[KeepAlive] 🚀 Active: Pinging ${targetUrl}/health every ${intervalMinutes} minutes to keep the server awake 24/7.`
  );

  // Initial delayed ping 30 seconds after boot to verify connectivity
  setTimeout(() => {
    pingServer(targetUrl).catch(() => {});
  }, 30000);

  // Recurring ping
  keepAliveIntervalId = setInterval(() => {
    pingServer(targetUrl).catch(() => {});
  }, intervalMs);

  // Unref so it won't prevent graceful exit
  if (keepAliveIntervalId.unref) {
    keepAliveIntervalId.unref();
  }
}

/**
 * Stops the keep-alive interval.
 */
export function stopKeepAlive(): void {
  if (keepAliveIntervalId) {
    clearInterval(keepAliveIntervalId);
    keepAliveIntervalId = null;
    logger.info('[KeepAlive] 🛑 Keep-alive service stopped.');
  }
}
