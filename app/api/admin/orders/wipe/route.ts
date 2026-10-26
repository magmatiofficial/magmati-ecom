/**
 * @file app/api/admin/orders/wipe/route.ts
 * @description Admin-only API route to wipe all orders, payment transaction IDs, and voucher usage records in server-side batches.
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdminRequest } from '@/lib/api/adminGuard';
import { FieldValue } from 'firebase-admin/firestore';

const BATCH_SIZE = 400;
const MAX_BATCHES_PER_REQUEST = 3;
const WIPE_COLLECTIONS = ['orders', 'payment_trx_ids', 'voucher_usage'] as const;

export async function POST(req: NextRequest) {
  const guard = await guardAdminRequest(req, {
    rateKeyPrefix: 'admin_orders_wipe',
    limit: 3,
    windowMs: 60000,
  });
  if (!guard.ok) {
    return guard.response;
  }

  const db = guard.db;
  const adminEmail = guard.email;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request.' },
      { status: 400 }
    );
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      { success: false, error: 'Invalid request.' },
      { status: 400 }
    );
  }

  if (body.confirm !== 'DELETE ALL ORDERS') {
    return NextResponse.json(
      { success: false, error: 'Invalid request.' },
      { status: 400 }
    );
  }

  try {
    const deletedCounts: Record<typeof WIPE_COLLECTIONS[number], number> = {
      orders: 0,
      payment_trx_ids: 0,
      voucher_usage: 0,
    };

    let batchesUsed = 0;

    for (const colName of WIPE_COLLECTIONS) {
      while (batchesUsed < MAX_BATCHES_PER_REQUEST) {
        const snap = await db.collection(colName).select().limit(BATCH_SIZE).get();
        if (snap.empty) {
          break;
        }

        const batch = db.batch();
        snap.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();

        deletedCounts[colName] += snap.size;
        batchesUsed += 1;
      }
    }

    let remaining = false;
    for (const colName of WIPE_COLLECTIONS) {
      const checkSnap = await db.collection(colName).select().limit(1).get();
      if (!checkSnap.empty) {
        remaining = true;
        break;
      }
    }

    const totalDeleted =
      deletedCounts.orders + deletedCounts.payment_trx_ids + deletedCounts.voucher_usage;

    if (totalDeleted > 0) {
      try {
        await db.collection('admin_audit_logs').add({
          action: 'orders.wipe',
          adminEmail,
          deleted: deletedCounts,
          remaining,
          at: FieldValue.serverTimestamp(),
        });
      } catch {
        console.error('[AdminOrdersWipeAPI] Audit log writing failed');
      }
    }

    return NextResponse.json(
      {
        success: true,
        deleted: deletedCounts,
        remaining,
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch {
    console.error('[AdminOrdersWipeAPI] Error processing order wipe');
    return NextResponse.json(
      { success: false, error: 'Failed to wipe orders.' },
      { status: 500 }
    );
  }
}
