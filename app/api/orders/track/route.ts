import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { isPhoneMatching, isValidBDPhone } from '@/lib/phoneUtils';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);
  const isAllowed = rateLimit(`order_track:${clientIp}`, 30, 60 * 1000);
  if (!isAllowed.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const orderId = (searchParams.get('orderId') || searchParams.get('id') || '').trim().toUpperCase();
    const phone = (searchParams.get('phone') || '').trim();

    if (!orderId || !phone || !isValidBDPhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Order ID and complete 11-digit matching phone number are required.' },
        { status: 400 }
      );
    }

    let data: any = null;

    if (adminDb) {
      const orderSnap = await adminDb.collection('orders').doc(orderId).get();
      if (orderSnap.exists) {
        data = orderSnap.data();
      }
    } else if (db) {
      const orderSnap = await getDoc(doc(db, 'orders', orderId));
      if (orderSnap.exists()) {
        data = orderSnap.data();
      }
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'No order found with the provided details.' }, { status: 404 });
    }

    const storedPhone = data.phone || '';

    // Verification check: ensure complete normalized phone equality (no endsWith or partial matching)
    if (!isPhoneMatching(storedPhone, phone)) {
      return NextResponse.json({ success: false, error: 'No order found with the provided details.' }, { status: 404 });
    }

    // Return minimum sanitized tracking fields only (exclude customer address, email, phone, PII)
    const sanitizedTrackingOrder = {
      id: data.id,
      status: data.status,
      date: data.date,
      createdAt: data.createdAt,
      total: data.total,
      payment: data.payment,
      items: Array.isArray(data.items)
        ? data.items.map((item: any) => ({
            product: {
              id: item.product?.id || '',
              name: item.product?.name || 'Product',
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
      courier: data.courier,
      courierBooked: Boolean(data.courierBooked),
      district: data.district,
    };

    return NextResponse.json({
      success: true,
      order: sanitizedTrackingOrder,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to track order.' }, { status: 500 });
  }
}
