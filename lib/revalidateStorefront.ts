import { auth } from '@/lib/firebase';

export function revalidateStorefrontCache(): void {
  void (async () => {
    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;
      await fetch('/api/admin/revalidate-products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scope: 'storefront' }),
      });
    } catch {
      /* silent: the cache refreshes by itself within 10 minutes */
    }
  })();
}
