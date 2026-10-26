import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json(
        { success: false, error: 'Server database is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const token = authHeader.substring(7).trim();
    let decoded: any = null;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch (verifyErr: any) {
      console.error('[MyVoucherUsageAPI] Token verification failed:', verifyErr?.message || verifyErr);
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!decoded || !decoded.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const email = decoded.email.toLowerCase().trim();

    const usageSnap = await adminDb
      .collection('voucher_usage')
      .where('userEmail', '==', email)
      .get();

    const usage: Record<string, { usedCount: number; accumulatedDiscount: number }> = {};

    usageSnap.forEach((doc) => {
      const data = doc.data();
      const voucherId = data.voucherId || doc.id.split('__')[0];
      if (voucherId) {
        usage[voucherId] = {
          usedCount: Number(data.usedCount) || 0,
          accumulatedDiscount: Number(data.accumulatedDiscount) || 0,
        };
      }
    });

    return NextResponse.json({
      success: true,
      usage,
    });
  } catch (error: any) {
    console.error('[MyVoucherUsageAPI] Fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch voucher usage.' },
      { status: 500 }
    );
  }
}
