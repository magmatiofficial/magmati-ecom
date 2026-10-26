import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyAdminServerSide } from '@/lib/serverAuth';
import { cancelPendingOrderAndRelease } from '@/lib/orderCancellation';
import { dispatchServerOrderStatusNotification } from '@/lib/serverNotifications';

export async function POST(req: NextRequest) {
  try {
    const adminCheck = await verifyAdminServerSide(req);
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { success: false, error: adminCheck.error || 'Unauthorized' },
        { status: adminCheck.status || 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { orderId, decision } = body || {};

    if (
      typeof orderId !== 'string' ||
      !/^\d{6,15}$/.test(orderId) ||
      (decision !== 'verify' && decision !== 'reject')
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID or decision.' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable.' },
        { status: 503 }
      );
    }

    const orderRef = adminDb.collection('orders').doc(orderId);
    const result = await adminDb.runTransaction(async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists) {
        const err = new Error('Order not found.');
        (err as any).httpStatus = 404;
        throw err;
      }

      const orderData = orderSnap.data() || {};
      const payment = orderData.payment;

      if (payment !== 'bKash Online' && payment !== 'Nagad Online') {
        const err = new Error('Only bKash or Nagad orders need manual payment verification.');
        (err as any).httpStatus = 400;
        throw err;
      }

      const currentPaymentStatus = orderData.paymentStatus;
      const nowIso = new Date().toISOString();
      const adminEmail = adminCheck.email || '';

      if (decision === 'verify') {
        if (currentPaymentStatus === 'paid') {
          return {
            success: true,
            orderId,
            paymentStatus: 'paid',
            alreadyVerified: true,
          };
        }

        if (currentPaymentStatus === 'awaiting_verification') {
          transaction.update(orderRef, {
            paymentStatus: 'paid',
            paidAt: nowIso,
            paymentVerifiedBy: adminEmail,
            updatedAt: nowIso,
          });
          return {
            success: true,
            orderId,
            paymentStatus: 'paid',
          };
        }

        const err = new Error('This order is not awaiting payment verification.');
        (err as any).httpStatus = 409;
        throw err;
      } else {
        if (currentPaymentStatus !== 'awaiting_verification') {
          const err = new Error('This order is not awaiting payment verification.');
          (err as any).httpStatus = 409;
          throw err;
        }

        transaction.update(orderRef, {
          paymentStatus: 'failed',
          paymentRejectedBy: adminEmail,
          paymentRejectedAt: nowIso,
          updatedAt: nowIso,
        });
        return {
          success: true,
          orderId,
          paymentStatus: 'failed',
          paymentLabel: payment,
        };
      }
    });

    let changed = false;
    if (decision === 'reject' && result.paymentStatus === 'failed' && (result as any).paymentLabel) {
      try {
        const cancelRes = await cancelPendingOrderAndRelease(adminDb, orderId, (result as any).paymentLabel);
        changed = !!cancelRes?.changed;
      } catch (err) {
        console.error('Auto cancel on payment rejection error:', err);
        changed = false;
      }

      if (changed) {
        try {
          const orderSnap = await adminDb.collection('orders').doc(orderId).get();
          const data = orderSnap.data() || {};
          dispatchServerOrderStatusNotification({
            id: orderId,
            userName: data.userName || 'Customer',
            phone: data.phone || '',
            userEmail: data.userEmail,
            status: 'Cancelled',
          }, 'Cancelled').catch((err) => console.warn('Status notification dispatch notice:', err));
        } catch (err) {
          // ignore notification errors
        }
      }

      return NextResponse.json({
        success: true,
        orderId,
        paymentStatus: 'failed',
        status: changed ? 'Cancelled' : 'Pending',
        cancelled: changed,
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Verify payment error:', error);
    const statusCode = typeof error?.httpStatus === 'number' ? error.httpStatus : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify payment.' },
      { status: statusCode }
    );
  }
}
