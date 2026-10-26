import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { verifyAdminServerSide } from '@/lib/serverAuth';
import { dispatchServerOrderStatusNotification } from '@/lib/serverNotifications';
import { revalidateProductsServer } from '@/lib/revalidateProductsServer';

const VALID_STATUSES = ['Pending', 'Processing', 'Shipped', 'Dispatched', 'Delivered', 'Cancelled'];
const BLOCKED_PAYMENT_STATUSES = ['awaiting_verification', 'awaiting_gateway', 'failed'];
const CUSTOMER_NON_CANCELLABLE_PAYMENT_STATUSES = ['paid', 'awaiting_verification'];
const FULFILMENT_STATUSES = ['Processing', 'Shipped', 'Dispatched', 'Delivered'];

function isForbiddenTransition(from: unknown, to: string): boolean {
  return (from === 'Cancelled' && to !== 'Cancelled') || (from === 'Delivered' && to === 'Cancelled');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID or status provided.' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable.' },
        { status: 500 }
      );
    }

    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    const orderData = orderSnap.data() || {};
    const previousStatus = orderData.status;

    // 1. Check Admin Authorization
    const adminCheck = await verifyAdminServerSide(req);
    const isAdmin = adminCheck.authorized;

    if (!isAdmin) {
      // Non-admins can ONLY cancel their own Pending order with a verified Firebase ID token
      if (status !== 'Cancelled') {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Only administrators can update orders to non-cancelled statuses.' },
          { status: 403 }
        );
      }

      if (previousStatus !== 'Pending') {
        return NextResponse.json(
          { success: false, error: `Order #${orderId} cannot be cancelled because it is already ${previousStatus}.` },
          { status: 400 }
        );
      }

      const orderEmail = (orderData.userEmail || '').toLowerCase().trim();
      let isOwnerVerified = false;

      // Authenticated customer ownership check: derive identity from verified Bearer token
      const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ') && adminAuth) {
        try {
          const token = authHeader.substring(7).trim();
          const decoded = await adminAuth.verifyIdToken(token);
          if (decoded?.email && decoded.email.toLowerCase().trim() === orderEmail) {
            isOwnerVerified = true;
          }
        } catch {
          // Token verification failed
        }
      }

      // Fail closed: reject if not verified via valid Firebase ID token
      if (!isOwnerVerified) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Order cancellation requires verified order ownership with a valid authentication token.' },
          { status: 401 }
        );
      }

      if (CUSTOMER_NON_CANCELLABLE_PAYMENT_STATUSES.includes(orderData.paymentStatus)) {
        return NextResponse.json(
          { success: false, error: 'Payment for this order has been received or is being verified, so it cannot be cancelled online. Please contact support to cancel and arrange a refund.' },
          { status: 400 }
        );
      }
    }

    if (FULFILMENT_STATUSES.includes(status) && BLOCKED_PAYMENT_STATUSES.includes(orderData.paymentStatus)) {
      return NextResponse.json(
        { success: false, error: 'Payment is not verified for this order. Verify the payment before processing or shipping.' },
        { status: 400 }
      );
    }

    if (isForbiddenTransition(previousStatus, status)) {
      return NextResponse.json(
        { success: false, error: `Order #${orderId} is ${previousStatus} and cannot be changed to ${status}.` },
        { status: 400 }
      );
    }

    // Resolve fallback voucher for older orders without voucherDiscounts before transaction
    let fallbackVoucherEntry: { voucherId: string; discountAmount: number } | null = null;
    if (
      status === 'Cancelled' &&
      previousStatus !== 'Cancelled' &&
      !orderData.voucherDiscounts &&
      Array.isArray(orderData.appliedCoupons) &&
      orderData.appliedCoupons.length === 1 &&
      Number(orderData.discount) > 0
    ) {
      try {
        const code = String(orderData.appliedCoupons[0]).trim().toUpperCase();
        const vSnap = await adminDb.collection('vouchers').where('code', '==', code).limit(1).get();
        if (!vSnap.empty) {
          fallbackVoucherEntry = {
            voucherId: vSnap.docs[0].id,
            discountAmount: Number(orderData.discount) || 0,
          };
        }
      } catch (err) {
        console.warn('Fallback voucher resolution error:', err);
      }
    }

    // 2. Atomic Transaction: Update status + restore inventory + reverse vouchers if transitioning to Cancelled
    await adminDb.runTransaction(async (transaction) => {
      const currentDoc = await transaction.get(orderRef);
      if (!currentDoc.exists) {
        throw new Error('Order not found during transaction.');
      }

      const curData = currentDoc.data() || {};
      if (!isAdmin) {
        if (curData.status !== 'Pending') {
          const err: any = new Error(`Order #${orderId} cannot be cancelled because it is already ${curData.status}.`);
          err.httpStatus = 400;
          throw err;
        }
        if (CUSTOMER_NON_CANCELLABLE_PAYMENT_STATUSES.includes(curData.paymentStatus)) {
          const err: any = new Error('Payment for this order has been received or is being verified, so it cannot be cancelled online. Please contact support to cancel and arrange a refund.');
          err.httpStatus = 400;
          throw err;
        }
      }
      if (FULFILMENT_STATUSES.includes(status) && BLOCKED_PAYMENT_STATUSES.includes(curData.paymentStatus)) {
        const err = new Error('Payment is not verified for this order. Verify the payment before processing or shipping.');
        (err as any).httpStatus = 400;
        throw err;
      }
      if (isForbiddenTransition(curData.status, status)) {
        const err = new Error(`Order #${orderId} is ${curData.status} and cannot be changed to ${status}.`);
        (err as any).httpStatus = 400;
        throw err;
      }
      const isCancelling = status === 'Cancelled' && curData.status !== 'Cancelled';

      // --- PHASE 1: ALL READS FIRST ---
      const itemsToRestock = new Map<string, number>();
      const productSnapshots = new Map<string, any>();
      const voucherTotalSnapshots = new Map<string, any>();
      const voucherUserSnapshots = new Map<string, any>();
      let voucherList: Array<{ voucherId: string; discountAmount: number }> = [];
      const userEmailKey = curData.userEmail ? String(curData.userEmail).toLowerCase().trim() : null;

      if (isCancelling) {
        // Collect items to restock
        if (Array.isArray(curData.items)) {
          for (const item of curData.items) {
            if (item.product?.id) {
              const qty = Number(item.quantity) || 1;
              itemsToRestock.set(item.product.id, (itemsToRestock.get(item.product.id) || 0) + qty);
            }
          }
        }

        // Read all product snapshots
        for (const productId of itemsToRestock.keys()) {
          const productRef = adminDb.collection('products').doc(productId);
          const pSnap = await transaction.get(productRef);
          productSnapshots.set(productId, pSnap);
        }

        // Resolve voucher entries
        if (Array.isArray(curData.voucherDiscounts) && curData.voucherDiscounts.length > 0) {
          voucherList = curData.voucherDiscounts.map((v: any) => ({
            voucherId: v.voucherId,
            discountAmount: Number(v.discountAmount) || 0,
          }));
        } else if (
          Array.isArray(curData.appliedCoupons) &&
          curData.appliedCoupons.length === 1 &&
          Number(curData.discount) > 0 &&
          fallbackVoucherEntry
        ) {
          voucherList = [fallbackVoucherEntry];
        }

        // Read all voucher_usage snapshots
        for (const v of voucherList) {
          if (v.voucherId) {
            const totalRef = adminDb.collection('voucher_usage').doc(`${v.voucherId}__total`);
            const totalSnap = await transaction.get(totalRef);
            voucherTotalSnapshots.set(v.voucherId, totalSnap);

            if (userEmailKey) {
              const userRef = adminDb.collection('voucher_usage').doc(`${v.voucherId}__${userEmailKey}`);
              const userSnap = await transaction.get(userRef);
              voucherUserSnapshots.set(v.voucherId, userSnap);
            }
          }
        }
      }

      // --- PHASE 2: ALL WRITES ---
      const nowIso = new Date().toISOString();
      let vouchersReversed = false;

      if (isCancelling) {
        // 1. Restock products
        for (const [productId, qtyToRestock] of itemsToRestock.entries()) {
          const productSnap = productSnapshots.get(productId);
          if (productSnap?.exists) {
            const currentStock = Number(productSnap.data()?.stockQuantity ?? 0);
            const newStock = currentStock + qtyToRestock;
            const productRef = adminDb.collection('products').doc(productId);
            transaction.update(productRef, {
              stockQuantity: newStock,
              inStock: newStock > 0,
              updatedAt: nowIso,
            });
          }
        }

        // 2. Reverse voucher usage
        for (const v of voucherList) {
          if (v.voucherId) {
            const totalSnap = voucherTotalSnapshots.get(v.voucherId);
            if (totalSnap?.exists) {
              const tData = totalSnap.data() || {};
              const prevBudget = Number(tData.usedDiscountBudget) || 0;
              const prevOrders = Number(tData.totalOrders) || 0;
              const totalRef = adminDb.collection('voucher_usage').doc(`${v.voucherId}__total`);
              transaction.set(
                totalRef,
                {
                  usedDiscountBudget: Math.max(0, prevBudget - v.discountAmount),
                  totalOrders: Math.max(0, prevOrders - 1),
                  updatedAt: nowIso,
                },
                { merge: true }
              );
              vouchersReversed = true;
            }

            if (userEmailKey) {
              const userSnap = voucherUserSnapshots.get(v.voucherId);
              if (userSnap?.exists) {
                const uData = userSnap.data() || {};
                const prevCount = Number(uData.usedCount) || 0;
                const prevAccum = Number(uData.accumulatedDiscount) || 0;
                const userRef = adminDb.collection('voucher_usage').doc(`${v.voucherId}__${userEmailKey}`);
                transaction.set(
                  userRef,
                  {
                    usedCount: Math.max(0, prevCount - 1),
                    accumulatedDiscount: Math.max(0, prevAccum - v.discountAmount),
                    updatedAt: nowIso,
                  },
                  { merge: true }
                );
                vouchersReversed = true;
              }
            }
          }
        }
      }

      const orderUpdates: Record<string, any> = {
        status,
        updatedAt: nowIso,
      };
      if (vouchersReversed) {
        orderUpdates.voucherUsageReverted = true;
      }

      transaction.update(orderRef, orderUpdates);
    });
    if (status === 'Cancelled' && previousStatus !== 'Cancelled') revalidateProductsServer();

    // 3. Trigger Server-Side Status Change Notification
    if (previousStatus !== status) {
      dispatchServerOrderStatusNotification(
        {
          id: orderId,
          userName: orderData.userName || 'Customer',
          phone: orderData.phone || '',
          userEmail: orderData.userEmail,
          status,
        },
        status
      ).catch((err) => {
        console.warn('Status notification dispatch notice:', err);
      });
    }

    return NextResponse.json({
      success: true,
      orderId,
      status,
    });
  } catch (error: any) {
    console.error('Order status update error:', error);
    const statusCode = typeof error?.httpStatus === 'number' ? error.httpStatus : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order status.' },
      { status: statusCode }
    );
  }
}
