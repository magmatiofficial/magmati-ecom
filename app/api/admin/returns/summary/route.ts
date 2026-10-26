/**
 * @file app/api/admin/returns/summary/route.ts
 * @description Admin-only, read-only API route returning return request counts using Firestore count() aggregation queries. No new index required.
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdminRequest } from '@/lib/api/adminGuard';
import { RETURN_STATUSES } from '@/lib/returns/returnFilters';

export async function GET(req: NextRequest) {
  try {
    const guard = await guardAdminRequest(req, {
      rateKeyPrefix: 'admin_returns_summary',
      limit: 60,
      windowMs: 60000,
    });
    if (!guard.ok) {
      return guard.response;
    }
    const db = guard.db;
    const returnsRef = db.collection('returns');

    const totalPromise = returnsRef.count().get().then((snap) => snap.data().count).catch(() => null);

    const statusPromises = RETURN_STATUSES.map((status) => {
      return returnsRef
        .where('status', '==', status)
        .count()
        .get()
        .then((snap) => snap.data().count)
        .catch(() => null);
    });

    const [total, ...statusCounts] = await Promise.all([totalPromise, ...statusPromises]);

    const statusObj: Record<string, number | null> = {};
    RETURN_STATUSES.forEach((status, idx) => {
      statusObj[status] = statusCounts[idx];
    });

    return NextResponse.json(
      {
        success: true,
        counts: {
          total,
          status: statusObj,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    console.error('[AdminReturnsSummaryAPI] Error loading return counts');
    return NextResponse.json(
      { success: false, error: 'Failed to load return counts.' },
      { status: 500 }
    );
  }
}
