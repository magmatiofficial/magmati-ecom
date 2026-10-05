import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { verifyAdminServerSide } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await verifyAdminServerSide(req);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || 'Unauthorized: Admin privileges required.' },
        { status: authCheck.status || 401 }
      );
    }

    if (!db) {
      return NextResponse.json({ success: false, message: 'Database not initialized' }, { status: 500 });
    }

    const docRef = doc(db, 'site_settings', 'notification_gateway');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return NextResponse.json({ success: true, settings: docSnap.data(), source: 'firestore' });
    }

    // Default fallback from environment
    const defaultData = {
      smsEnabled: process.env.SMS_ENABLED === 'true',
      smsProvider: process.env.SMS_PROVIDER || 'greenweb',
      smsApiKey: process.env.SMS_API_KEY || '',
      smsSenderId: process.env.SMS_SENDER_ID || 'MAGMATI',
      smsClientId: process.env.SMS_CLIENT_ID || '',
      smsCustomEndpoint: process.env.SMS_CUSTOM_ENDPOINT || '',
      smsOnOrderPlaced: true,
      smsOnStatusChange: true,
      smsOnOtp: true,

      emailEnabled: process.env.EMAIL_ENABLED === 'true',
      emailProvider: process.env.EMAIL_PROVIDER || 'resend',
      emailApiKey: process.env.EMAIL_API_KEY || '',
      emailFromAddress: process.env.EMAIL_FROM_ADDRESS || 'orders@magmati.com',
      emailFromName: process.env.EMAIL_FROM_NAME || 'MAGMATI Lifestyle',
      adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || '',
      emailOnOrderPlaced: true,
      emailOnStatusChange: true,
      emailOnPasswordReset: true,
    };

    return NextResponse.json({ success: true, settings: defaultData, source: 'default' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await verifyAdminServerSide(req);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || 'Unauthorized: Admin privileges required.' },
        { status: authCheck.status || 401 }
      );
    }

    const body = await req.json();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database not initialized' }, { status: 500 });
    }

    const docRef = doc(db, 'site_settings', 'notification_gateway');
    await setDoc(
      docRef,
      {
        ...body,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Notification gateway settings permanently saved to Google Firestore Cloud Database!',
      storagePath: 'Firestore Database -> site_settings/notification_gateway',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
