/**
 * @file app/api/admin/customers/order-stats/route.ts
 * @description Admin-only API route returning per-customer order count and total spent via Firestore aggregations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AggregateField } from 'firebase-admin/firestore';
import { guardAdminRequest } from '@/lib/api/adminGuard';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const guard = await guardAdminRequest(req, {
      rateKeyPrefix: 'admin_customer_order_stats',
      limit: 60,
      windowMs: 60000,
    });
    if (!guard.ok) {
      return guard.response;
    }
    const db = guard.db;

    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.emails) || body.emails.length === 0 || body.emails.length > 50) {
      return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
    }

    const rawEmails: unknown[] = body.emails;
    const validEmailsSet = new Set<string>();

    for (const item of rawEmails) {
      if (typeof item === 'string') {
        const trimmed = item.trim().toLowerCase();
        if (trimmed.length >= 3 && trimmed.length <= 254 && EMAIL_REGEX.test(trimmed)) {
          validEmailsSet.add(trimmed);
        }
      }
    }

    const emails = Array.from(validEmailsSet);
    if (emails.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
    }

    const promises = emails.map(async (email) => {
      try {
        const snap = await db
          .collection('orders')
          .where('userEmail', '==', email)
          .aggregate({
            orders: AggregateField.count(),
            spent: AggregateField.sum('total'),
          })
          .get();

        const data = snap.data();
        const ordersCount = typeof data.orders === 'number' && Number.isFinite(data.orders) ? data.orders : 0;
        const spentVal = typeof data.spent === 'number' && Number.isFinite(data.spent) ? data.spent : 0;

        return {
          email,
          stat: {
            orders: ordersCount,
            spent: spentVal,
          },
        };
      } catch {
        return {
          email,
          stat: null,
        };
      }
    });

    const results = await Promise.all(promises);
    const stats: Record<string, { orders: number; spent: number } | null> = {};

    for (const r of results) {
      stats[r.email] = r.stat;
    }

    return NextResponse.json(
      {
        success: true,
        stats,
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch {
    console.error('[AdminCustomerOrderStatsAPI] Error loading customer order stats');
    return NextResponse.json(
      { success: false, error: 'Failed to load customer order stats.' },
      { status: 500 }
    );
  }
}
