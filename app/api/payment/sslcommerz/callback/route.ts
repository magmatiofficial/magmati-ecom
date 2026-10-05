import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

interface SSLCommerzValidationResponse {
  status?: string;
  amount?: string | number;
  currency?: string;
  tran_id?: string;
  bank_tran_id?: string;
  card_type?: string;
  val_id?: string;
  [key: string]: unknown;
}

interface OrderRecord {
  id?: string;
  total?: number | string;
  status?: string;
  payment?: string;
  userName?: string;
  userEmail?: string;
  phone?: string;
  [key: string]: unknown;
}

async function validateSslCommerzTransaction(valId: string): Promise<SSLCommerzValidationResponse | null> {
  const rawSandbox = process.env.SSLCOMMERZ_IS_SANDBOX;
  if (rawSandbox !== 'true' && rawSandbox !== 'false') {
    console.error('[SSLCommerz Callback Error] SSLCOMMERZ_IS_SANDBOX must be explicitly set to "true" or "false". Current value:', rawSandbox);
    return null;
  }
  const isSandbox = rawSandbox === 'true';

  const storeId = process.env.SSLCOMMERZ_STORE_ID || (isSandbox ? 'testbox' : '');
  const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWORD || (isSandbox ? 'testbox@ssl' : '');

  if (!isSandbox && (!storeId || !storePasswd || storeId === 'testbox')) {
    console.error('SSLCommerz live merchant credentials missing during validation callback.');
    return null;
  }
  
  const validatorUrl = isSandbox
    ? `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(valId)}&store_id=${encodeURIComponent(storeId)}&store_passwd=${encodeURIComponent(storePasswd)}&v=1&format=json`
    : `https://payment.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(valId)}&store_id=${encodeURIComponent(storeId)}&store_passwd=${encodeURIComponent(storePasswd)}&v=1&format=json`;

  try {
    const res = await fetch(validatorUrl);
    return (await res.json()) as SSLCommerzValidationResponse;
  } catch (err: unknown) {
    console.error('SSLCommerz server-to-server validation query error:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');

  const requestUrl = new URL(req.url);
  const baseUrl = process.env.APP_URL || requestUrl.origin;

  if (!orderId) {
    return NextResponse.redirect(`${baseUrl}/cart?checkout_status=failed`);
  }

  // Require adminDb on the server; do NOT fall back to client SDK
  if (!adminDb) {
    console.error('[SSLCommerz Callback Error] Firebase Admin DB (adminDb) is not initialized on the server.');
    return NextResponse.redirect(`${baseUrl}/cart?checkout_status=failed&error=database_unavailable&order_id=${orderId}`, 303);
  }

  const rawSandbox = process.env.SSLCOMMERZ_IS_SANDBOX;
  if (rawSandbox !== 'true' && rawSandbox !== 'false') {
    console.error('[SSLCommerz Callback Error] SSLCOMMERZ_IS_SANDBOX must be explicitly set to "true" or "false". Current value:', rawSandbox);
    return NextResponse.redirect(`${baseUrl}/cart?checkout_status=failed&error=invalid_sandbox_config&order_id=${orderId}`, 303);
  }

  try {
    const formPayload: Record<string, string> = {};
    try {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        formPayload[key] = String(value);
      });
    } catch {
      // Fallback if form data parsing fails
    }

    const valId = formPayload.val_id;

    if (!valId) {
      return NextResponse.redirect(`${baseUrl}/cart?checkout_status=failed&order_id=${orderId}`, 303);
    }

    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.redirect(`${baseUrl}/cart?checkout_status=failed`, 303);
    }

    const orderData = orderSnap.data() as OrderRecord;

    // Perform strict gateway transaction validation
    const valData = await validateSslCommerzTransaction(valId);

    const isExactAmount = valData?.amount !== undefined && Math.abs(Number(valData.amount) - Number(orderData.total)) < 0.01;
    const isStrictCurrency = valData?.currency === 'BDT';
    const isMatchingOrder = valData?.tran_id === orderId;
    const isValidStatus = valData && (valData.status === 'VALID' || valData.status === 'VALIDATED');

    const isValidated = Boolean(isValidStatus && isMatchingOrder && isExactAmount && isStrictCurrency);

    // Ensure state transitions atomically and prevents replay attacks
    if (isValidated && orderData.status === 'Pending') {
      const paymentDetails = formPayload.card_type 
        ? `SSLCommerz Paid (${formPayload.card_type})` 
        : 'SSLCommerz Card/Wallet Paid';
      
      const updatePayload = {
        status: 'Processing',
        payment: paymentDetails,
        trxId: formPayload.bank_tran_id || valId,
        updatedAt: new Date().toISOString(),
      };

      await adminDb.collection('orders').doc(orderId).update(updatePayload);

      return NextResponse.redirect(`${baseUrl}/cart?checkout_status=success&order_id=${orderId}`, 303);
    } else if (isValidated && orderData.status === 'Processing') {
      // Already processed order callback (idempotent redirect)
      return NextResponse.redirect(`${baseUrl}/cart?checkout_status=success&order_id=${orderId}`, 303);
    } else {
      if (orderData.status === 'Pending') {
        const failPayload = {
          status: 'Cancelled',
          payment: 'SSLCommerz Payment Failed',
          updatedAt: new Date().toISOString(),
        };
        await adminDb.collection('orders').doc(orderId).update(failPayload);
      }
      return NextResponse.redirect(`${baseUrl}/cart?checkout_status=failed&order_id=${orderId}`, 303);
    }
  } catch (err: unknown) {
    console.error('SSLCommerz callback parsing error:', err);
    return NextResponse.redirect(`${baseUrl}/cart?checkout_status=failed&order_id=${orderId}`, 303);
  }
}

// Support GET callbacks just in case of query params redirections
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');

  const requestUrl = new URL(req.url);
  const baseUrl = process.env.APP_URL || requestUrl.origin;

  if (!orderId) {
    return NextResponse.redirect(`${baseUrl}/cart?checkout_status=failed`);
  }

  // GET requests are purely UI redirects. Payment status updates are ONLY performed via POST callback with valid val_id.
  return NextResponse.redirect(`${baseUrl}/cart?order_id=${orderId}`);
}
