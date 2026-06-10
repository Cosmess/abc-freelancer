/**
 * Simple in-process sliding window rate limiter.
 * Works per serverless instance — sufficient for burst protection.
 * For cross-instance enforcement, replace with Upstash Redis.
 */

type WindowEntry = { count: number; resetAt: number };

const windows = new Map<string, WindowEntry>();

export type RateLimitResult =
  | { limited: false }
  | { limited: true; retryAfterSeconds: number };

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number,
): RateLimitResult {
  const now = Date.now();
  const entry = windows.get(key);

  if (!entry || now >= entry.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { limited: false };
  }

  if (entry.count >= maxRequests) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { limited: false };
}

export function getRateLimitKey(prefix: string, request: Request): string {
  const forwarded = (request.headers as Headers).get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `${prefix}:${ip}`;
}
