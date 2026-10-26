import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth, isAdminDbReady } from '@/lib/firebaseAdmin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);
  const limit = rateLimit(`wishlist:${clientIp}`, 60, 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }

  if (!isAdminDbReady || !adminDb || !adminAuth) {
    return NextResponse.json({ success: false, error: 'Server database is not configured.' }, { status: 503 });
  }

  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Please log in to use your wishlist.' }, { status: 401 });
  }
  const token = authHeader.substring(7).trim();
  if (!token) {
    return NextResponse.json({ success: false, error: 'Please log in to use your wishlist.' }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch {
    return NextResponse.json({ success: false, error: 'Please log in to use your wishlist.' }, { status: 401 });
  }

  try {
    const wishlistDoc = await adminDb.collection('wishlists').doc(decodedToken.uid).get();
    const data = wishlistDoc.data();
    return NextResponse.json({ success: true, productIds: data?.productIds || [] });
  } catch (error) {
    console.error('Wishlist GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process wishlist. Please try again.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const clientIp = getClientIp(req);
  const limit = rateLimit(`wishlist:${clientIp}`, 60, 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }

  if (!isAdminDbReady || !adminDb || !adminAuth) {
    return NextResponse.json({ success: false, error: 'Server database is not configured.' }, { status: 503 });
  }

  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Please log in to use your wishlist.' }, { status: 401 });
  }
  const token = authHeader.substring(7).trim();
  if (!token) {
    return NextResponse.json({ success: false, error: 'Please log in to use your wishlist.' }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch {
    return NextResponse.json({ success: false, error: 'Please log in to use your wishlist.' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid wishlist data.' }, { status: 400 });
  }
  const { productIds } = body;

  if (!Array.isArray(productIds)) {
    return NextResponse.json({ success: false, error: 'Invalid wishlist data.' }, { status: 400 });
  }

  let validProductIds = (productIds as unknown[] || [])
    .filter((id): id is string => typeof id === 'string')
    .map((id: string) => id.trim())
    .filter((id: string) => id.length > 0 && id.length <= 100);

  validProductIds = [...new Set(validProductIds)];

  if (validProductIds.length > 200) {
    return NextResponse.json({ success: false, error: 'Invalid wishlist data.' }, { status: 400 });
  }

  try {
    await adminDb.collection('wishlists').doc(decodedToken.uid).set({
      productIds: validProductIds,
      userEmail: (decodedToken.email || '').toLowerCase(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, productIds: validProductIds });
  } catch (error) {
    console.error('Wishlist PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process wishlist. Please try again.' }, { status: 500 });
  }
}
