import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { cancelPendingOrderAndRelease } from '@/lib/orderCancellation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || cronSecret.trim() === '') {
    return NextResponse.json(
      { success: false, error: 'Cron is not configured.' },
      { status: 503 }
    );
  }

  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
  const expectedHeader = `Bearer ${cronSecret}`;
  if (authHeader !== expectedHeader) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!adminDb) {
    return NextResponse.json(
      { success: false, error: 'Database service unavailable.' },
      { status: 503 }
    );
  }

  try {
    const snap = await adminDb
      .collection('orders')
      .where('status', '==', 'Pending')
      .where('payment', '==', 'Debit/Credit Card')
      .limit(50)
      .get();

    const now = Date.now();
    const CUTOFF_MS = 60 * 60 * 1000;
    const paymentLabel = 'SSLCommerz Payment Abandoned';

    let checked = 0;
    let cancelled = 0;
    let skipped = 0;

    for (const doc of snap.docs) {
      checked++;
      const data = doc.data() || {};

      // Check age >= 60 minutes
      const rawCreatedAt = data.createdAt;
      let createdMs: number | null = null;

      if (rawCreatedAt) {
        if (typeof rawCreatedAt.toMillis === 'function') {
          createdMs = rawCreatedAt.toMillis();
        } else if (typeof rawCreatedAt === 'number') {
          createdMs = rawCreatedAt;
        } else if (typeof rawCreatedAt === 'string') {
          const parsed = Date.parse(rawCreatedAt);
          if (!isNaN(parsed)) {
            createdMs = parsed;
          }
        }
      }

      if (createdMs === null || now - createdMs < CUTOFF_MS) {
        skipped++;
        continue;
      }

      try {
        const res = await cancelPendingOrderAndRelease(adminDb, doc.id, paymentLabel);
        if (res.changed) {
          cancelled++;
        } else {
          skipped++;
        }
      } catch (err: unknown) {
        console.error(`[cancel-abandoned-payments] Failed to cancel order ${doc.id}:`, err);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      checked,
      cancelled,
      skipped,
    });
  } catch (err: unknown) {
    console.error('[cancel-abandoned-payments] Cron error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to process abandoned payments.' },
      { status: 500 }
    );
  }
}
