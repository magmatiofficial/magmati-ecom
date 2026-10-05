import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';

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

    // Query orders for this user email securely
    let userOrders: any[] = [];
    try {
      const ordersSnap = await adminDb.collection('orders')
        .where('userEmail', '==', email)
        .get();

      ordersSnap.forEach((doc) => {
        userOrders.push({
          id: doc.id,
          ...doc.data()
        });
      });
    } catch (dbErr: any) {
      console.warn('Firestore orders query notice:', dbErr?.message || dbErr);
    }

    // Sort newest first by createdAt timestamp
    userOrders.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return NextResponse.json({
      success: true,
      orders: userOrders,
    });
  } catch (error: any) {
    console.error(`[OrderHistoryAPI] Fetch error for user token query: ${error?.code || error?.message || error}`);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch order history.' },
      { status: 500 }
    );
  }
}
