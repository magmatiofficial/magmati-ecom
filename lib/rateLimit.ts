/**
 * @file lib/rateLimit.ts
 * @description In-memory token bucket / sliding window rate limiter for API routes.
 * 
 * NOTE / KNOWN LIMITATION:
 * This rate limiter stores bucket counters in Node.js process memory (`rateLimitMap`).
 * Because memory is local to each server instance, limits are NOT shared across multiple
 * clustered server instances, auto-scaled containers (e.g. Cloud Run instances), or serverless
 * execution environments.
 * 
 * RECOMMENDED FIX FOR MULTI-INSTANCE DEPLOYMENTS:
 * For distributed production environments, replace this in-memory Map with an external distributed
 * key-value store such as Redis or Upstash (@upstash/ratelimit / @upstash/redis), which provides
 * atomic rate limiting across all running server instances.
 */

import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Checks if a given key is within the rate limit.
 * @param key Unique key representing client/endpoint (e.g. `order_track:${ip}`)
 * @param limit Maximum allowed requests in the time window
 * @param windowMs Time window in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  // Periodic cleanup if map gets large
  if (rateLimitMap.size > 10000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetTime) {
        rateLimitMap.delete(k);
      }
    }
  }

  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    rateLimitMap.set(key, { count: 1, resetTime });
    return { ok: true, remaining: limit - 1, reset: resetTime };
  }

  if (record.count >= limit) {
    return { ok: false, remaining: 0, reset: record.resetTime };
  }

  record.count += 1;
  return { ok: true, remaining: limit - record.count, reset: record.resetTime };
}

/**
 * Extracts client IP from request headers or falls back to localhost.
 */
export function getClientIp(req: NextRequest | Request): string {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const ip = xForwardedFor.split(',')[0].trim();
    if (ip) return ip;
  }

  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp) {
    const ip = xRealIp.trim();
    if (ip) return ip;
  }

  return '127.0.0.1';
}
