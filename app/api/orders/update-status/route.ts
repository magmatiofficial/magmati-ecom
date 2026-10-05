import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { verifyAdminServerSide } from '@/lib/serverAuth';
import { dispatchServerOrderStatusNotification } from '@/lib/serverNotifications';

const VALID_STATUSES = ['Pending', 'Processing', 'Shipped', 'Dispatched', 'Delivered', 'Cancelled'];

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
    }

    // 2. Atomic Transaction: Update status + restore inventory if transitioning to Cancelled
    await adminDb.runTransaction(async (transaction) => {
      const currentDoc = await transaction.get(orderRef);
      if (!currentDoc.exists) {
        throw new Error('Order not found during transaction.');
      }

      const curData = currentDoc.data() || {};

      // If transitioning to Cancelled and was NOT already Cancelled, restock atomically
      if (status === 'Cancelled' && curData.status !== 'Cancelled' && Array.isArray(curData.items)) {
        for (const item of curData.items) {
          if (item.product?.id) {
            const productRef = adminDb.collection('products').doc(item.product.id);
            const productSnap = await transaction.get(productRef);
            if (productSnap.exists) {
              const currentStock = Number(productSnap.data()?.stockQuantity ?? 0);
              const newStock = currentStock + (Number(item.quantity) || 1);
              transaction.update(productRef, {
                stockQuantity: newStock,
                inStock: newStock > 0,
                updatedAt: new Date().toISOString(),
              });
            }
          }
        }
      }

      transaction.update(orderRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
    });

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
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order status.' },
      { status: 500 }
    );
  }
}
