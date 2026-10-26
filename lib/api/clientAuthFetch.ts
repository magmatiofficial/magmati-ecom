/**
 * @file lib/api/clientAuthFetch.ts
 * @description Client-side Firebase ID token retrieval and authenticated JSON fetch helper.
 */

import { auth } from '@/lib/firebase';

export async function getAuthToken(): Promise<string | null> {
  try {
    if (typeof window === 'undefined') return null;
    if (typeof (auth as any).authStateReady === 'function') {
      await (auth as any).authStateReady();
    }
    const user = auth.currentUser;
    if (!user) return null;
    const token = await user.getIdToken();
    return token || null;
  } catch {
    return null;
  }
}

export async function authedFetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T | null }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { ok: false, status: 401, data: null };
    }

    const headers = new Headers(init?.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has('Content-Type') && init?.body) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(url, {
      ...init,
      headers,
      cache: 'no-store',
    });

    let data: T | null = null;
    try {
      const text = await res.text();
      if (text) {
        data = JSON.parse(text);
      }
    } catch {
      data = null;
    }

    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}
