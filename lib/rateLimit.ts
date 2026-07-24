// In-memory, per-process sliding-window rate limiter.
//
// Good enough for a single-instance/dev deployment: cheap, zero setup, no
// external dependency. It will NOT share state across serverless instances
// or survive a redeploy — if this app scales to multiple instances (e.g.
// several concurrent Vercel functions), swap this for a shared store like
// Upstash Redis so limits are enforced consistently across instances.

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export function checkRateLimit(
  key: string,
  {
    windowMs = WINDOW_MS,
    maxRequests = MAX_REQUESTS_PER_WINDOW,
  }: { windowMs?: number; maxRequests?: number } = {},
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

// Periodic sweep so long-lived server processes don't accumulate stale
// entries forever. Skipped in edge/serverless runtimes where timers
// don't make sense across invocations, but harmless if it never fires.
if (typeof setInterval !== "undefined") {
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now > bucket.resetAt) buckets.delete(key);
    }
  }, WINDOW_MS);
  sweep.unref?.();
}
