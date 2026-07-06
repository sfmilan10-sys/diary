/**
 * Lightweight in-memory, per-IP rate limiter for the reflection endpoint.
 *
 * Notes / tradeoffs:
 * - In-memory only: resets on server restart and is per-instance. For a single
 *   instance (dev / early production) this is enough. A multi-instance or
 *   serverless deployment would need a shared store (Redis/KV).
 * - No diary content is read or logged here.
 */

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX = 20;
const MAX_TRACKED_IPS = 5000;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function getConfig(): { windowMs: number; max: number } {
  const windowMs = Number(process.env.REFLECTION_RATE_LIMIT_WINDOW_MS);
  const max = Number(process.env.REFLECTION_RATE_LIMIT_MAX);

  return {
    windowMs: Number.isFinite(windowMs) && windowMs > 0 ? windowMs : DEFAULT_WINDOW_MS,
    max: Number.isFinite(max) && max > 0 ? max : DEFAULT_MAX,
  };
}

function pruneExpired(now: number): void {
  if (buckets.size < MAX_TRACKED_IPS) {
    return;
  }
  for (const [ip, bucket] of buckets) {
    if (now >= bucket.resetAt) {
      buckets.delete(ip);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export function checkReflectionRateLimit(ip: string): RateLimitResult {
  const { windowMs, max } = getConfig();
  const now = Date.now();

  pruneExpired(now);

  const bucket = buckets.get(ip);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}
