import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { verifyAdminServerSide } from '@/lib/serverAuth';
import { getReturnShippingFee } from '@/lib/returnPolicy';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { isPhoneMatching, isValidBDPhone } from '@/lib/phoneUtils';
import { generateNumericId } from '@/lib/numericId';

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const isAllowed = rateLimit(`return_create:${clientIp}`, 5, 60 * 1000);
  if (!isAllowed.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    // 1. Mandatory Service Availability Check
    if (!adminDb || !adminAuth) {
      return NextResponse.json(
        { success: false, error: 'Database or authentication service unavailable.' },
        { status: 500 }
      );
    }

    // 2. Authenticate the caller via Firebase ID Token
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    let callerEmail = '';
    let isAdminUser = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        if (!decoded?.email) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized: Authentication token is missing email identity.' },
            { status: 401 }
          );
        }
        callerEmail = decoded.email.toLowerCase().trim();
        const adminCheck = await verifyAdminServerSide(req);
        isAdminUser = adminCheck.authorized;
      } catch (authErr: any) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Invalid or expired authentication token.' },
          { status: 401 }
        );
      }
    }

    // 3. Parse and validate request payload (explicitly ignoring any client-sent status or admin flags)
    const body = await req.json();
    const {
      orderId: rawOrderId,
      reason,
      detailedReason = '',
      paymentMethod = 'bKash',
      paymentDetails = '',
      items = [],
      images: rawImages,
      phone: rawGuestPhone = '',
    } = body;

    let validatedImages: string[] = [];
    if (rawImages) {
      if (!Array.isArray(rawImages) || rawImages.length > 5) {
        return NextResponse.json({ success: false, error: 'Invalid return images.' }, { status: 400 });
      }
      const uniqueImages = new Set<string>();
      for (const img of rawImages) {
        if (typeof img !== 'string' || img.length > 500 || !img.startsWith('https://')) {
          return NextResponse.json({ success: false, error: 'Invalid return images.' }, { status: 400 });
        }
        try {
          const url = new URL(img);
          if (url.hostname !== 'res.cloudinary.com') {
            throw new Error();
          }
          uniqueImages.add(img.trim());
        } catch (e) {
          return NextResponse.json({ success: false, error: 'Invalid return images.' }, { status: 400 });
        }
      }
      validatedImages = Array.from(uniqueImages);
    }

    const orderId = (rawOrderId || '').trim().toUpperCase();
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required to submit a return request.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one item must be selected for return.' },
        { status: 400 }
      );
    }

    // 4. Load the REAL order document from Firestore
    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json(
        { success: false, error: `Referenced order #${orderId} was not found.` },
        { status: 404 }
      );
    }

    const orderData = orderSnap.data() || {};
    const realOrderOwnerEmail = (orderData.userEmail || '').toLowerCase().trim();

    // 5. Authoritative Order Ownership Check
    const phoneOk = isValidBDPhone(String(rawGuestPhone)) && isPhoneMatching(orderData.phone, String(rawGuestPhone));
    const emailOk = !!callerEmail && !!realOrderOwnerEmail && callerEmail === realOrderOwnerEmail;
    if (!isAdminUser && !emailOk && !phoneOk) {
      return NextResponse.json(
        { success: false, error: 'Order not found. Please double-check your Order ID and Phone Number.' },
        { status: 404 }
      );
    }

    // 6. Check order status eligibility, return window, & verify return items belong to order
    if (orderData.status === 'Cancelled') {
      return NextResponse.json(
        { success: false, error: `Order #${orderId} has been cancelled and cannot be returned.` },
        { status: 400 }
      );
    }

    if (orderData.status !== 'Delivered') {
      return NextResponse.json(
        {
          success: false,
          error: `Return requests are only allowed for delivered orders (current status: ${orderData.status || 'Unknown'}).`,
        },
        { status: 400 }
      );
    }

    let returnWindowDays = 7;
    try {
      const settingsSnap = await adminDb.collection('site_settings').doc('storefront').get();
      if (settingsSnap.exists) {
        const val = settingsSnap.data()?.returnWindowDays;
        if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
          returnWindowDays = val;
        }
      }
    } catch (settingsErr) {
      console.warn('Failed to fetch storefront returnWindowDays, falling back to 7:', settingsErr);
    }

    const orderCreatedAtStr = orderData.createdAt || orderData.date;
    if (orderCreatedAtStr) {
      const orderDate = new Date(orderCreatedAtStr);
      if (!isNaN(orderDate.getTime())) {
        const now = new Date();
        const diffMs = now.getTime() - orderDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays > returnWindowDays) {
          return NextResponse.json(
            { success: false, error: `Return window of ${returnWindowDays} days has expired for order #${orderId}.` },
            { status: 400 }
          );
        }
      }
    }

    const orderItems = Array.isArray(orderData.items) ? orderData.items : [];
    
    // Query authoritative existing returns for this order to prevent duplicate/over-returns while supporting partial returns
    const existingReturnsSnap = await adminDb.collection('returns').where('orderId', '==', orderId).get();
    const returnedQuantities: Record<string, number> = {};
    existingReturnsSnap.forEach((doc) => {
      const retData = doc.data();
      if (retData.status !== 'Rejected' && Array.isArray(retData.items)) {
        retData.items.forEach((ri: any) => {
          const rProdId = ri.product?.id || ri.productId;
          const rQty = Number(ri.quantity) || 1;
          if (rProdId) {
            returnedQuantities[rProdId] = (returnedQuantities[rProdId] || 0) + rQty;
          }
        });
      }
    });

    for (const returnItem of items) {
      const returnProductId = returnItem.product?.id || returnItem.productId;
      const matchedOrderItem = orderItems.find((oi: any) => {
        const oiProdId = oi.product?.id || oi.productId;
        return oiProdId === returnProductId;
      });
      if (!matchedOrderItem) {
        return NextResponse.json(
          { success: false, error: `One or more selected items do not belong to order #${orderId}.` },
          { status: 400 }
        );
      }

      const orderedQty = Number(matchedOrderItem.quantity) || 1;
      const alreadyReturnedQty = returnedQuantities[returnProductId] || 0;
      const requestedQty = Number(returnItem.quantity) || 1;

      if (alreadyReturnedQty + requestedQty > orderedQty) {
        const remainingQty = Math.max(0, orderedQty - alreadyReturnedQty);
        return NextResponse.json(
          { success: false, error: `Cannot return ${requestedQty} units. Only ${remainingQty} units remaining eligible for return for this item.` },
          { status: 400 }
        );
      }
    }

    // 7. Authoritatively Calculate Refund Amount Server-Side (Preventing Client Manipulation)
    let authoritativeRefundSubtotal = 0;
    const verifiedReturnItems = [];
    for (const returnItem of items) {
      const returnProductId = returnItem.product?.id || returnItem.productId;
      const matchedOrderItem = orderItems.find((oi: any) => {
        const oiProdId = oi.product?.id || oi.productId;
        return oiProdId === returnProductId;
      });
      const authoritativeUnitPrice = Number(matchedOrderItem.customPrice ?? matchedOrderItem.product?.price ?? matchedOrderItem.price) || 0;
      const requestedQty = Math.max(1, Math.floor(Number(returnItem.quantity) || 1));

      authoritativeRefundSubtotal += authoritativeUnitPrice * requestedQty;
      verifiedReturnItems.push({
        product: {
          id: returnProductId,
          name: matchedOrderItem.product?.name || matchedOrderItem.name || 'Product',
          price: authoritativeUnitPrice,
          image: matchedOrderItem.product?.image || matchedOrderItem.image || '',
        },
        quantity: requestedQty,
        selectedSize: returnItem.selectedSize || matchedOrderItem.selectedSize || 'Standard',
        selectedColor: returnItem.selectedColor || matchedOrderItem.selectedColor || { name: 'Standard', hex: '#000000' },
        itemRefundTotal: authoritativeUnitPrice * requestedQty,
      });
    }

    // Calculate potential shipping deduction authoritatively
    const potentialShippingDeduction = getReturnShippingFee(orderData);

    const isMindChange = (reason || '').includes('Changed My Mind');
    const shippingReview = isMindChange ? 'applied' : 'pending';
    const shippingDeduction = shippingReview === 'applied' ? potentialShippingDeduction : 0;

    const authoritativeRefundTotal = Math.max(0, authoritativeRefundSubtotal - shippingDeduction);

    const returnId = generateNumericId(10);
    const isoDate = new Date().toISOString();

    const returnDocument = {
      id: returnId,
      orderId: orderId,
      email: realOrderOwnerEmail, // Derived authoritatively from real order document
      phone: orderData.phone || '', // Derived authoritatively from real order document
      customerName: orderData.userName || '',
      reason: reason || 'Return Request',
      detailedReason: detailedReason.trim(),
      paymentMethod,
      paymentDetails: paymentDetails.trim(),
      items: verifiedReturnItems,
      images: validatedImages,
      refundSubtotal: authoritativeRefundSubtotal,
      potentialShippingDeduction,
      shippingReview,
      shippingDeduction,
      refundTotal: authoritativeRefundTotal,
      status: 'Pending',
      createdAt: isoDate,
    };

    // create() fails if the ID already exists, so a rare collision never overwrites another return.
    let returnDoc = returnDocument;
    for (let attempt = 0; ; attempt++) {
      try {
        await adminDb.collection('returns').doc(returnDoc.id).create(returnDoc);
        break;
      } catch (err: any) {
        const alreadyExists = err?.code === 6 || /already exists/i.test(String(err?.message || ''));
        if (!alreadyExists || attempt >= 2) throw err;
        returnDoc = { ...returnDoc, id: generateNumericId(10) };
      }
    }

    return NextResponse.json({
      success: true,
      returnId: returnDoc.id,
      returnRequest: returnDoc,
    });
  } catch (error: any) {
    console.error('Return request creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit return request.' },
      { status: 500 }
    );
  }
}
