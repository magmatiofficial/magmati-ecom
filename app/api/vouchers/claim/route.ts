import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

async function authenticate(req: NextRequest): Promise<{ email?: string; errorResponse?: NextResponse }> {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { errorResponse: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!adminAuth || !adminDb) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Server database is not configured. Please contact support.' },
        { status: 503 }
      ),
    };
  }

  const token = authHeader.substring(7).trim();
  let decoded: any = null;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch (verifyErr) {
    console.error('[VoucherClaimAPI] Token verification failed:', verifyErr);
    return { errorResponse: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  }

  if (!decoded || !decoded.email) {
    return { errorResponse: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  }

  return { email: decoded.email.toLowerCase().trim() };
}

export async function GET(req: NextRequest) {
  try {
    const { email, errorResponse } = await authenticate(req);
    if (errorResponse || !email) return errorResponse!;

    const claimDoc = await adminDb!.collection('voucher_claims').doc(email).get();
    const codes: string[] = claimDoc.exists && Array.isArray(claimDoc.data()?.codes)
      ? claimDoc.data()!.codes
      : [];

    return NextResponse.json({ success: true, codes });
  } catch (error) {
    console.error('[VoucherClaimAPI] Fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process voucher claim.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, errorResponse } = await authenticate(req);
    if (errorResponse || !email) return errorResponse!;

    let body: any = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, message: 'Voucher not found', error: 'Voucher not found' }, { status: 400 });
    }

    const codeUpper = String(body?.code || '').trim().toUpperCase();
    if (!codeUpper) {
      return NextResponse.json({ success: false, message: 'Voucher not found', error: 'Voucher not found' }, { status: 400 });
    }

    let voucherDoc: FirebaseFirestore.DocumentSnapshot | null = null;
    const qSnap = await adminDb!.collection('vouchers').where('code', '==', codeUpper).limit(1).get();
    if (!qSnap.empty) {
      voucherDoc = qSnap.docs[0];
    } else {
      const docSnap = await adminDb!.collection('vouchers').doc(codeUpper).get();
      if (docSnap.exists) {
        voucherDoc = docSnap;
      } else if (body?.code && String(body.code).trim() !== codeUpper) {
        const rawDocSnap = await adminDb!.collection('vouchers').doc(String(body.code).trim()).get();
        if (rawDocSnap.exists) voucherDoc = rawDocSnap;
      }
    }

    const claimDocRef = adminDb!.collection('voucher_claims').doc(email);
    const claimDoc = await claimDocRef.get();
    const currentCodes: string[] = claimDoc.exists && Array.isArray(claimDoc.data()?.codes)
      ? claimDoc.data()!.codes
      : [];

    if (!voucherDoc || !voucherDoc.exists) {
      return NextResponse.json({ success: false, message: 'Voucher not found', codes: currentCodes });
    }

    const voucherData = voucherDoc.data() || {};
    const voucherId = voucherDoc.id;
    const voucherCode = voucherData.code || codeUpper;

    if (!voucherData.isActive) {
      return NextResponse.json({ success: false, message: 'This voucher is currently inactive', codes: currentCodes });
    }

    if (voucherData.expiresAt) {
      const expiryStr = String(voucherData.expiresAt).includes('T')
        ? String(voucherData.expiresAt)
        : `${voucherData.expiresAt}T23:59:59.999+06:00`;
      const expiryDate = new Date(expiryStr);
      if (!isNaN(expiryDate.getTime()) && Date.now() > expiryDate.getTime()) {
        return NextResponse.json({ success: false, message: 'This voucher has expired.', codes: currentCodes });
      }
    }

    if (voucherData.totalDiscountBudget && voucherData.totalDiscountBudget > 0) {
      const totalSnap = await adminDb!.collection('voucher_usage').doc(`${voucherId}__total`).get();
      const usedBudget = Number(totalSnap.data()?.usedDiscountBudget) || 0;
      if (usedBudget >= voucherData.totalDiscountBudget) {
        return NextResponse.json({ success: false, message: 'Voucher overall campaign discount limit has been reached.', codes: currentCodes });
      }
    }

    if (voucherData.maxUsesPerCustomer || voucherData.maxDiscountSpendPerUser) {
      const userUsageSnap = await adminDb!.collection('voucher_usage').doc(`${voucherId}__${email}`).get();
      const userUsageData = userUsageSnap.data() || {};
      const usedCount = Number(userUsageData.usedCount) || 0;
      const accumulatedDiscount = Number(userUsageData.accumulatedDiscount) || 0;

      if (voucherData.maxUsesPerCustomer && usedCount >= voucherData.maxUsesPerCustomer) {
        return NextResponse.json({
          success: false,
          message: `You have reached the maximum use limit of (${voucherData.maxUsesPerCustomer}) for this voucher.`,
          codes: currentCodes,
        });
      }

      if (voucherData.maxDiscountSpendPerUser && accumulatedDiscount >= voucherData.maxDiscountSpendPerUser) {
        return NextResponse.json({
          success: false,
          message: `You have reached the maximum accumulated discount limit of ৳${voucherData.maxDiscountSpendPerUser} for this voucher.`,
          codes: currentCodes,
        });
      }
    }

    const isAlreadyInCodes = currentCodes.some((c) => c.toUpperCase() === voucherCode.toUpperCase());
    if (isAlreadyInCodes) {
      return NextResponse.json({ success: true, message: `Voucher "${voucherCode}" already in your account & copied!`, codes: currentCodes });
    }

    const updatedCodes = Array.from(new Set([...currentCodes, voucherCode]));
    await claimDocRef.set({ email, codes: updatedCodes, updatedAt: new Date().toISOString() }, { merge: true });

    return NextResponse.json({ success: true, message: `Voucher "${voucherCode}" successfully added to your account!`, codes: updatedCodes });
  } catch (error) {
    console.error('[VoucherClaimAPI] Claim error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process voucher claim.' }, { status: 500 });
  }
}