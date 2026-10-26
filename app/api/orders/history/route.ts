// Firestore Composite Index Required: Collection orders, Fields: userEmail (Ascending), createdAt (Descending), __name__ (Descending)

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { FieldPath } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Missing authentication token.' },
        { status: 401 }
      );
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable.' },
        { status: 500 }
      );
    }

    const token = authHeader.substring(7).trim();
    let decoded: any = null;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch (verifyErr: any) {
      console.error('[OrderHistoryAPI] Token verification failed:', verifyErr?.message || verifyErr);
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or expired authentication token.' },
        { status: 401 }
      );
    }

    if (!decoded || !decoded.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid authentication token.' },
        { status: 401 }
      );
    }

    const email = decoded.email.toLowerCase().trim();

    const { searchParams } = new URL(req.url);

    // Parse limit (1-50, default 50)
    let limitNum = 50;
    const limitParam = searchParams.get('limit');
    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 50) {
        return NextResponse.json({ success: false, error: 'Invalid query.' }, { status: 400 });
      }
      limitNum = parsed;
    }

    // Parse cursor
    let startAfterCreatedAt: string | null = null;
    let startAfterId: string | null = null;
    const cursorParam = searchParams.get('cursor');
    if (cursorParam) {
      try {
        const decodedStr = Buffer.from(cursorParam, 'base64url').toString('utf8');
        const parsed = JSON.parse(decodedStr);
        if (
          parsed &&
          typeof parsed.c === 'string' &&
          parsed.c.length <= 40 &&
          typeof parsed.i === 'string' &&
          /^[A-Za-z0-9_-]{1,40}$/.test(parsed.i)
        ) {
          startAfterCreatedAt = parsed.c;
          startAfterId = parsed.i;
        } else {
          return NextResponse.json({ success: false, error: 'Invalid query.' }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ success: false, error: 'Invalid query.' }, { status: 400 });
      }
    }

    // Query orders for this user email securely with pagination and ordering
    let userOrders: any[] = [];
    let nextCursor: string | null = null;
    let hasMore = false;

    try {
      let query: FirebaseFirestore.Query = adminDb.collection('orders')
        .where('userEmail', '==', email)
        .orderBy('createdAt', 'desc')
        .orderBy(FieldPath.documentId(), 'desc');

      if (startAfterCreatedAt !== null && startAfterId !== null) {
        query = query.startAfter(startAfterCreatedAt, startAfterId);
      }

      query = query.limit(limitNum + 1);

      const ordersSnap = await query.get();
      const docs = ordersSnap.docs;
      hasMore = docs.length > limitNum;
      if (hasMore) {
        docs.pop();
      }

      userOrders = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

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
    } catch (dbErr: any) {
      console.error('[OrderHistoryAPI] Firestore query failed:', dbErr?.message || dbErr);
      return NextResponse.json(
        { success: false, error: 'Failed to load orders.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        orders: userOrders,
        nextCursor,
        hasMore,
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch (error: any) {
    console.error(`[OrderHistoryAPI] Fetch error for user token query: ${error?.code || error?.message || error}`);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch order history.' },
      { status: 500 }
    );
  }
}
