import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth, isAdminDbReady } from '@/lib/firebaseAdmin';
import { BANGLADESH_DISTRICTS } from '@/lib/bangladeshDistricts';
import { FREE_SHIPPING_THRESHOLD_BDT, STANDARD_DELIVERY_DHAKA, STANDARD_DELIVERY_OUTSIDE } from '@/lib/constants';
import { dispatchServerOrderPlacedNotification } from '@/lib/serverNotifications';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { evaluateVoucher, VoucherRule } from '@/lib/voucherEngine';
import { revalidateProductsServer } from '@/lib/revalidateProductsServer';
import { generateNumericId } from '@/lib/numericId';

const ALLOWED_PAYMENT_METHODS = [
  'Cash on Delivery',
  'bKash Online',
  'Nagad Online',
  'Debit/Credit Card',
];

const PAYMENT_METHOD_ID_MAP: Record<string, string> = {
  'Cash on Delivery': 'cod',
  'bKash Online': 'bkash',
  'Nagad Online': 'nagad',
  'Debit/Credit Card': 'card',
};

interface CreateOrderRequestBody {
  userEmail?: string;
  userName: string;
  phone: string;
  address: string;
  district?: string;
  orderNotes?: string;
  payment: string;
  trxId?: string;
  items: Array<{
    product: { id: string; name?: string; price?: number; image?: string; category?: string };
    quantity: number;
    selectedSize?: string;
    selectedColor?: { name: string; hex: string };
    customPrice?: number;
    isFreeItem?: boolean;
    isComboItem?: boolean;
    comboId?: string;
    promoLabel?: string;
  }>;
  appliedCoupon?: string;
  appliedCoupons?: string[];
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const isAllowed = rateLimit(`order_create:${clientIp}`, 10, 60 * 1000);
  if (!isAllowed.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const body: CreateOrderRequestBody = await req.json();

    if (isAdminDbReady === false) {
      console.error('[OrderCreate] Rejected: adminDb is not ready. Missing FIREBASE_SERVICE_ACCOUNT_KEY or ADC.');
      return NextResponse.json(
        { success: false, error: 'Server database is not configured. Order was NOT saved. Please contact support.' },
        { status: 503 }
      );
    }

    const {
      userEmail: clientEmail,
      userName,
      phone,
      address,
      district = 'dhaka',
      orderNotes = '',
      payment = 'Cash on Delivery',
      trxId = '',
      items = [],
      appliedCoupon,
      appliedCoupons,
    } = body;

    // 1. Field validation
    if (!userName || !phone || !address || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required order details (Name, Phone, Address, or Items).' },
        { status: 400 }
      );
    }

    const validatedPayment = typeof payment === 'string' ? payment.trim() : '';
    if (!ALLOWED_PAYMENT_METHODS.includes(validatedPayment)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment method.' },
        { status: 400 }
      );
    }

    let paymentStatus: 'cod_due' | 'awaiting_verification' | 'awaiting_gateway' = 'cod_due';
    if (validatedPayment === 'bKash Online' || validatedPayment === 'Nagad Online') {
      paymentStatus = 'awaiting_verification';
    } else if (validatedPayment === 'Debit/Credit Card') {
      paymentStatus = 'awaiting_gateway';
    }

    const isManualWalletPayment = validatedPayment === 'bKash Online' || validatedPayment === 'Nagad Online';
    let normalizedTrxId = '';
    if (isManualWalletPayment) {
      normalizedTrxId = String(trxId || '').trim().toUpperCase();
      if (!/^[A-Z0-9]{8,14}$/.test(normalizedTrxId)) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid Transaction ID (TrxID).' },
          { status: 400 }
        );
      }
    }

    const cleanedPhone = phone.replace(/[\s-+]/g, '').replace(/^88/, '');
    if (!/^01[3-9]\d{8}$/.test(cleanedPhone)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 11-digit Bangladeshi mobile number.' },
        { status: 400 }
      );
    }

    // 2. Order Identity Verification: derive authenticated identity from Bearer token if present
    let verifiedUserEmail = 'guest';
    let guestEmail: string | undefined = (clientEmail || '').toLowerCase().trim();
    if (guestEmail === '') guestEmail = undefined;
    let isServerVerifiedUser = false;
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');

    if (authHeader) {
      if (!authHeader.startsWith('Bearer ') || !adminAuth) {
        return NextResponse.json({ success: false, error: 'Session expired. Please log in again or checkout as a guest.' }, { status: 401 });
      }
      try {
        const token = authHeader.substring(7).trim();
        const decoded = await adminAuth.verifyIdToken(token);
        if (decoded?.email) {
          verifiedUserEmail = decoded.email.toLowerCase().trim();
          isServerVerifiedUser = true;
          guestEmail = undefined; // Logged in, no guestEmail
        } else {
          return NextResponse.json({ success: false, error: 'Session expired. Please log in again or checkout as a guest.' }, { status: 401 });
        }
      } catch (e) {
        return NextResponse.json({ success: false, error: 'Session expired. Please log in again or checkout as a guest.' }, { status: 401 });
      }
    }

    // 3. Authoritative Server Product Pricing & Stock Validation
    let siteSettingsData: any = null;
    if (adminDb) {
      try {
        const settingsDoc = await adminDb.collection('site_settings').doc('storefront').get();
        if (settingsDoc.exists) {
          siteSettingsData = settingsDoc.data();
        }
      } catch {}
    }
    const activeB1g1Offers = Array.isArray(siteSettingsData?.b1g1Offers) ? siteSettingsData.b1g1Offers : [];
    const activeCombos = Array.isArray(siteSettingsData?.combos) ? siteSettingsData.combos : [];

    let verifiedSubtotal = 0;
    const verifiedOrderItems: any[] = [];

    for (const item of items) {
      const prodId = item.product?.id;
      if (!prodId) {
        return NextResponse.json(
          { success: false, error: 'Invalid order item: missing product ID.' },
          { status: 400 }
        );
      }

      let prodData: any = null;

      // Try Firestore lookup
      if (adminDb) {
        try {
          const prodDoc = await adminDb.collection('products').doc(prodId).get();
          if (prodDoc.exists) {
            prodData = prodDoc.data();
          }
        } catch {}
      }

      // Reject if product does not exist in authoritative server catalog (no client price fallback)
      if (!prodData) {
        return NextResponse.json(
          { success: false, error: `Product "${prodId}" does not exist in the authoritative product catalog.` },
          { status: 400 }
        );
      }

      const authoritativePrice = typeof prodData.price === 'number' ? prodData.price : 0;
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const productName = prodData.name || prodId;

      const paymentMethodId = PAYMENT_METHOD_ID_MAP[validatedPayment];
      if (
        Array.isArray(prodData.allowedPaymentMethods) &&
        prodData.allowedPaymentMethods.length > 0 &&
        paymentMethodId &&
        !prodData.allowedPaymentMethods.includes(paymentMethodId)
      ) {
        return NextResponse.json(
          { success: false, error: `Payment method "${validatedPayment}" is not available for product "${productName}".` },
          { status: 400 }
        );
      }

      if (prodData.inStock === false) {
        return NextResponse.json(
          { success: false, error: `Sorry, product "${productName}" is out of stock.` },
          { status: 400 }
        );
      }

      if (typeof prodData.stockQuantity !== 'number' || !Number.isFinite(prodData.stockQuantity)) {
        return NextResponse.json(
          { success: false, error: `Product "${productName}" is currently unavailable (stock not set).` },
          { status: 400 }
        );
      }

      const availableStock = prodData.stockQuantity;
      if (qty > availableStock) {
        return NextResponse.json(
          { success: false, error: `Sorry, product "${productName}" only has ${availableStock} units left in stock.` },
          { status: 400 }
        );
      }

      // Calculate effective item price with strict server-side promotion validation
      let effectiveItemPrice = authoritativePrice;
      let isFreeItemVerified = false;
      let isComboItemVerified = false;

      if (item.isFreeItem) {
        const validOffer = activeB1g1Offers.find((offer: any) =>
          offer.enabled &&
          offer.getProductId === prodId
        );

        const qualifyingItem = items.find((i: any) =>
          (i.product?.id || i.productId) === validOffer?.buyProductId &&
          !i.isFreeItem &&
          Boolean(i.claimedB1G1 || i.claimedB1G1Offer)
        );

        if (validOffer && qualifyingItem) {
          const buyQty = validOffer.buyQuantity || 1;
          const getQty = validOffer.getQuantity || 1;
          const qualifyingQty = Math.max(1, Math.floor(Number(qualifyingItem.quantity) || 1));
          const maxFreeAllowed = Math.floor(qualifyingQty / buyQty) * getQty;

          if (qty <= maxFreeAllowed) {
            effectiveItemPrice = 0;
            isFreeItemVerified = true;
          } else {
            return NextResponse.json(
              { success: false, error: `Free gift quantity (${qty}) exceeds allowed offer quantity (${maxFreeAllowed}) for product "${prodId}".` },
              { status: 400 }
            );
          }
        } else {
          return NextResponse.json(
            { success: false, error: `Invalid or unauthorized free item claim for product "${prodId}". Qualifying product and explicit offer claim required.` },
            { status: 400 }
          );
        }
      } else if (item.isComboItem && item.comboId) {
        const validCombo = activeCombos.find((combo: any) =>
          combo.enabled &&
          combo.id === item.comboId &&
          combo.items?.some((ci: any) => ci.productId === prodId)
        );

        // Verify that ALL combo items are present in order payload for this combo
        const allComboItemsPresent = validCombo?.items?.every((ci: any) =>
          items.some((i: any) => (i.product?.id || i.productId) === ci.productId && i.isComboItem && i.comboId === validCombo.id)
        );

        if (!validCombo || !allComboItemsPresent) {
          return NextResponse.json(
            { success: false, error: `Invalid or manipulated combo promotion for product "${prodId}". All combo items must be present.` },
            { status: 400 }
          );
        }

        let comboApplied = false;
        if (adminDb && validCombo.items) {
          try {
            const comboProductRefs = validCombo.items.map((ci: any) => adminDb.collection('products').doc(ci.productId));
            const comboProductDocs = await adminDb.getAll(...comboProductRefs);
            
            let comboOriginalSum = 0;
            let allExist = true;

            for (let i = 0; i < validCombo.items.length; i++) {
              const ci = validCombo.items[i];
              const doc = comboProductDocs[i];
              if (!doc.exists) {
                allExist = false;
                break;
              }
              const dData = doc.data();
              const pPrice = typeof dData?.price === 'number' ? dData.price : 0;
              comboOriginalSum += pPrice * (ci.quantity || 1);
            }

            if (allExist) {
              let allocatedComboPrice = validCombo.comboPrice;
              if (comboOriginalSum > 0) {
                allocatedComboPrice = Math.round((authoritativePrice / comboOriginalSum) * validCombo.comboPrice);
              }
              effectiveItemPrice = allocatedComboPrice;
              isComboItemVerified = true;
              comboApplied = true;
            }
          } catch {
            // never throw, treat combo as not valid
          }
        }
      }

      verifiedSubtotal += effectiveItemPrice * qty;
      verifiedOrderItems.push({
        product: {
          id: prodId,
          name: prodData.name || 'Product',
          price: authoritativePrice,
          image: prodData.images?.[0] || prodData.image || '',
          category: prodData.category || '',
        },
        quantity: qty,
        selectedSize: item.selectedSize || 'Standard',
        selectedColor: item.selectedColor || { name: 'Standard', hex: '#000000' },
        customPrice: effectiveItemPrice,
        isFreeItem: isFreeItemVerified,
        isComboItem: isComboItemVerified,
        ...(item.comboId ? { comboId: item.comboId } : {}),
        ...(item.promoLabel ? { promoLabel: item.promoLabel } : {}),
      });
    }

    if (verifiedOrderItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid product items in order.' },
        { status: 400 }
      );
    }

    // 4. Server-Side Delivery Fee Calculation
    const activeDistrict = BANGLADESH_DISTRICTS.find((d) => d.id === district || d.nameEn.toLowerCase() === district.toLowerCase());
    const isInsideDhaka = activeDistrict ? activeDistrict.isDhakaCity : true;
    
    const insideDhakaFee =
      typeof siteSettingsData?.insideDhakaDeliveryFee === 'number'
        ? siteSettingsData.insideDhakaDeliveryFee
        : STANDARD_DELIVERY_DHAKA;
    const outsideDhakaFee =
      typeof siteSettingsData?.outsideDhakaDeliveryFee === 'number'
        ? siteSettingsData.outsideDhakaDeliveryFee
        : STANDARD_DELIVERY_OUTSIDE;
    const freeShippingThreshold =
      typeof siteSettingsData?.freeShippingThreshold === 'number'
        ? siteSettingsData.freeShippingThreshold
        : FREE_SHIPPING_THRESHOLD_BDT;

    const verifiedDeliveryFee = verifiedSubtotal >= freeShippingThreshold
      ? 0
      : isInsideDhaka
      ? insideDhakaFee
      : outsideDhakaFee;

    // 5. Server-Side Voucher Discount Calculation (Authoritative Firestore Validation)
    let verifiedDiscount = 0;
    const couponCodesToValidate: string[] = [];
    if (Array.isArray(appliedCoupons)) {
      for (const code of appliedCoupons) {
        if (typeof code === 'string' && code.trim()) {
          const upper = code.trim().toUpperCase();
          if (!couponCodesToValidate.includes(upper)) {
            couponCodesToValidate.push(upper);
          }
        }
      }
    }
    if (typeof appliedCoupon === 'string' && appliedCoupon.trim()) {
      const upper = appliedCoupon.trim().toUpperCase();
      if (!couponCodesToValidate.includes(upper)) {
        couponCodesToValidate.push(upper);
      }
    }

    interface AppliedVoucherRecord {
      voucherId: string;
      code: string;
      discountAmount: number;
      voucherRule: VoucherRule;
    }
    const appliedVouchersList: AppliedVoucherRecord[] = [];
    const voucherUserEmail = isServerVerifiedUser ? verifiedUserEmail : undefined;
    const emailKey = voucherUserEmail ? voucherUserEmail.toLowerCase() : undefined;
    const orderCategories = Array.from(
      new Set(
        verifiedOrderItems
          .map((item) => item.product?.category)
          .filter((cat): cat is string => Boolean(cat && typeof cat === 'string'))
      )
    );

    if (couponCodesToValidate.length > 0) {
      if (!adminDb) {
        return NextResponse.json(
          { success: false, error: 'Server database is not configured. Order was NOT saved. Please contact support.' },
          { status: 503 }
        );
      }

      let maxVouchersPerOrder = 1;
      try {
        const voucherSettingsDoc = await adminDb.collection('public_settings').doc('vouchers').get();
        if (voucherSettingsDoc.exists) {
          const rawMax = voucherSettingsDoc.data()?.maxVouchersPerOrder;
          if (typeof rawMax === 'number') {
            maxVouchersPerOrder = Math.min(5, Math.max(1, Math.floor(rawMax)));
          }
        }
      } catch (settingsErr) {
        console.error('[OrderCreate] Error querying voucher settings from Firestore:', settingsErr);
        return NextResponse.json(
          { success: false, error: 'Failed to validate voucher. Please try again.' },
          { status: 500 }
        );
      }

      if (couponCodesToValidate.length > maxVouchersPerOrder) {
        return NextResponse.json(
          { success: false, error: `You can apply a maximum of ${maxVouchersPerOrder} voucher(s) per order.` },
          { status: 400 }
        );
      }

      for (const code of couponCodesToValidate) {
        let voucherDoc: any = null;
        try {
          const qSnap = await adminDb.collection('vouchers').where('code', '==', code).limit(1).get();
          if (!qSnap.empty) {
            voucherDoc = qSnap.docs[0];
          }
        } catch (dbErr) {
          console.error('[OrderCreate] Error querying vouchers from Firestore:', dbErr);
          return NextResponse.json(
            { success: false, error: 'Failed to validate voucher. Please try again.' },
            { status: 500 }
          );
        }

        if (!voucherDoc || !voucherDoc.exists) {
          return NextResponse.json(
            { success: false, error: 'Invalid voucher code.' },
            { status: 400 }
          );
        }

        const voucherData = voucherDoc.data() || {};

        const voucherRule: VoucherRule = {
          id: voucherDoc.id,
          code: (voucherData.code || code).toString().trim().toUpperCase(),
          isActive: Boolean(voucherData.isActive),
          discountType: voucherData.discountType,
          discountValue: Number(voucherData.discountValue) || 0,
          minSpend: Number(voucherData.minSpend) || 0,
          maxDiscount: typeof voucherData.maxDiscount === 'number' ? voucherData.maxDiscount : undefined,
          paymentMethodRequirement: voucherData.paymentMethodRequirement || 'all',
          applicableCategory: voucherData.applicableCategory || 'all',
          requiresLogin: Boolean(voucherData.requiresLogin),
          expiresAt: voucherData.expiresAt,
          maxUsesPerCustomer: typeof voucherData.maxUsesPerCustomer === 'number' ? voucherData.maxUsesPerCustomer : undefined,
          maxDiscountSpendPerUser: typeof voucherData.maxDiscountSpendPerUser === 'number' ? voucherData.maxDiscountSpendPerUser : undefined,
          totalDiscountBudget: typeof voucherData.totalDiscountBudget === 'number' ? voucherData.totalDiscountBudget : undefined,
        };

        let preUserUsedCount = 0;
        let preUserAccumulatedDiscount = 0;
        let preTotalUsedBudget = 0;

        if (emailKey) {
          const userUsageDoc = await adminDb.collection('voucher_usage').doc(`${voucherDoc.id}__${emailKey}`).get();
          if (userUsageDoc.exists) {
            const uData = userUsageDoc.data();
            preUserUsedCount = Number(uData?.usedCount) || 0;
            preUserAccumulatedDiscount = Number(uData?.accumulatedDiscount) || 0;
          }
        }

        const totalUsageDoc = await adminDb.collection('voucher_usage').doc(`${voucherDoc.id}__total`).get();
        if (totalUsageDoc.exists) {
          const tData = totalUsageDoc.data();
          preTotalUsedBudget = Number(tData?.usedDiscountBudget) || 0;
        }

        const usage = {
          usedByUser: preUserUsedCount,
          accumulatedByUser: preUserAccumulatedDiscount,
          totalUsedBudget: preTotalUsedBudget,
        };

        const evalResult = evaluateVoucher(voucherRule, {
          subtotal: verifiedSubtotal,
          deliveryFee: verifiedDeliveryFee,
          paymentLabel: validatedPayment,
          categories: orderCategories,
          userEmail: voucherUserEmail,
          usage,
        });

        if (!evalResult.isValid) {
          return NextResponse.json(
            { success: false, error: evalResult.message },
            { status: 400 }
          );
        }

        verifiedDiscount += evalResult.discountAmount;
        appliedVouchersList.push({
          voucherId: voucherDoc.id,
          code: voucherRule.code,
          discountAmount: evalResult.discountAmount,
          voucherRule,
        });
      }
    }

    const verifiedTotal = Math.max(0, verifiedSubtotal + verifiedDeliveryFee - verifiedDiscount);

    // 6. Generate Order Document & Retry Loop on ID Collision
    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: 'Server database is not configured. Order was NOT saved. Please contact support.' },
        { status: 503 }
      );
    }

    const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    const currentDate = new Date().toLocaleDateString('en-US', dateOptions);
    const isoDate = new Date().toISOString();

    let finalOrderId = '';
    let finalOrderDocument: any = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      const orderId = generateNumericId(10);

      const verifiedOrderDocument = {
        id: orderId,
        userEmail: verifiedUserEmail,
        ...(guestEmail ? { guestEmail } : {}),
        userName: userName.trim(),
        phone: cleanedPhone,
        address: address.trim(),
        district: activeDistrict ? activeDistrict.nameEn : 'Dhaka',
        orderNotes: orderNotes.trim(),
        payment: validatedPayment,
        paymentStatus,
        ...(isManualWalletPayment ? { trxId: normalizedTrxId } : {}),
        items: verifiedOrderItems,
        subtotal: verifiedSubtotal,
        deliveryFee: verifiedDeliveryFee,
        discount: verifiedDiscount,
        total: verifiedTotal,
        status: 'Pending',
        date: currentDate,
        createdAt: isoDate,
        ...(couponCodesToValidate.length > 0 ? { appliedCoupon: couponCodesToValidate.join(', ') } : {}),
        ...(couponCodesToValidate.length > 0 ? { appliedCoupons: couponCodesToValidate } : {}),
        ...(appliedVouchersList.length > 0
          ? {
              voucherDiscounts: appliedVouchersList.map((v) => ({
                voucherId: v.voucherId,
                code: v.code,
                discountAmount: v.discountAmount,
              })),
            }
          : {}),
      };

      const orderRef = adminDb.collection('orders').doc(orderId);

      try {
        await adminDb.runTransaction(async (transaction) => {
          // 1. Build a Map of productId -> total quantity across all order items
          const productQuantities = new Map<string, number>();
          for (const item of verifiedOrderItems) {
            productQuantities.set(
              item.product.id,
              (productQuantities.get(item.product.id) || 0) + item.quantity
            );
          }

          // 2. Perform ALL reads before any write
          const orderSnap = await transaction.get(orderRef);
          if (orderSnap.exists) {
            const collisionErr = new Error('Order ID collision. Please try again.');
            (collisionErr as any).isCollision = true;
            throw collisionErr;
          }

          let trxRef: any = null;
          if (isManualWalletPayment) {
            const methodPrefix = validatedPayment === 'bKash Online' ? 'bkash' : 'nagad';
            const trxDocId = `${methodPrefix}_${normalizedTrxId}`;
            trxRef = adminDb.collection('payment_trx_ids').doc(trxDocId);
            const trxSnap: any = await transaction.get(trxRef);
            if (trxSnap.exists) {
              const dupErr = new Error('This Transaction ID has already been used for another order.');
              (dupErr as any).isDuplicateTrx = true;
              throw dupErr;
            }
          }

          const productSnapshots = new Map<string, any>();
          for (const productId of productQuantities.keys()) {
            const productRef = adminDb.collection('products').doc(productId);
            const productSnap = await transaction.get(productRef);
            productSnapshots.set(productId, productSnap);
          }

          const voucherTotalSnapshots = new Map<string, any>();
          const voucherUserSnapshots = new Map<string, any>();
          for (const appliedVoucher of appliedVouchersList) {
            const totalUsageRef = adminDb.collection('voucher_usage').doc(`${appliedVoucher.voucherId}__total`);
            const totalSnap = await transaction.get(totalUsageRef);
            voucherTotalSnapshots.set(appliedVoucher.voucherId, totalSnap);

            if (emailKey) {
              const userUsageRef = adminDb.collection('voucher_usage').doc(`${appliedVoucher.voucherId}__${emailKey}`);
              const userSnap = await transaction.get(userUsageRef);
              voucherUserSnapshots.set(appliedVoucher.voucherId, userSnap);
            }
          }

          // 3. Re-evaluate vouchers with fresh transactional usage values
          for (const appliedVoucher of appliedVouchersList) {
            let freshUserUsedCount = 0;
            let freshUserAccumulatedDiscount = 0;
            let freshTotalUsedBudget = 0;

            if (emailKey) {
              const uSnap = voucherUserSnapshots.get(appliedVoucher.voucherId);
              if (uSnap?.exists) {
                const uData = uSnap.data();
                freshUserUsedCount = Number(uData?.usedCount) || 0;
                freshUserAccumulatedDiscount = Number(uData?.accumulatedDiscount) || 0;
              }
            }

            const tSnap = voucherTotalSnapshots.get(appliedVoucher.voucherId);
            if (tSnap?.exists) {
              const tData = tSnap.data();
              freshTotalUsedBudget = Number(tData?.usedDiscountBudget) || 0;
            }

            const freshUsage = {
              usedByUser: freshUserUsedCount,
              accumulatedByUser: freshUserAccumulatedDiscount,
              totalUsedBudget: freshTotalUsedBudget,
            };

            const reEvalResult = evaluateVoucher(appliedVoucher.voucherRule, {
              subtotal: verifiedSubtotal,
              deliveryFee: verifiedDeliveryFee,
              paymentLabel: validatedPayment,
              categories: orderCategories,
              userEmail: voucherUserEmail,
              usage: freshUsage,
            });

            if (!reEvalResult.isValid) {
              const err = new Error(reEvalResult.message);
              (err as any).isClientError = true;
              throw err;
            }
          }

          // 4. Validate stock for all products using already-read snapshots
          const productUpdates: {
            productRef: any;
            updatedStock: number;
          }[] = [];

          for (const [productId, totalQuantity] of productQuantities.entries()) {
            const productRef = adminDb.collection('products').doc(productId);
            const productSnap = productSnapshots.get(productId);

            let stockNum = 50;
            if (productSnap?.exists) {
              const currentStock = productSnap.data()?.stockQuantity;
              stockNum = typeof currentStock === 'number' ? currentStock : 50;
            } else {
              throw new Error(`Product "${productId}" no longer exists.`);
            }

            if (stockNum < totalQuantity) {
              const prodName = verifiedOrderItems.find((i) => i.product.id === productId)?.product.name || productId;
              throw new Error(`Insufficient stock for "${prodName}". Available: ${stockNum}, Requested: ${totalQuantity}`);
            }

            const updatedStock = stockNum - totalQuantity;
            productUpdates.push({
              productRef,
              updatedStock,
            });
          }

          // 5. Perform all writes: updates for products, then order document
          for (const update of productUpdates) {
            transaction.update(update.productRef, {
              stockQuantity: update.updatedStock,
              inStock: update.updatedStock > 0,
              updatedAt: isoDate,
            });
          }

          transaction.set(orderRef, verifiedOrderDocument);

          if (isManualWalletPayment && trxRef) {
            transaction.set(trxRef, {
              orderId,
              method: validatedPayment,
              trxId: normalizedTrxId,
              createdAt: isoDate,
            });
          }

          // 6. Record transactional voucher usage updates
          for (const appliedVoucher of appliedVouchersList) {
            const totalUsageRef = adminDb.collection('voucher_usage').doc(`${appliedVoucher.voucherId}__total`);
            const tSnap = voucherTotalSnapshots.get(appliedVoucher.voucherId);
            const prevTotalBudget = Number(tSnap?.data()?.usedDiscountBudget) || 0;
            const prevTotalOrders = Number(tSnap?.data()?.totalOrders) || 0;

            transaction.set(
              totalUsageRef,
              {
                voucherId: appliedVoucher.voucherId,
                usedDiscountBudget: prevTotalBudget + appliedVoucher.discountAmount,
                totalOrders: prevTotalOrders + 1,
                updatedAt: isoDate,
              },
              { merge: true }
            );

            if (emailKey && verifiedUserEmail) {
              const userUsageRef = adminDb.collection('voucher_usage').doc(`${appliedVoucher.voucherId}__${emailKey}`);
              const uSnap = voucherUserSnapshots.get(appliedVoucher.voucherId);
              const prevUserCount = Number(uSnap?.data()?.usedCount) || 0;
              const prevUserDiscount = Number(uSnap?.data()?.accumulatedDiscount) || 0;

              transaction.set(
                userUsageRef,
                {
                  voucherId: appliedVoucher.voucherId,
                  userEmail: verifiedUserEmail,
                  usedCount: prevUserCount + 1,
                  accumulatedDiscount: prevUserDiscount + appliedVoucher.discountAmount,
                  updatedAt: isoDate,
                },
                { merge: true }
              );
            }
          }
        });

        // Transaction succeeded
        finalOrderId = orderId;
        finalOrderDocument = verifiedOrderDocument;
        break;
      } catch (err: any) {
        if (err?.isDuplicateTrx) {
          return NextResponse.json(
            { success: false, error: 'This Transaction ID has already been used for another order.' },
            { status: 409 }
          );
        }
        if (err?.isCollision) {
          if (attempt === 4) {
            throw err;
          }
          continue;
        }
        throw err;
      }
    }

    revalidateProductsServer();

    // 8. Dispatch Server-Side Order Placed Notifications
    dispatchServerOrderPlacedNotification(finalOrderDocument).catch((err) => {
      console.warn('Background order notification notice:', err);
    });

    return NextResponse.json({
      success: true,
      orderId: finalOrderId,
      total: verifiedTotal,
      order: finalOrderDocument,
    });
  } catch (error: any) {
    console.error('Server order creation error:', error);
    const msg = error?.message || '';
    const isClientError =
      msg.includes('Insufficient stock') ||
      msg.includes('no longer exists.') ||
      Boolean(error?.isClientError);
    const errorText = isClientError ? msg : 'Failed to create order. Please try again.';
    const status = isClientError ? 400 : 500;
    return NextResponse.json(
      { success: false, error: errorText },
      { status }
    );
  }
}
