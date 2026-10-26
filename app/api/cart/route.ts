import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth, isAdminDbReady } from '@/lib/firebaseAdmin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

interface CartItem {
  productId: string;
  selectedSize: string;
  colorName: string;
  colorHex: string;
  quantity: number;
  selected: boolean;
  claimedB1G1: boolean;
  isComboItem: boolean;
  comboId?: string;
  promoLabel?: string;
}

export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);
  const limit = rateLimit(`cart:${clientIp}`, 120, 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }

  if (!isAdminDbReady || !adminDb || !adminAuth) {
    return NextResponse.json({ success: false, error: 'Server database is not configured.' }, { status: 503 });
  }

  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Please log in to use your cart.' }, { status: 401 });
  }
  const token = authHeader.substring(7).trim();
  if (!token) {
    return NextResponse.json({ success: false, error: 'Please log in to use your cart.' }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch {
    return NextResponse.json({ success: false, error: 'Please log in to use your cart.' }, { status: 401 });
  }

  try {
    const cartDoc = await adminDb.collection('carts').doc(decodedToken.uid).get();
    const data = cartDoc.data();
    return NextResponse.json({ 
      success: true, 
      items: data?.items || [], 
      removedFreeKeys: data?.removedFreeKeys || [] 
    });
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process cart. Please try again.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const clientIp = getClientIp(req);
  const limit = rateLimit(`cart:${clientIp}`, 120, 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }

  if (!isAdminDbReady || !adminDb || !adminAuth) {
    return NextResponse.json({ success: false, error: 'Server database is not configured.' }, { status: 503 });
  }

  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Please log in to use your cart.' }, { status: 401 });
  }
  const token = authHeader.substring(7).trim();
  if (!token) {
    return NextResponse.json({ success: false, error: 'Please log in to use your cart.' }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch {
    return NextResponse.json({ success: false, error: 'Please log in to use your cart.' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid cart data.' }, { status: 400 });
  }
  
  const items = body?.items;
  const removedFreeKeysInput = body?.removedFreeKeys;

  if (!Array.isArray(items) || items.length > 50) {
    return NextResponse.json({ success: false, error: 'Invalid cart data.' }, { status: 400 });
  }

  const rawRemovedKeys = Array.isArray(removedFreeKeysInput) ? removedFreeKeysInput : [];
  if (rawRemovedKeys.length > 50) {
    return NextResponse.json({ success: false, error: 'Invalid cart data.' }, { status: 400 });
  }

  const sanitizedItems: CartItem[] = [];
  for (const rawItem of items) {
    if (rawItem === null || typeof rawItem !== 'object' || Array.isArray(rawItem)) {
      return NextResponse.json({ success: false, error: 'Invalid cart data.' }, { status: 400 });
    }
    const item = rawItem as Record<string, unknown>;

    if (item.isFreeItem) continue;
    
    if (typeof item.productId !== 'string' || item.productId.trim().length === 0 || item.productId.trim().length > 100) {
      return NextResponse.json({ success: false, error: 'Invalid cart data.' }, { status: 400 });
    }

    const isComboItem = typeof item.isComboItem === 'boolean' ? item.isComboItem : false;
    const comboIdStr = typeof item.comboId === 'string' ? item.comboId.trim() : '';

    const cartItem: CartItem = {
      productId: item.productId.trim(),
      selectedSize: typeof item.selectedSize === 'string' && item.selectedSize.length <= 50 ? item.selectedSize : 'Standard',
      colorName: typeof item.colorName === 'string' && item.colorName.length <= 50 ? item.colorName : 'Standard',
      colorHex: typeof item.colorHex === 'string' && item.colorHex.length <= 20 ? item.colorHex : '#000000',
      quantity: typeof item.quantity === 'number' ? Math.max(1, Math.min(99, Math.floor(item.quantity))) : 1,
      selected: typeof item.selected === 'boolean' ? item.selected : true,
      claimedB1G1: typeof item.claimedB1G1 === 'boolean' ? item.claimedB1G1 : false,
      isComboItem,
    };

    if (isComboItem && comboIdStr.length > 0 && comboIdStr.length <= 100) {
      cartItem.comboId = comboIdStr;
      if (typeof item.promoLabel === 'string' && item.promoLabel.length <= 100) {
        cartItem.promoLabel = item.promoLabel;
      }
    }

    sanitizedItems.push(cartItem);
  }

  const sanitizedRemovedFreeKeys = [...new Set(rawRemovedKeys
    .filter((key: unknown): key is string => typeof key === 'string')
    .map((key: string) => key.trim())
    .filter((key: string) => key.length >= 1 && key.length <= 100)
  )].slice(0, 50);

  try {
    await adminDb.collection('carts').doc(decodedToken.uid).set({
      items: sanitizedItems,
      removedFreeKeys: sanitizedRemovedFreeKeys,
      userEmail: (decodedToken.email || '').toLowerCase(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, items: sanitizedItems, removedFreeKeys: sanitizedRemovedFreeKeys });
  } catch (error) {
    console.error('Cart PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process cart. Please try again.' }, { status: 500 });
  }
}
