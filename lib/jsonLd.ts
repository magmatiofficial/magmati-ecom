/**
 * @file lib/jsonLd.ts
 * @description Safe serialization utility for JSON-LD structured data.
 * Replaces '<' with unicode escape '\u003c' to prevent script breakout XSS attacks
 * (e.g. </script><script>alert(1)</script>) when injecting into dangerouslySetInnerHTML.
 */

export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}
