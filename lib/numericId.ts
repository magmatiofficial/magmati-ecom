import { randomInt } from 'crypto';

/**
 * Server-only. Returns a random numeric ID of exactly `digits` digits (first digit is never 0).
 * No database reads: uniqueness is enforced by the caller when it writes the document.
 */
export function generateNumericId(digits: number = 10): string {
  const n = Math.min(Math.max(Math.floor(digits), 6), 15);
  let out = String(randomInt(1, 10));
  for (let i = 1; i < n; i++) out += String(randomInt(0, 10));
  return out;
}
