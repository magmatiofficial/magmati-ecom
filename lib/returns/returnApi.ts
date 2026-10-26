/**
 * @file lib/returns/returnApi.ts
 * @description Shared client helpers to fetch summary, fetch by ID, update status, resolve shipping, and delete return requests.
 */

import { authedFetchJson } from '@/lib/api/clientAuthFetch';
import type { ReturnRequest } from '@/store/useReturnStore';
import { RETURN_ID_PATTERN, RETURN_STATUSES, ReturnStatus } from '@/lib/returns/returnFilters';

export type ReturnCounts = {
  total: number | null;
  status: Record<ReturnStatus, number | null>;
};

export type ReturnApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

export async function fetchReturnSummary(): Promise<ReturnCounts | null> {
  const res = await authedFetchJson<{
    success?: boolean;
    counts?: {
      total?: number | null;
      status?: Record<string, number | null>;
    };
  }>('/api/admin/returns/summary');

  if (!res.ok || !res.data?.success || !res.data.counts) {
    return null;
  }

  const rawCounts = res.data.counts;
  const total = typeof rawCounts.total === 'number' && Number.isFinite(rawCounts.total) ? rawCounts.total : null;
  
  const statusRecord: Record<ReturnStatus, number | null> = {
    Pending: null,
    Approved: null,
    Rejected: null,
    Completed: null,
  };

  const rawStatus = rawCounts.status || {};
  for (const st of RETURN_STATUSES) {
    const val = rawStatus[st];
    statusRecord[st] = typeof val === 'number' && Number.isFinite(val) ? val : null;
  }

  return {
    total,
    status: statusRecord,
  };
}

export async function fetchReturnById(id: string): Promise<{ ok: true; returnRequest: ReturnRequest } | { ok: false; status: number; error: string }> {
  if (!id || typeof id !== 'string' || !RETURN_ID_PATTERN.test(id)) {
    return { ok: false, status: 400, error: 'Invalid return id.' };
  }

  const res = await authedFetchJson<{
    success?: boolean;
    returnRequest?: ReturnRequest;
    error?: string;
  }>(`/api/admin/returns/${encodeURIComponent(id)}`);

  if (!res.ok || !res.data?.success || !res.data.returnRequest || !res.data.returnRequest.id) {
    return {
      ok: false,
      status: res.status,
      error: res.data?.error || 'Failed to load return request.',
    };
  }

  return {
    ok: true,
    returnRequest: res.data.returnRequest,
  };
}

export async function updateReturnStatusApi(
  id: string,
  status: ReturnStatus,
  adminNotes?: string
): Promise<{ ok: true; returnRequest: ReturnRequest } | { ok: false; status: number; error: string }> {
  if (!id || typeof id !== 'string' || !RETURN_ID_PATTERN.test(id)) {
    return { ok: false, status: 400, error: 'Invalid return id.' };
  }

  const bodyPayload: any = { action: 'setStatus', status };
  if (adminNotes !== undefined) {
    bodyPayload.adminNotes = adminNotes;
  }

  const res = await authedFetchJson<{
    success?: boolean;
    returnRequest?: ReturnRequest;
    error?: string;
  }>(`/api/admin/returns/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!res.ok || !res.data?.success || !res.data.returnRequest || !res.data.returnRequest.id) {
    return {
      ok: false,
      status: res.status,
      error: res.data?.error || 'Failed to update return status.',
    };
  }

  return {
    ok: true,
    returnRequest: res.data.returnRequest,
  };
}

export async function resolveReturnShippingApi(
  id: string,
  decision: 'waived' | 'applied'
): Promise<{ ok: true; returnRequest: ReturnRequest } | { ok: false; status: number; error: string }> {
  if (!id || typeof id !== 'string' || !RETURN_ID_PATTERN.test(id)) {
    return { ok: false, status: 400, error: 'Invalid return id.' };
  }

  const res = await authedFetchJson<{
    success?: boolean;
    returnRequest?: ReturnRequest;
    error?: string;
  }>(`/api/admin/returns/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'resolveShipping', decision }),
  });

  if (!res.ok || !res.data?.success || !res.data.returnRequest || !res.data.returnRequest.id) {
    return {
      ok: false,
      status: res.status,
      error: res.data?.error || 'Failed to resolve return shipping.',
    };
  }

  return {
    ok: true,
    returnRequest: res.data.returnRequest,
  };
}

export async function deleteReturnApi(
  id: string
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!id || typeof id !== 'string' || !RETURN_ID_PATTERN.test(id)) {
    return { ok: false, status: 400, error: 'Invalid return id.' };
  }

  const res = await authedFetchJson<{
    success?: boolean;
    error?: string;
  }>(`/api/admin/returns/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!res.ok || !res.data?.success) {
    return {
      ok: false,
      status: res.status,
      error: res.data?.error || 'Failed to delete return request.',
    };
  }

  return {
    ok: true,
  };
}
