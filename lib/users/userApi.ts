/**
 * @file lib/users/userApi.ts
 * @description Shared client helpers to fetch user summary counts and export all admin users with pagination.
 */

import { authedFetchJson } from '@/lib/api/clientAuthFetch';
import type { AdminUserView, UserRole } from '@/lib/users/userFilters';
import { USER_EMAIL_PATTERN } from '@/lib/users/userFilters';

export type UserCounts = {
  total: number | null;
  admins: number | null;
  customers: number | null;
  suspended: number | null;
};

export async function fetchUserSummary(): Promise<UserCounts | null> {
  try {
    const res = await authedFetchJson<{
      success?: boolean;
      counts?: {
        total?: number | null;
        admins?: number | null;
        customers?: number | null;
        suspended?: number | null;
      };
    }>('/api/admin/users/summary');

    if (!res.ok || !res.data?.success || !res.data.counts) {
      return null;
    }

    const rawCounts = res.data.counts;
    const total =
      typeof rawCounts.total === 'number' && Number.isFinite(rawCounts.total)
        ? rawCounts.total
        : null;
    const admins =
      typeof rawCounts.admins === 'number' && Number.isFinite(rawCounts.admins)
        ? rawCounts.admins
        : null;
    const customers =
      typeof rawCounts.customers === 'number' && Number.isFinite(rawCounts.customers)
        ? rawCounts.customers
        : null;
    const suspended =
      typeof rawCounts.suspended === 'number' && Number.isFinite(rawCounts.suspended)
        ? rawCounts.suspended
        : null;

    return {
      total,
      admins,
      customers,
      suspended,
    };
  } catch {
    return null;
  }
}

export async function fetchAllAdminUsers(): Promise<
  { ok: true; users: AdminUserView[] } | { ok: false; error: string }
> {
  try {
    const userMap = new Map<string, AdminUserView>();
    let cursor: string | null = null;
    let hasMore: boolean = true;
    let pages: number = 0;
    const MAX_PAGES = 100;

    while (hasMore) {
      pages++;
      if (pages > MAX_PAGES) {
        return {
          ok: false,
          error: 'Too many users for an in-browser backup (limit 5000). A server-side export is required.',
        };
      }

      const url: string = `/api/admin/users?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
      const res = await authedFetchJson<{
        success?: boolean;
        users?: AdminUserView[];
        nextCursor?: string | null;
        hasMore?: boolean;
      }>(url);

      if (!res.ok || !res.data?.success || !Array.isArray(res.data.users)) {
        return {
          ok: false,
          error: 'Could not load all users for the backup. Please try again.',
        };
      }

      for (const user of res.data.users) {
        if (user && user.id) {
          userMap.set(user.id, user);
        }
      }

      hasMore = !!res.data.hasMore;
      cursor = res.data.nextCursor || null;

      if (hasMore && !cursor) {
        return {
          ok: false,
          error: 'Could not load all users for the backup. Invalid pagination cursor.',
        };
      }

      if (!hasMore) {
        break;
      }
    }

    const users = Array.from(userMap.values()).sort((a, b) => {
      const emailA = (a.email || a.id || '').toLowerCase();
      const emailB = (b.email || b.id || '').toLowerCase();
      return emailA.localeCompare(emailB);
    });

    return {
      ok: true,
      users,
    };
  } catch {
    return {
      ok: false,
      error: 'Could not load all users for the backup. Please try again.',
    };
  }
}

export async function createAdminUserApi(input: {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: UserRole;
}): Promise<{ ok: true; user: AdminUserView } | { ok: false; status: number; error: string }> {
  const emailClean = typeof input?.email === 'string' ? input.email.trim().toLowerCase() : '';
  if (!emailClean || !USER_EMAIL_PATTERN.test(emailClean)) {
    return { ok: false, status: 400, error: 'Invalid user.' };
  }

  const res = await authedFetchJson<{
    success?: boolean;
    user?: AdminUserView;
    error?: string;
  }>('/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...input,
      email: emailClean,
    }),
  });

  if (!res.ok || !res.data?.success || !res.data.user) {
    return {
      ok: false,
      status: res.status,
      error: res.data?.error || 'Failed to create user.',
    };
  }

  return {
    ok: true,
    user: res.data.user,
  };
}

export async function updateAdminUserDetailsApi(
  id: string,
  fields: { name?: string; phone?: string; address?: string }
): Promise<{ ok: true; user: AdminUserView } | { ok: false; status: number; error: string }> {
  const idClean = typeof id === 'string' ? id.trim().toLowerCase() : '';
  if (!idClean || !USER_EMAIL_PATTERN.test(idClean)) {
    return { ok: false, status: 400, error: 'Invalid user.' };
  }

  const res = await authedFetchJson<{
    success?: boolean;
    user?: AdminUserView;
    error?: string;
  }>(`/api/admin/users/${encodeURIComponent(idClean)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'updateDetails',
      ...fields,
    }),
  });

  if (!res.ok || !res.data?.success || !res.data.user) {
    return {
      ok: false,
      status: res.status,
      error: res.data?.error || 'Failed to update user.',
    };
  }

  return {
    ok: true,
    user: res.data.user,
  };
}

export async function setAdminUserRoleApi(
  id: string,
  role: UserRole
): Promise<{ ok: true; user: AdminUserView } | { ok: false; status: number; error: string }> {
  const idClean = typeof id === 'string' ? id.trim().toLowerCase() : '';
  if (!idClean || !USER_EMAIL_PATTERN.test(idClean)) {
    return { ok: false, status: 400, error: 'Invalid user.' };
  }

  const res = await authedFetchJson<{
    success?: boolean;
    user?: AdminUserView;
    error?: string;
  }>(`/api/admin/users/${encodeURIComponent(idClean)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'setRole',
      role,
    }),
  });

  if (!res.ok || !res.data?.success || !res.data.user) {
    return {
      ok: false,
      status: res.status,
      error: res.data?.error || 'Failed to update user.',
    };
  }

  return {
    ok: true,
    user: res.data.user,
  };
}

export async function setAdminUserSuspendedApi(
  id: string,
  suspended: boolean
): Promise<{ ok: true; user: AdminUserView } | { ok: false; status: number; error: string }> {
  const idClean = typeof id === 'string' ? id.trim().toLowerCase() : '';
  if (!idClean || !USER_EMAIL_PATTERN.test(idClean)) {
    return { ok: false, status: 400, error: 'Invalid user.' };
  }

  const res = await authedFetchJson<{
    success?: boolean;
    user?: AdminUserView;
    error?: string;
  }>(`/api/admin/users/${encodeURIComponent(idClean)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'setSuspended',
      suspended,
    }),
  });

  if (!res.ok || !res.data?.success || !res.data.user) {
    return {
      ok: false,
      status: res.status,
      error: res.data?.error || 'Failed to update user.',
    };
  }

  return {
    ok: true,
    user: res.data.user,
  };
}

export async function deleteAdminUserApi(
  id: string
): Promise<{ ok: true; id: string } | { ok: false; status: number; error: string }> {
  const idClean = typeof id === 'string' ? id.trim().toLowerCase() : '';
  if (!idClean || !USER_EMAIL_PATTERN.test(idClean)) {
    return { ok: false, status: 400, error: 'Invalid user.' };
  }

  const res = await authedFetchJson<{
    success?: boolean;
    id?: string;
    error?: string;
  }>(`/api/admin/users/${encodeURIComponent(idClean)}`, {
    method: 'DELETE',
  });

  if (!res.ok || !res.data?.success) {
    return {
      ok: false,
      status: res.status,
      error: res.data?.error || 'Failed to delete user.',
    };
  }

  return {
    ok: true,
    id: res.data.id || idClean,
  };
}

