import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { verifyAdminServerSide } from '@/lib/serverAuth';
import firebaseConfig from '@/firebase-applet-config.json';

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

    const docRef = doc(db, 'site_settings', 'env_credentials');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return NextResponse.json({ success: true, envData: docSnap.data() });
    }

    // Default fallback from environment
    const defaultData = {
      CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'magmati',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
      CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'magmati_preset',

      GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
      GEMINI_MODEL_NAME: 'gemini-2.5-flash',

      FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfig.apiKey || '',
      FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain || '',
      FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig.projectId || '',
      FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket || '',
      FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId || '',
      FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || firebaseConfig.appId || '',

      STEADFAST_API_KEY: process.env.STEADFAST_API_KEY || '',
      STEADFAST_SECRET_KEY: process.env.STEADFAST_SECRET_KEY || '',
      REDX_API_TOKEN: process.env.REDX_API_TOKEN || '',

      BKASH_APP_KEY: process.env.BKASH_APP_KEY || '',
      BKASH_APP_SECRET: process.env.BKASH_APP_SECRET || '',
      SSLCOMMERZ_STORE_ID: process.env.SSLCOMMERZ_STORE_ID || '',
      SSLCOMMERZ_STORE_PASSWORD: process.env.SSLCOMMERZ_STORE_PASSWORD || '',

      GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

      SMS_ENABLED: process.env.SMS_ENABLED || 'false',
      SMS_PROVIDER: process.env.SMS_PROVIDER || 'greenweb',
      SMS_API_KEY: process.env.SMS_API_KEY || '',
      SMS_SENDER_ID: process.env.SMS_SENDER_ID || 'MAGMATI',
      SMS_CLIENT_ID: process.env.SMS_CLIENT_ID || '',

      EMAIL_ENABLED: process.env.EMAIL_ENABLED || 'false',
      EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'resend',
      EMAIL_API_KEY: process.env.EMAIL_API_KEY || '',
      EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS || 'orders@magmati.com',
      EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'MAGMATI Lifestyle',
      ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL || '',
    };

    return NextResponse.json({ success: true, envData: defaultData });
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

    const docRef = doc(db, 'site_settings', 'env_credentials');
    await setDoc(docRef, {
      ...body,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ 
      success: true, 
      message: 'Environment credentials saved & applied to Firestore successfully' 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
