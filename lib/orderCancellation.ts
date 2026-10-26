import { revalidateProductsServer } from '@/lib/revalidateProductsServer';
export async function cancelPendingOrderAndRelease(
  adminDb: FirebaseFirestore.Firestore,
  orderId: string,
  paymentLabel: string
): Promise<{ changed: boolean }> {
  const orderRef = adminDb.collection('orders').doc(orderId);
  const orderSnap = await orderRef.get();
  if (!orderSnap.exists) {
    return { changed: false };
  }

  const orderData = orderSnap.data() || {};
  if (orderData.status !== 'Pending') {
    return { changed: false };
  }
  const paymentStr = typeof orderData.payment === 'string' ? orderData.payment : '';
  if (/cash\s*on\s*delivery|\bcod\b/i.test(paymentStr)) {
    return { changed: false };
  }

  // Resolve fallback voucher for older orders without voucherDiscounts before transaction
  let fallbackVoucherEntry: { voucherId: string; discountAmount: number } | null = null;
  if (
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
      console.warn('[cancelPendingOrderAndRelease] Fallback voucher resolution error:', err);
    }
  }

  const result = await adminDb.runTransaction(async (transaction) => {
    const currentDoc = await transaction.get(orderRef);
    if (!currentDoc.exists) {
      return { changed: false };
    }

    const curData = currentDoc.data() || {};
    if (curData.status !== 'Pending') {
      return { changed: false };
    }
    const curPaymentStr = typeof curData.payment === 'string' ? curData.payment : '';
    if (/cash\s*on\s*delivery|\bcod\b/i.test(curPaymentStr)) {
      return { changed: false };
    }

    // --- PHASE 1: ALL READS FIRST ---
    const itemsToRestock = new Map<string, number>();
    const productSnapshots = new Map<string, FirebaseFirestore.DocumentSnapshot>();
    const voucherTotalSnapshots = new Map<string, FirebaseFirestore.DocumentSnapshot>();
    const voucherUserSnapshots = new Map<string, FirebaseFirestore.DocumentSnapshot>();
    let voucherList: Array<{ voucherId: string; discountAmount: number }> = [];
    const userEmailKey = curData.userEmail ? String(curData.userEmail).toLowerCase().trim() : null;

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

    // --- PHASE 2: ALL WRITES ---
    const nowIso = new Date().toISOString();
    let vouchersReversed = false;

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

    const orderUpdates: Record<string, any> = {
      status: 'Cancelled',
      paymentStatus: 'failed',
      payment: paymentLabel,
      updatedAt: nowIso,
    };
    if (vouchersReversed) {
      orderUpdates.voucherUsageReverted = true;
    }

    transaction.update(orderRef, orderUpdates);
    return { changed: true };
  });
  if (result.changed) revalidateProductsServer();
  return result;
}
