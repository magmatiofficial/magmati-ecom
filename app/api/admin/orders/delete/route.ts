/**
 * @file app/api/admin/orders/delete/route.ts
 * @description Admin-only API route to permanently delete Cancelled or Delivered orders in batch.
 * Note: Route only deletes order documents and does not modify stockQuantity, voucher_usage, or payment_trx_ids.
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdminRequest } from '@/lib/api/adminGuard';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  const guard = await guardAdminRequest(req, {
    rateKeyPrefix: 'admin_orders_delete',
    limit: 20,
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

  const { ids } = body;
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 50) {
    return NextResponse.json(
      { success: false, error: 'Invalid request.' },
      { status: 400 }
    );
  }

  const idRegex = /^[A-Za-z0-9_-]{1,40}$/;
  for (const id of ids) {
    if (typeof id !== 'string' || !idRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request.' },
        { status: 400 }
      );
    }
  }

  const uniqueIds = Array.from(new Set(ids));
  const requestedCount = uniqueIds.length;

  try {
    const ordersRef = db.collection('orders');
    const docRefs = uniqueIds.map((id) => ordersRef.doc(id));
    const snapshots = await db.getAll(...docRefs);

    const missing: string[] = [];
    const failed: { id: string; reason: string }[] = [];
    const eligibleDocRefs: FirebaseFirestore.DocumentReference[] = [];
    const deletedIds: string[] = [];

    snapshots.forEach((snap, idx) => {
      const id = uniqueIds[idx];
      if (!snap.exists) {
        missing.push(id);
        return;
      }

      const data = snap.data();
      const status = data?.status;

      if (status === 'Cancelled' || status === 'Delivered') {
        eligibleDocRefs.push(snap.ref);
        deletedIds.push(id);
      } else {
        failed.push({ id, reason: 'ACTIVE_ORDER' });
      }
    });

    if (eligibleDocRefs.length > 0) {
      const batch = db.batch();
      for (const ref of eligibleDocRefs) {
        batch.delete(ref);
      }
      await batch.commit();

      try {
        await db.collection('admin_audit_logs').add({
          action: 'orders.delete',
          adminEmail,
          requestedCount,
          deletedIds,
          failedCount: failed.length,
          at: FieldValue.serverTimestamp(),
        });
      } catch {
        console.error('[AdminOrdersDeleteAPI] Audit log writing failed');
      }
    }

    return NextResponse.json(
      {
        success: true,
        deleted: deletedIds,
        missing,
        failed,
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch {
    console.error('[AdminOrdersDeleteAPI] Error processing order deletion');
    return NextResponse.json(
      { success: false, error: 'Failed to delete orders.' },
      { status: 500 }
    );
  }
}
