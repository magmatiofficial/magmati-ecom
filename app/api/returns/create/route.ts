import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { verifyAdminServerSide } from '@/lib/serverAuth';
import { getReturnShippingFee } from '@/lib/returnPolicy';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You must be logged in to submit a return request.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    let callerEmail = '';
    let isAdminUser = false;

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

    // 3. Parse and validate request payload (explicitly ignoring any client-sent status or admin flags)
    const body = await req.json();
    const {
      orderId: rawOrderId,
      reason,
      detailedReason = '',
      paymentMethod = 'bKash',
      paymentDetails = '',
      items = [],
      images = [],
    } = body;

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
    // The authenticated user MUST own the real order document (or be an admin)
    if (!isAdminUser && callerEmail !== realOrderOwnerEmail) {
      return NextResponse.json(
        {
          success: false,
          error: `Forbidden: You do not own order #${orderId} and cannot submit a return request for it.`,
        },
        { status: 403 }
      );
    }

    // 6. Check order status eligibility, return window, & verify return items belong to order
    if (orderData.status === 'Cancelled') {
      return NextResponse.json(
        { success: false, error: `Order #${orderId} has been cancelled and cannot be returned.` },
        { status: 400 }
      );
    }

    const orderCreatedAtStr = orderData.createdAt || orderData.date;
    if (orderCreatedAtStr) {
      const orderDate = new Date(orderCreatedAtStr);
      if (!isNaN(orderDate.getTime())) {
        const now = new Date();
        const diffMs = now.getTime() - orderDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        const RETURN_WINDOW_DAYS = 7;
        if (diffDays > RETURN_WINDOW_DAYS) {
          return NextResponse.json(
            { success: false, error: `Return window of ${RETURN_WINDOW_DAYS} days has expired for order #${orderId}.` },
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

    const returnId = `RET-${Math.floor(100000 + Math.random() * 900000)}`;
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
      images: Array.isArray(images) ? images : [],
      refundSubtotal: authoritativeRefundSubtotal,
      potentialShippingDeduction,
      shippingReview,
      shippingDeduction,
      refundTotal: authoritativeRefundTotal,
      status: 'Pending',
      createdAt: isoDate,
    };

    // 8. Commit return document to Firestore
    await adminDb.collection('returns').doc(returnId).set(returnDocument);

    return NextResponse.json({
      success: true,
      returnId,
      returnRequest: returnDocument,
    });
  } catch (error: any) {
    console.error('Return request creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit return request.' },
      { status: 500 }
    );
  }
}
