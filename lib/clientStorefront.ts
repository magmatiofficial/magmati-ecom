import type { StorefrontData } from '@/lib/serverStorefront';

const REUSE_MS = 10000;
const TIMEOUT_MS = 10000;

let inflight: Promise<StorefrontData | null> | null = null;
let lastData: StorefrontData | null = null;
let lastAt = 0;

/** One shared request for categories, vouchers and settings. Callers that ask at the same time share one network request. */
export function fetchStorefront(): Promise<StorefrontData | null> {
  if (lastData && Date.now() - lastAt < REUSE_MS) return Promise.resolve(lastData);
  if (inflight) return inflight;

  const request = (async (): Promise<StorefrontData | null> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch('/api/storefront', { signal: controller.signal });
      if (!res.ok) return null;
      const json = await res.json();
      if (!json || json.success !== true) return null;
      const data: StorefrontData = {
        categories: Array.isArray(json.categories) ? json.categories : [],
        vouchers: Array.isArray(json.vouchers) ? json.vouchers : [],
        maxVouchersPerOrder: typeof json.maxVouchersPerOrder === 'number' ? json.maxVouchersPerOrder : null,
        settings: json.settings && typeof json.settings === 'object' ? json.settings : null,
      };
      lastData = data;
      lastAt = Date.now();
      return data;
    } catch (err) {
      console.warn('[Storefront] fetch failed:', err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      clearTimeout(timer);
    }
  })();

  inflight = request;
  void request.finally(() => {
    if (inflight === request) inflight = null;
  });
  return request;
}
