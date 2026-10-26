/**
 * Firestore Composite Indexes Required:
 * 1. Collection: orders
 *    Fields: status (Ascending), createdAt (Descending), __name__ (Descending)
 * 2. Collection: orders
 *    Fields: paymentStatus (Ascending), createdAt (Descending), __name__ (Descending)
 * 3. Collection: orders
 *    Fields: status (Ascending), paymentStatus (Ascending), createdAt (Descending), __name__ (Descending)
 * 4. Collection: orders
 *    Fields: status (In), createdAt (Descending), __name__ (Descending)
 * 5. Collection: orders, Fields: paymentStatus (Ascending), status (In), createdAt (Descending), __name__ (Descending) (used when status=Shipped is combined with a paymentStatus filter)
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdminRequest } from '@/lib/api/adminGuard';
import { isOrderStatus, isPaymentStatus, statusFilterValues, matchesStatusFilter, normalizePhoneQuery } from '@/lib/orders/orderFilters';
import { FieldPath } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  try {
    const guard = await guardAdminRequest(req, {
      rateKeyPrefix: 'admin_orders',
      limit: 120,
      windowMs: 60000,
    });
    if (!guard.ok) {
      return guard.response;
    }
    const adminDb = guard.db;

    const { searchParams } = new URL(req.url);

    // Parse limit (1-50, default 25)
    let limitNum = 25;
    const limitParam = searchParams.get('limit');
    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 50) {
        return NextResponse.json({ success: false, error: 'Invalid query.' }, { status: 400 });
      }
      limitNum = parsed;
    }

    // Parse status
    const statusParam = searchParams.get('status');
    if (statusParam && !isOrderStatus(statusParam)) {
      return NextResponse.json({ success: false, error: 'Invalid query.' }, { status: 400 });
    }

    // Parse paymentStatus
    const paymentStatusParam = searchParams.get('paymentStatus');
    if (paymentStatusParam && !isPaymentStatus(paymentStatusParam)) {
      return NextResponse.json({ success: false, error: 'Invalid query.' }, { status: 400 });
    }

    // Parse q (search query, max 40 chars)
    const qParam = searchParams.get('q');
    let searchQuery = '';
    if (qParam !== null) {
      searchQuery = qParam.trim();
      if (searchQuery.length > 40) {
        return NextResponse.json({ success: false, error: 'Invalid query.' }, { status: 400 });
      }
    }

    // Parse cursor
    let startAfterCreatedAt: string | null = null;
    let startAfterId: string | null = null;
    const cursorParam = searchParams.get('cursor');
    if (cursorParam) {
      try {
        const decodedStr = Buffer.from(cursorParam, 'base64url').toString('utf8');
        const parsed = JSON.parse(decodedStr);
        if (parsed && typeof parsed.c === 'string' && parsed.c.length <= 40 && typeof parsed.i === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(parsed.i)) {
          startAfterCreatedAt = parsed.c;
          startAfterId = parsed.i;
        } else {
          return NextResponse.json({ success: false, error: 'Invalid query.' }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ success: false, error: 'Invalid query.' }, { status: 400 });
      }
    }

    const ordersRef = adminDb.collection('orders');
    let matchedOrders: any[] = [];

    // Handle search query `q` if present
    if (searchQuery) {
      const isPhoneLike = /^[\s\d+-]+$/.test(searchQuery);
      const digitsOnly = normalizePhoneQuery(searchQuery);

      if (/^\d{10}$/.test(searchQuery)) {
        // Try order document ID first
        const docSnap = await ordersRef.doc(searchQuery).get();
        if (docSnap.exists) {
          matchedOrders.push({ id: docSnap.id, ...docSnap.data() });
        } else if (isPhoneLike && /^\d{10,13}$/.test(digitsOnly)) {
          // Fall through to phone search if doc does not exist
          const snap = await ordersRef.where('phone', '==', digitsOnly).get();
          snap.forEach((doc) => {
            matchedOrders.push({ id: doc.id, ...doc.data() });
          });
          if (matchedOrders.length === 0 && !digitsOnly.startsWith('0') && digitsOnly.length === 10) {
            const snap2 = await ordersRef.where('phone', '==', '0' + digitsOnly).get();
            snap2.forEach((doc) => {
              matchedOrders.push({ id: doc.id, ...doc.data() });
            });
          }
        }
      } else if (isPhoneLike && /^\d{10,13}$/.test(digitsOnly)) {
        // Phone search
        const snap = await ordersRef.where('phone', '==', digitsOnly).get();
        snap.forEach((doc) => {
          matchedOrders.push({ id: doc.id, ...doc.data() });
        });
        if (matchedOrders.length === 0 && !digitsOnly.startsWith('0') && digitsOnly.length === 10) {
          const snap2 = await ordersRef.where('phone', '==', '0' + digitsOnly).get();
          snap2.forEach((doc) => {
            matchedOrders.push({ id: doc.id, ...doc.data() });
          });
        }
      } else if (/^[A-Za-z0-9]{8,14}$/.test(searchQuery)) {
        // Query by trxId
        const snap = await ordersRef.where('trxId', '==', searchQuery.toUpperCase()).get();
        snap.forEach((doc) => {
          matchedOrders.push({ id: doc.id, ...doc.data() });
        });
      }

      // Apply status and paymentStatus filters in memory for search results
      if (statusParam) {
        matchedOrders = matchedOrders.filter((o) => matchesStatusFilter(o.status, statusParam));
      }
      if (paymentStatusParam) {
        matchedOrders = matchedOrders.filter((o) => o.paymentStatus === paymentStatusParam);
      }

      // Sort newest first
      matchedOrders.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      // Apply limit
      const limitedOrders = matchedOrders.slice(0, limitNum);

      return NextResponse.json(
        {
          success: true,
          orders: limitedOrders,
          nextCursor: null,
          hasMore: false,
        },
        {
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    // Normal Paginated Listing
    let query: FirebaseFirestore.Query = ordersRef;

    if (statusParam) {
      const statusValues = statusFilterValues(statusParam);
      if (statusValues.length > 1) {
        query = query.where('status', 'in', statusValues);
      } else {
        query = query.where('status', '==', statusValues[0]);
      }
    }

    if (paymentStatusParam) {
      query = query.where('paymentStatus', '==', paymentStatusParam);
    }

    query = query.orderBy('createdAt', 'desc').orderBy(FieldPath.documentId(), 'desc');

    if (startAfterCreatedAt !== null && startAfterId !== null) {
      query = query.startAfter(startAfterCreatedAt, startAfterId);
    }

    query = query.limit(limitNum + 1);

    const snapshot = await query.get();
    const docs = snapshot.docs;
    const hasMore = docs.length > limitNum;
    if (hasMore) {
      docs.pop();
    }

    const orders: any[] = docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    let nextCursor: string | null = null;
    if (hasMore && docs.length > 0) {
      const lastDoc = docs[docs.length - 1];
      const lastData = lastDoc.data();
      nextCursor = Buffer.from(
        JSON.stringify({
          c: lastData.createdAt || '',
          i: lastDoc.id,
        })
      ).toString('base64url');
    }

    return NextResponse.json(
      {
        success: true,
        orders,
        nextCursor,
        hasMore,
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch {
    console.error('[AdminOrdersAPI] Error loading orders');
    return NextResponse.json(
      { success: false, error: 'Failed to load orders.' },
      { status: 500 }
    );
  }
}
