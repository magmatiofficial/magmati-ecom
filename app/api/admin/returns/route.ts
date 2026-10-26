/**
 * Firestore Composite Index Required:
 * Collection: returns, Fields: status (Ascending), createdAt (Descending), __name__ (Descending)
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdminRequest } from '@/lib/api/adminGuard';
import { RETURN_ID_PATTERN, isReturnStatus } from '@/lib/returns/returnFilters';
import { normalizePhoneQuery } from '@/lib/orders/orderFilters';
import { FieldPath } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  try {
    const guard = await guardAdminRequest(req, {
      rateKeyPrefix: 'admin_returns',
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
    if (statusParam && !isReturnStatus(statusParam)) {
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
        if (
          parsed &&
          typeof parsed.c === 'string' &&
          parsed.c.length <= 40 &&
          typeof parsed.i === 'string' &&
          RETURN_ID_PATTERN.test(parsed.i)
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

    const returnsRef = adminDb.collection('returns');
    let matchedReturns: any[] = [];

    // Handle search query `q` if present
    if (searchQuery) {
      const isPhoneLike = /^[\s\d+-]+$/.test(searchQuery);
      const digitsOnly = normalizePhoneQuery(searchQuery);

      if (RETURN_ID_PATTERN.test(searchQuery)) {
        // Try return document ID first
        const docSnap = await returnsRef.doc(searchQuery).get();
        if (docSnap.exists) {
          matchedReturns.push({ id: docSnap.id, ...docSnap.data() });
        }

        // Also try matching orderId
        const orderIdSnap = await returnsRef.where('orderId', '==', searchQuery).limit(50).get();
        for (const docSnap of orderIdSnap.docs) {
          matchedReturns.push({ id: docSnap.id, ...docSnap.data() });
        }
      }

      if (searchQuery.includes('@')) {
        const emailLower = searchQuery.toLowerCase();
        const emailSnap = await returnsRef.where('email', '==', emailLower).limit(50).get();
        for (const docSnap of emailSnap.docs) {
          matchedReturns.push({ id: docSnap.id, ...docSnap.data() });
        }
      }

      if (isPhoneLike && digitsOnly.length >= 10) {
        const phoneSnap1 = await returnsRef.where('phone', '==', digitsOnly).limit(50).get();
        for (const docSnap of phoneSnap1.docs) {
          matchedReturns.push({ id: docSnap.id, ...docSnap.data() });
        }
        if (/^\d{10}$/.test(digitsOnly) && !digitsOnly.startsWith('0')) {
          const phoneSnap2 = await returnsRef.where('phone', '==', '0' + digitsOnly).limit(50).get();
          for (const docSnap of phoneSnap2.docs) {
            matchedReturns.push({ id: docSnap.id, ...docSnap.data() });
          }
        }
      }

      // De-duplicate by id
      const seenIds = new Set<string>();
      const uniqueReturns: any[] = [];
      for (const r of matchedReturns) {
        if (r && r.id && !seenIds.has(r.id)) {
          seenIds.add(r.id);
          uniqueReturns.push(r);
        }
      }
      matchedReturns = uniqueReturns;

      // Apply status filter in memory if specified
      if (statusParam) {
        matchedReturns = matchedReturns.filter((r) => r.status === statusParam);
      }

      // Sort newest first by createdAt
      matchedReturns.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeB !== timeA) return timeB - timeA;
        return b.id.localeCompare(a.id);
      });

      // Slice to limitNum
      const sliced = matchedReturns.slice(0, limitNum);

      return NextResponse.json(
        {
          success: true,
          returns: sliced,
          nextCursor: null,
          hasMore: false,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    // Normal paginated query (no q)
    let qRef: FirebaseFirestore.Query = returnsRef;

    if (statusParam) {
      qRef = qRef.where('status', '==', statusParam);
    }

    qRef = qRef.orderBy('createdAt', 'desc').orderBy(FieldPath.documentId(), 'desc');

    if (startAfterCreatedAt && startAfterId) {
      qRef = qRef.startAfter(startAfterCreatedAt, startAfterId);
    }

    qRef = qRef.limit(limitNum + 1);

    const snapshot = await qRef.get();
    const docs = snapshot.docs;
    const hasMore = docs.length > limitNum;
    const pageDocs = hasMore ? docs.slice(0, limitNum) : docs;

    const returnsList: any[] = pageDocs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    let nextCursor: string | null = null;
    if (hasMore && pageDocs.length > 0) {
      const lastDoc = pageDocs[pageDocs.length - 1];
      const lastData = lastDoc.data();
      const createdAtVal = lastData.createdAt || '';
      const cursorObj = { c: createdAtVal, i: lastDoc.id };
      nextCursor = Buffer.from(JSON.stringify(cursorObj)).toString('base64url');
    }

    return NextResponse.json(
      {
        success: true,
        returns: returnsList,
        nextCursor,
        hasMore,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    console.error('[AdminReturnsAPI] Error loading returns');
    return NextResponse.json(
      { success: false, error: 'Failed to load returns.' },
      { status: 500 }
    );
  }
}
