import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { isPhoneMatching, isValidBDPhone } from '@/lib/phoneUtils';

interface InitRequestBody {
  orderId?: string;
  phone?: string;
}

interface OrderRecord {
  id?: string;
  total?: number | string;
  status?: string;
  userName?: string;
  userEmail?: string;
  email?: string;
  phone?: string;
  address?: string;
  [key: string]: unknown;
}

interface SSLCommerzInitResponse {
  status?: string;
  failedreason?: string;
  GatewayPageURL?: string;
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const rawSandbox = process.env.SSLCOMMERZ_IS_SANDBOX;
    if (rawSandbox !== 'true' && rawSandbox !== 'false') {
      console.error('[SSLCommerz Error] SSLCOMMERZ_IS_SANDBOX must be explicitly set to "true" or "false". Current value:', rawSandbox);
      return NextResponse.json(
        { error: 'Payment gateway configuration error: SSLCOMMERZ_IS_SANDBOX must be explicitly set to "true" or "false".' },
        { status: 500 }
      );
    }
    const isSandbox = rawSandbox === 'true';

    const body: InitRequestBody = await req.json().catch(() => ({}));
    const { orderId, phone } = body;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { error: 'Order ID is required to initialize payment session.' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      console.error('[SSLCommerz Init Error] Firebase Admin DB is not initialized.');
      return NextResponse.json(
        { error: 'Database service unavailable.' },
        { status: 500 }
      );
    }

    const orderSnap = await adminDb.collection('orders').doc(orderId).get();
    if (!orderSnap.exists) {
      return NextResponse.json(
        { error: 'Order not found.' },
        { status: 404 }
      );
    }

    const orderData = orderSnap.data() as OrderRecord;

    // Ownership Verification Check:
    let isAuthorized = false;

    // 1. Check Bearer Auth Token
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ') && adminAuth) {
      try {
        const token = authHeader.substring(7).trim();
        const decoded = await adminAuth.verifyIdToken(token);
        if (decoded) {
          const userEmail = (decoded.email || '').toLowerCase().trim();
          const orderEmail = (orderData.userEmail || orderData.email || '').toLowerCase().trim();
          const adminEmails = (process.env.ADMIN_EMAILS ?? '')
            .split(',')
            .map((e: string) => e.trim().toLowerCase())
            .filter(Boolean);

          if (userEmail && orderEmail && userEmail === orderEmail) {
            isAuthorized = true;
          } else if (decoded.role === 'admin' || adminEmails.includes(userEmail)) {
            isAuthorized = true;
          }
        }
      } catch {
        // Fall back to phone verification if token fails
      }
    }

    // 2. Check Guest Phone Matching if not authorized by account token
    if (!isAuthorized && phone) {
      const storedPhone = orderData.phone || '';
      if (isValidBDPhone(phone) && isPhoneMatching(storedPhone, phone)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Order ownership verification failed. Complete matching phone number or account authentication is required.' },
        { status: 403 }
      );
    }

    const authoritativeAmount = Number(orderData.total);

    if (isNaN(authoritativeAmount) || authoritativeAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid order payable total.' },
        { status: 400 }
      );
    }

    const customerName = orderData.userName || 'Valued Customer';
    const customerPhone = orderData.phone || '01700000000';
    const customerAddress = orderData.address || 'Dhaka';
    const customerEmail = orderData.userEmail || '';

    const storeId = process.env.SSLCOMMERZ_STORE_ID || (isSandbox ? 'testbox' : '');
    const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWORD || (isSandbox ? 'testbox@ssl' : '');

    if (!isSandbox && (!storeId || !storePasswd || storeId === 'testbox')) {
      return NextResponse.json(
        { error: 'SSLCommerz live merchant credentials must be configured for live production checkout.' },
        { status: 500 }
      );
    }
    
    const sslcommerzUrl = isSandbox
      ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://payment.sslcommerz.com/gwprocess/v4/api.php';

    const requestUrl = new URL(req.url);
    const baseUrl = process.env.APP_URL || requestUrl.origin;

    // Construct form-urlencoded payload for SSLCommerz using server-authoritative amount
    const params = new URLSearchParams();
    params.append('store_id', storeId);
    params.append('store_passwd', storePasswd);
    params.append('total_amount', String(authoritativeAmount));
    params.append('currency', 'BDT');
    params.append('tran_id', orderId);
    params.append('success_url', `${baseUrl}/api/payment/sslcommerz/callback?status=success&orderId=${orderId}`);
    params.append('fail_url', `${baseUrl}/api/payment/sslcommerz/callback?status=fail&orderId=${orderId}`);
    params.append('cancel_url', `${baseUrl}/api/payment/sslcommerz/callback?status=cancel&orderId=${orderId}`);
    
    // Customer Info (SSLCommerz gateway requires a valid email format in cus_email)
    const gatewayEmail = customerEmail || process.env.PAYMENT_FALLBACK_EMAIL || 'noreply@example.com';
    params.append('cus_name', customerName);
    params.append('cus_email', gatewayEmail);
    params.append('cus_add1', customerAddress);
    params.append('cus_city', 'Dhaka');
    params.append('cus_country', 'Bangladesh');
    params.append('cus_phone', customerPhone);
    
    // Required Products/Shipping fields
    params.append('shipping_method', 'NO');
    params.append('num_of_item', '1');
    params.append('product_name', 'Garments & Lifestyle Products');
    params.append('product_category', 'Fashion Apparel');
    params.append('product_profile', 'general');

    const response = await fetch(sslcommerzUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data: SSLCommerzInitResponse | null = await response.json().catch(() => null);

    if (response.ok && data?.status === 'SUCCESS' && data?.GatewayPageURL) {
      return NextResponse.json({
        success: true,
        gatewayUrl: data.GatewayPageURL,
      });
    }

    return NextResponse.json(
      { error: data?.failedreason || 'Failed to initialize payment gateway session.' },
      { status: 500 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'An error occurred while initializing payment.';
    console.error('SSLCommerz payment init error:', error);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
