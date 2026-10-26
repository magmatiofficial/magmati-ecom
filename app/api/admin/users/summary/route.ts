/**
 * @file app/api/admin/users/summary/route.ts
 * @description Admin-only, read-only API route returning user counts using Firestore count() aggregation queries. No composite index required.
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdminRequest } from '@/lib/api/adminGuard';

export async function GET(req: NextRequest) {
  try {
    const guard = await guardAdminRequest(req, {
      rateKeyPrefix: 'admin_users_summary',
      limit: 60,
      windowMs: 60000,
    });
    if (!guard.ok) {
      return guard.response;
    }
    const db = guard.db;
    const usersRef = db.collection('users');

    const totalPromise = usersRef
      .count()
      .get()
      .then((snap) => snap.data().count)
      .catch(() => null);

    const adminsPromise = usersRef
      .where('role', '==', 'admin')
      .count()
      .get()
      .then((snap) => snap.data().count)
      .catch(() => null);

    const customersPromise = usersRef
      .where('role', '==', 'customer')
      .count()
      .get()
      .then((snap) => snap.data().count)
      .catch(() => null);

    const suspendedPromise = usersRef
      .where('isSuspended', '==', true)
      .count()
      .get()
      .then((snap) => snap.data().count)
      .catch(() => null);

    const [total, admins, customers, suspended] = await Promise.all([
      totalPromise,
      adminsPromise,
      customersPromise,
      suspendedPromise,
    ]);

    return NextResponse.json(
      {
        success: true,
        counts: {
          total,
          admins,
          customers,
          suspended,
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
    console.error('[AdminUsersSummaryAPI] Error loading user counts');
    return NextResponse.json(
      { success: false, error: 'Failed to load user counts.' },
      { status: 500 }
    );
  }
}
