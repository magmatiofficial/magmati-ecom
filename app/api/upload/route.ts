import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminServerSide } from '@/lib/serverAuth';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
];

const ALLOWED_ADMIN_FOLDERS = ['products', 'banners', 'general', 'reviews', 'promotions', 'others'];

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const isAllowed = rateLimit(`upload:${clientIp}`, 20, 60 * 1000);
  if (!isAllowed.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const base64Str = formData.get('base64') as string | null;
    const purpose = formData.get('purpose') as string | null;
    const requestedFolder = formData.get('folder') as string | null;
    const orderId = (formData.get('orderId') as string || '').trim().toUpperCase();

    if (!file && !base64Str) {
      return NextResponse.json({ error: 'No file or media data provided.' }, { status: 400 });
    }

    // Check media file size and MIME type upfront
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size exceeds the 10MB limit.' }, { status: 400 });
      }

      const mime = (file.type || '').toLowerCase();
      if (!ALLOWED_MIME_TYPES.includes(mime)) {
        return NextResponse.json(
          { error: 'Invalid file format. SVG and executable/non-media formats are prohibited.' },
          { status: 400 }
        );
      }
    }

    if (base64Str !== null) {
      const isValid =
        typeof base64Str === 'string' &&
        base64Str.length <= 14000000 &&
        ALLOWED_MIME_TYPES.some((mime) => base64Str.startsWith(`data:${mime};base64,`));

      if (!isValid) {
        return NextResponse.json({ error: 'Invalid media data.' }, { status: 400 });
      }
    }

    let targetFolder = 'magmati/general';
    let isAuthorized = false;

    // 1. Check Admin Authorization
    const authCheck = await verifyAdminServerSide(req);
    if (authCheck.authorized) {
      isAuthorized = true;
      const cleanFolder = requestedFolder && ALLOWED_ADMIN_FOLDERS.includes(requestedFolder.toLowerCase())
        ? requestedFolder.toLowerCase()
        : 'general';
      targetFolder = `magmati/${cleanFolder}`;
    }

    // 2. Check Authenticated Customer Return Evidence Upload
    if (!isAuthorized && purpose === 'return_evidence' && orderId) {
      if (!adminDb || !adminAuth) {
        return NextResponse.json({ error: 'Authentication service unavailable.' }, { status: 500 });
      }

      const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        try {
          const decoded = await adminAuth.verifyIdToken(token);
          if (decoded?.email) {
            const customerEmail = decoded.email.toLowerCase().trim();
            const orderRef = adminDb.collection('orders').doc(orderId);
            const orderSnap = await orderRef.get();

            if (orderSnap.exists) {
              const orderData = orderSnap.data() || {};
              const orderOwnerEmail = (orderData.userEmail || '').toLowerCase().trim();

              if (orderOwnerEmail && orderOwnerEmail === customerEmail) {
                isAuthorized = true;
                // Force targetFolder strictly to magmati/returns
                targetFolder = 'magmati/returns';
              }
            }
          }
        } catch {
          // Token verification failed
        }
      }
    }

    // Fail closed: reject any upload not matching verified admin or verified authenticated order owner
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Upload requires verified admin authorization or verified order ownership with a valid authentication token.' },
        { status: 401 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret || cloudName === 'YOUR_CLOUD_NAME' || apiKey === 'YOUR_API_KEY') {
      return NextResponse.json({ error: 'Image upload is not configured on the server.' }, { status: 503 });
    }

    // Configure Cloudinary server-side
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    let uploadResult: { secure_url?: string; url?: string } | undefined;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      uploadResult = await new Promise<{ secure_url?: string; url?: string } | undefined>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: targetFolder,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
    } else if (base64Str) {
      uploadResult = await cloudinary.uploader.upload(base64Str, {
        folder: targetFolder,
        resource_type: 'auto',
      });
    }

    return NextResponse.json({
      url: uploadResult?.secure_url || uploadResult?.url,
      success: true,
    });
  } catch (error: unknown) {
    console.error('Upload processing error:', error);
    return NextResponse.json({ error: 'Upload processing failed. Please try again.' }, { status: 500 });
  }
}
