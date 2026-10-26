/**
 * @file app/api/admin/orders/summary/route.ts
 * @description Admin-only, read-only API route returning order counts by status and paymentStatus using Firestore count() aggregation queries, along with deliveredRevenue sum.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AggregateField } from 'firebase-admin/firestore';
import { guardAdminRequest } from '@/lib/api/adminGuard';
import { statusFilterValues, PAYMENT_STATUSES, ORDER_STATUSES } from '@/lib/orders/orderFilters';

export async function GET(req: NextRequest) {
  try {
    const guard = await guardAdminRequest(req, {
      rateKeyPrefix: 'admin_orders_summary',
      limit: 60,
      windowMs: 60000,
    });
    if (!guard.ok) {
      return guard.response;
    }
    const db = guard.db;
    const ordersRef = db.collection('orders');

    // Statuses to count: Pending, Processing, Shipped, Delivered, Cancelled (excluding Dispatched since Shipped includes Dispatched)
    const statuses = ORDER_STATUSES.filter((s) => s !== 'Dispatched');

    // Payment statuses to count: awaiting_verification, awaiting_gateway, paid, failed, cod_due
    const paymentStatuses = PAYMENT_STATUSES;

    // Build promises for parallel execution using Promise.all
    const totalPromise = ordersRef.count().get().then((snap) => snap.data().count);

    const statusPromises = statuses.map((status) => {
      const values = statusFilterValues(status);
      let query: FirebaseFirestore.Query = ordersRef;
      if (values.length > 1) {
        query = query.where('status', 'in', values);
      } else {
        query = query.where('status', '==', values[0]);
      }
      return query.count().get().then((snap) => snap.data().count);
    });

    const paymentPromises = paymentStatuses.map((paymentStatus) => {
      return ordersRef.where('paymentStatus', '==', paymentStatus).count().get().then((snap) => snap.data().count);
    });

    const deliveredValues = statusFilterValues('Delivered');
    let deliveredQuery: FirebaseFirestore.Query = ordersRef;
    if (deliveredValues.length > 1) {
      deliveredQuery = deliveredQuery.where('status', 'in', deliveredValues);
    } else {
      deliveredQuery = deliveredQuery.where('status', '==', deliveredValues[0]);
    }
    const deliveredRevenuePromise = deliveredQuery
      .aggregate({ revenue: AggregateField.sum('total') })
      .get()
      .then((snap) => {
        const v = snap.data().revenue;
        return typeof v === 'number' && Number.isFinite(v) ? v : 0;
      })
      .catch(() => null);

    const [total, results, deliveredRevenue] = await Promise.all([
      totalPromise,
      Promise.all([...statusPromises, ...paymentPromises]),
      deliveredRevenuePromise,
    ]);

    const statusCounts: Record<string, number> = {};
    statuses.forEach((status, idx) => {
      statusCounts[status] = results[idx] || 0;
    });

    const paymentCounts: Record<string, number> = {};
    paymentStatuses.forEach((paymentStatus, idx) => {
      paymentCounts[paymentStatus] = results[statuses.length + idx] || 0;
    });

    return NextResponse.json(
      {
        success: true,
        counts: {
          total,
          status: {
            Pending: statusCounts['Pending'] || 0,
            Processing: statusCounts['Processing'] || 0,
            Shipped: statusCounts['Shipped'] || 0,
            Delivered: statusCounts['Delivered'] || 0,
            Cancelled: statusCounts['Cancelled'] || 0,
          },
          payment: {
            awaiting_verification: paymentCounts['awaiting_verification'] || 0,
            awaiting_gateway: paymentCounts['awaiting_gateway'] || 0,
            paid: paymentCounts['paid'] || 0,
            failed: paymentCounts['failed'] || 0,
            cod_due: paymentCounts['cod_due'] || 0,
          },
          deliveredRevenue,
        },
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch {
    console.error('[AdminOrdersSummaryAPI] Error loading order counts');
    return NextResponse.json(
      { success: false, error: 'Failed to load order counts.' },
      { status: 500 }
    );
  }
}
