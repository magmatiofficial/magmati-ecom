import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isPhoneMatching, isValidBDPhone } from '@/lib/phoneUtils';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const isAllowed = rateLimit(`return_lookup:${clientIp}`, 15, 60 * 1000);
  if (!isAllowed.ok) {
    return NextResponse.json(
      { success: false, error: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const orderId = String(body?.orderId || '').trim();
    const phone = String(body?.phone || '').trim();

    if (!orderId || !/^\d{6,15}$/.test(orderId) || !phone || !isValidBDPhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Order ID and a valid 11-digit phone number are required.' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: 'Service unavailable.' },
        { status: 500 }
      );
    }

    const orderSnap = await adminDb.collection('orders').doc(orderId).get();

    if (!orderSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Order not found. Please double-check your Order ID and Phone Number.' },
        { status: 404 }
      );
    }

    const data = orderSnap.data() || {};

    if (!isPhoneMatching(data.phone, phone)) {
      return NextResponse.json(
        { success: false, error: 'Order not found. Please double-check your Order ID and Phone Number.' },
        { status: 404 }
      );
    }

    const sanitizedOrder = {
      id: data.id || orderSnap.id,
      status: data.status,
      date: data.date,
      createdAt: data.createdAt,
      deliveryFee: data.deliveryFee,
      district: data.district,
      total: data.total,
      userName: data.userName,
      phone,
      items: Array.isArray(data.items)
        ? data.items.map((item: any) => ({
            product: {
              id: item.product?.id || '',
              name: item.product?.name || 'Product',
              price: Number(item.product?.price) || 0,
              image: item.product?.image || item.product?.images?.[0] || '',
            },
            quantity: item.quantity || 1,
            selectedSize: item.selectedSize || 'Standard',
            selectedColor: item.selectedColor || { name: 'Standard', hex: '#000000' },
            customPrice: item.customPrice,
            isFreeItem: Boolean(item.isFreeItem),
            isComboItem: Boolean(item.isComboItem),
          }))
        : [],
    };

    return NextResponse.json({
      success: true,
      order: sanitizedOrder,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Lookup failed.' },
      { status: 500 }
    );
  }
}
