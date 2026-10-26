/**
 * @file app/api/admin/orders/[orderId]/route.ts
 * @description Admin API endpoint to fetch a single order by ID from Firestore.
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdminRequest } from '@/lib/api/adminGuard';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const guard = await guardAdminRequest(req, {
      rateKeyPrefix: 'admin_order_by_id',
      limit: 120,
      windowMs: 60000,
    });
    if (!guard.ok) {
      return guard.response;
    }

    const { orderId } = await context.params;

    if (!orderId || typeof orderId !== 'string' || !/^[A-Za-z0-9_-]{1,40}$/.test(orderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order id.' },
        { status: 400 }
      );
    }

    const docSnap = await guard.db.collection('orders').doc(orderId).get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    const orderData = docSnap.data();

    return NextResponse.json(
      {
        success: true,
        order: {
          id: docSnap.id,
          ...orderData,
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
    console.error('[AdminOrderByIdAPI] Error loading order');
    return NextResponse.json(
      { success: false, error: 'Failed to load order.' },
      { status: 500 }
    );
  }
}
