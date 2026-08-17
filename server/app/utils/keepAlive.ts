import { envConfig } from '../config/envConfig';
import { logger } from './logger';

let keepAliveIntervalId: NodeJS.Timeout | null = null;

/**
 * Resolves the target external URL for keep-alive pings.
 * Render automatically provides RENDER_EXTERNAL_URL (e.g. https://my-service.onrender.com).
 */
export function getKeepAliveTargetUrl(): string | null {
  if (process.env.AUTO_PING_ENABLED === 'false' || process.env.ENABLE_KEEP_ALIVE === 'false') {
    return null;
  }

  const isPlaceholder = (url: string) =>
    !url ||
    url.includes('your-service-name') ||
    url.includes('example.com') ||
    url.includes('localhost') ||
    url.includes('127.0.0.1');

  const customUrl = process.env.KEEP_ALIVE_URL || (envConfig as any)?.KEEP_ALIVE_URL;
  if (customUrl && !isPlaceholder(customUrl)) {
    return customUrl.replace(/\/$/, '');
  }

  const renderUrl = process.env.RENDER_EXTERNAL_URL || (envConfig as any)?.RENDER_EXTERNAL_URL;
  if (renderUrl && !isPlaceholder(renderUrl)) {
    return renderUrl.replace(/\/$/, '');
  }

  const potentialUrls = [
    process.env.APP_URL,
    (envConfig as any)?.APP_URL,
    (envConfig as any)?.BACKEND_URL,
    (envConfig as any)?.FRONTEND_URL,
  ];

  for (const candidate of potentialUrls) {
    if (candidate && !isPlaceholder(candidate)) {
      return candidate.replace(/\/$/, '');
    }
  }

  return null;
}

/**
 * Pings the target server endpoint to prevent cloud hosts (like Render) from sleeping.
 */
export async function pingServer(targetUrl: string): Promise<boolean> {
  const healthEndpoint = `${targetUrl}/health`;
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const res = await fetch(healthEndpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'ComicBD-KeepAlive/1.0',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;

    if (res.ok) {
      logger.info(
        { url: healthEndpoint, status: res.status, durationMs },
        `[KeepAlive] Heartbeat ping successful (${durationMs}ms)`
      );
      return true;
    } else {
      logger.warn(
        { url: healthEndpoint, status: res.status, durationMs },
        `[KeepAlive] Heartbeat ping returned status ${res.status}`
      );
      return false;
    }
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    logger.warn(
      { error: error?.message || error, durationMs },
      `[KeepAlive] Heartbeat ping failed (${healthEndpoint})`
    );
    return false;
  }
}

/**
 * Starts the automated keep-alive worker.
 */
export function startKeepAlive(): void {
  if (keepAliveIntervalId) {
    return;
  }

  if (process.env.AUTO_PING_ENABLED === 'false' || process.env.ENABLE_KEEP_ALIVE === 'false') {
    logger.info('[KeepAlive] Disabled via AUTO_PING_ENABLED=false');
    return;
  }

  const targetUrl = getKeepAliveTargetUrl();
  const intervalMinutes = Number(process.env.KEEP_ALIVE_INTERVAL_MINUTES) || (envConfig as any)?.KEEP_ALIVE_INTERVAL_MINUTES || 10;
  const intervalMs = Math.max(intervalMinutes, 1) * 60 * 1000;

  if (!targetUrl) {
    if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
      logger.info(
        '[KeepAlive] Standby mode: Set KEEP_ALIVE_URL or deploy on Render to automatically enable 24/7 keep-alive.'
      );
    } else {
      logger.info(
        '[KeepAlive] Local development detected. Standby mode active (no external pings sent).'
      );
    }
    return;
  }

  logger.info(
    `[KeepAlive] Active: Pinging ${targetUrl}/health every ${intervalMinutes} minutes to keep server awake.`
  );

  // Initial delayed ping 20 seconds after boot
  setTimeout(() => {
    pingServer(targetUrl).catch(() => {});
  }, 20000);

  // Recurring interval
  keepAliveIntervalId = setInterval(() => {
    pingServer(targetUrl).catch(() => {});
  }, intervalMs);

  if (keepAliveIntervalId.unref) {
    keepAliveIntervalId.unref();
  }
}

export function stopKeepAlive(): void {
  if (keepAliveIntervalId) {
    clearInterval(keepAliveIntervalId);
    keepAliveIntervalId = null;
    logger.info('[KeepAlive] Stopped.');
  }
}

// Aliases for compatibility
export const initKeepAliveCron = startKeepAlive;
export const stopKeepAliveCron = stopKeepAlive;
export const pingHealthApi = (url?: string) => pingServer(url || getKeepAliveTargetUrl() || 'http://localhost:5000');
