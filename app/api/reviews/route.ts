import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth, isAdminDbReady } from '@/lib/firebaseAdmin';
import { verifyAdminServerSide } from '@/lib/serverAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { revalidateTag, unstable_cache } from 'next/cache';

export const dynamic = 'force-dynamic';

interface ClientReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  userName: string;
  userLocation: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified: boolean;
  helpfulCount: number;
}

interface PostRequestBody {
  productId?: unknown;
  rating?: unknown;
  comment?: unknown;
  userLocation?: unknown;
}

interface PatchRequestBody {
  id?: unknown;
  action?: unknown;
}

interface OrderItemProduct {
  id?: string;
}

interface OrderItemData {
  product?: OrderItemProduct;
  productId?: string;
}

interface AuthResult {
  email?: string;
  name?: string;
  errorResponse?: NextResponse;
}

async function authenticate(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      errorResponse: NextResponse.json({ success: false, error: 'Unauthorized: Authentication required.' }, { status: 401 }),
    };
  }

  if (!adminAuth || !adminDb) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Database service is unavailable.' },
        { status: 503 }
      ),
    };
  }

  const token = authHeader.substring(7).trim();
  let decoded: { email?: string; name?: string; displayName?: string } | null = null;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch (verifyErr) {
    console.error('[ReviewsAPI] Token verification failed:', verifyErr);
    return {
      errorResponse: NextResponse.json({ success: false, error: 'Unauthorized: Invalid authentication token.' }, { status: 401 }),
    };
  }

  if (!decoded || !decoded.email) {
    return {
      errorResponse: NextResponse.json({ success: false, error: 'Unauthorized: Token does not contain an email address.' }, { status: 401 }),
    };
  }

  return {
    email: decoded.email.toLowerCase().trim(),
    name: decoded.name || decoded.displayName || undefined,
  };
}

const getCachedReviews = unstable_cache(
  async (): Promise<ClientReview[]> => {
    if (!isAdminDbReady || !adminDb) throw new Error('adminDb unavailable');
    const snapshot = await adminDb.collection('reviews').limit(300).get();
    const list: ClientReview[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        productId: typeof data.productId === 'string' ? data.productId : '',
        productName: typeof data.productName === 'string' ? data.productName : '',
        productImage: typeof data.productImage === 'string' ? data.productImage : '',
        productPrice: typeof data.productPrice === 'number' ? data.productPrice : 0,
        userName: typeof data.userName === 'string' ? data.userName : 'Anonymous',
        userLocation: typeof data.userLocation === 'string' ? data.userLocation : '',
        rating: typeof data.rating === 'number' ? data.rating : 5,
        comment: typeof data.comment === 'string' ? data.comment : '',
        createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date(0).toISOString(),
        verified: Boolean(data.verified),
        helpfulCount: typeof data.helpfulCount === 'number' ? data.helpfulCount : 0,
      };
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  },
  ['reviews-list'],
  { revalidate: 600, tags: ['reviews'] }
);

export async function GET(req: NextRequest) {
  try {
    if (!isAdminDbReady || !adminDb) {
      return NextResponse.json({ success: true, reviews: [], total: 0 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId')?.trim();
    const limitParam = parseInt(searchParams.get('limit') || '20', 10);
    const limit = Math.max(1, Math.min(300, Number.isFinite(limitParam) ? limitParam : 20));

    let allReviews: ClientReview[] = [];
    try {
      allReviews = await getCachedReviews();
    } catch (cacheErr) {
      console.error('[ReviewsAPI] Failed to fetch from cache/db:', cacheErr);
      allReviews = [];
    }

    const filtered = productId
      ? allReviews.filter((r) => r.productId === productId)
      : allReviews;

    const total = filtered.length;
    const reviews = filtered.slice(0, limit);

    return NextResponse.json({ success: true, reviews, total });
  } catch (err) {
    console.error('[ReviewsAPI] Error fetching reviews:', err);
    return NextResponse.json({ success: true, reviews: [], total: 0 });
  }
}

async function recomputeProductRating(productId: string): Promise<void> {
  if (!adminDb) return;
  try {
    await adminDb.runTransaction(async (transaction) => {
      const productRef = adminDb.collection('products').doc(productId);
      const productSnap = await transaction.get(productRef);
      if (!productSnap.exists) return;

      const reviewsQuery = adminDb.collection('reviews').where('productId', '==', productId);
      const reviewsSnap = await transaction.get(reviewsQuery);

      let sum = 0;
      let count = 0;
      reviewsSnap.forEach((doc) => {
        const data = doc.data();
        if (typeof data.rating === 'number') {
          sum += data.rating;
          count++;
        }
      });

      const rating = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
      transaction.update(productRef, { rating, reviewCount: count });
    });
  } catch (err) {
    console.error('[ReviewsAPI] Rating recompute failed:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!adminDb || !adminAuth) {
      return NextResponse.json(
        { success: false, error: 'Database service is unavailable.' },
        { status: 503 }
      );
    }

    const { email, name, errorResponse } = await authenticate(req);
    if (errorResponse || !email) return errorResponse!;

    const clientIp = getClientIp(req);
    const rateCheck = rateLimit(`review_post:${clientIp}:${email}`, 5, 60 * 1000);
    if (!rateCheck.ok) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a moment before submitting another review.' },
        { status: 429 }
      );
    }

    let body: PostRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    if (
      typeof body.productId !== 'string' ||
      !body.productId.trim() ||
      body.productId.trim().length > 200 ||
      body.productId.includes('/')
    ) {
      return NextResponse.json(
        { success: false, error: 'Product ID must be non-empty, max 200 characters, and cannot contain "/".' },
        { status: 400 }
      );
    }
    const productId = body.productId.trim();

    const ratingVal = Number(body.rating);
    if (!Number.isInteger(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be an integer between 1 and 5.' },
        { status: 400 }
      );
    }
    const rating = ratingVal;

    if (typeof body.comment !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Comment must be provided as a string.' },
        { status: 400 }
      );
    }
    const comment = body.comment.trim();
    if (comment.length < 5 || comment.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Comment must be between 5 and 1000 characters.' },
        { status: 400 }
      );
    }

    let userLocation = '';
    if (body.userLocation !== undefined && body.userLocation !== null) {
      if (typeof body.userLocation !== 'string') {
        return NextResponse.json(
          { success: false, error: 'User location must be a string.' },
          { status: 400 }
        );
      }
      const trimmedLoc = body.userLocation.trim();
      if (trimmedLoc.length > 60) {
        return NextResponse.json(
          { success: false, error: 'User location cannot exceed 60 characters.' },
          { status: 400 }
        );
      }
      userLocation = trimmedLoc;
    }

    const reviewDocId = `${productId}__${email}`;
    const reviewDocRef = adminDb.collection('reviews').doc(reviewDocId);

    const productDoc = await adminDb.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Product not found.' },
        { status: 404 }
      );
    }

    const pData = productDoc.data();
    let productName = typeof pData?.name === 'string' ? pData.name : '';
    let productImage = '';
    if (Array.isArray(pData?.images) && typeof pData.images[0] === 'string' && pData.images[0]) {
      productImage = pData.images[0];
    } else if (typeof pData?.image === 'string') {
      productImage = pData.image;
    }
    const productPrice = typeof pData?.price === 'number' ? pData.price : 0;

    if (!productName) {
      productName = productId;
    }

    let userName = name && name.trim() ? name.trim() : '';
    if (!userName) {
      try {
        const userDoc = await adminDb.collection('users').doc(email).get();
        if (userDoc.exists) {
          const uData = userDoc.data();
          const docName = uData?.name || uData?.displayName || uData?.userName;
          if (typeof docName === 'string' && docName.trim()) {
            userName = docName.trim();
          }
        }
      } catch (err) {
        console.error('[ReviewsAPI] Error querying users doc for name:', err);
      }
    }
    if (!userName) {
      userName = email.split('@')[0] || 'User';
    }

    let verified = false;
    try {
      const ordersSnap = await adminDb.collection('orders').where('userEmail', '==', email).get();
      for (const orderDoc of ordersSnap.docs) {
        const oData = orderDoc.data();
        const orderStatus = typeof oData?.status === 'string' ? oData.status.trim().toLowerCase() : '';
        if (orderStatus === 'cancelled') {
          continue;
        }
        const items = Array.isArray(oData?.items) ? (oData.items as OrderItemData[]) : [];
        const hasProduct = items.some((item) => {
          return item?.product?.id === productId || item?.productId === productId;
        });
        if (hasProduct) {
          verified = true;
          break;
        }
      }
    } catch (err) {
      console.error('[ReviewsAPI] Error checking user orders for verified badge:', err);
    }

    if (!verified) {
      try {
        const guestOrdersSnap = await adminDb.collection('orders').where('guestEmail', '==', email).get();
        for (const guestDoc of guestOrdersSnap.docs) {
          const oData = guestDoc.data();
          const orderStatus = typeof oData?.status === 'string' ? oData.status.trim().toLowerCase() : '';
          if (orderStatus === 'cancelled') {
            continue;
          }
          const items = Array.isArray(oData?.items) ? (oData.items as OrderItemData[]) : [];
          const hasProduct = items.some((item) => {
            return item?.product?.id === productId || item?.productId === productId;
          });
          if (hasProduct) {
            verified = true;
            break;
          }
        }
      } catch (err) {
        console.error('[ReviewsAPI] Error checking guest orders for verified badge:', err);
      }
    }

    const isoCreated = new Date().toISOString();
    const newReviewDoc = {
      id: reviewDocId,
      productId,
      productName,
      productImage,
      productPrice,
      userName,
      userLocation,
      userEmail: email,
      rating,
      comment,
      createdAt: isoCreated,
      verified,
      helpfulCount: 0,
      helpfulBy: [] as string[],
    };

    try {
      await reviewDocRef.create(newReviewDoc);
    } catch (createErr: unknown) {
      const errObj = createErr as { code?: number | string };
      const isAlreadyExists =
        errObj?.code === 6 ||
        errObj?.code === '6' ||
        errObj?.code === 'ALREADY_EXISTS' ||
        String(createErr).includes('ALREADY_EXISTS');

      if (isAlreadyExists) {
        return NextResponse.json(
          { success: false, error: 'You already reviewed this product' },
          { status: 409 }
        );
      }
      throw createErr;
    }

    try {
      await recomputeProductRating(productId);
    } catch (err) {
      console.error('[ReviewsAPI] Rating recompute failed:', err);
    }

    revalidateTag('reviews');
    revalidateTag('products');

    const clientReview: ClientReview = {
      id: reviewDocId,
      productId,
      productName,
      productImage,
      productPrice,
      userName,
      userLocation,
      rating,
      comment,
      createdAt: isoCreated,
      verified,
      helpfulCount: 0,
    };

    return NextResponse.json({ success: true, review: clientReview }, { status: 201 });
  } catch (err) {
    console.error('[ReviewsAPI] Error creating review:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to create review.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!adminDb || !adminAuth) {
      return NextResponse.json(
        { success: false, error: 'Database service is unavailable.' },
        { status: 503 }
      );
    }

    const { email, errorResponse } = await authenticate(req);
    if (errorResponse || !email) return errorResponse!;

    let body: PatchRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const reviewId = typeof body.id === 'string' ? body.id.trim() : '';
    const action = body.action;

    if (!reviewId || action !== 'helpful') {
      return NextResponse.json(
        { success: false, error: 'Valid review ID and action="helpful" are required.' },
        { status: 400 }
      );
    }

    const reviewRef = adminDb.collection('reviews').doc(reviewId);

    const transactionResult = await adminDb.runTransaction(async (transaction) => {
      const snap = await transaction.get(reviewRef);
      if (!snap.exists) {
        return null;
      }

      const data = snap.data() || {};
      const currentHelpfulBy: string[] = Array.isArray(data.helpfulBy)
        ? (data.helpfulBy as string[])
        : [];
      const currentHelpfulCount = typeof data.helpfulCount === 'number'
        ? data.helpfulCount
        : currentHelpfulBy.length;

      let newHelpfulBy: string[];
      let newHelpfulCount: number;
      let helpedByMe: boolean;

      if (currentHelpfulBy.includes(email)) {
        newHelpfulBy = currentHelpfulBy.filter((e) => e !== email);
        newHelpfulCount = Math.max(0, currentHelpfulCount - 1);
        helpedByMe = false;
      } else {
        newHelpfulBy = [...currentHelpfulBy, email];
        newHelpfulCount = currentHelpfulCount + 1;
        helpedByMe = true;
      }

      transaction.update(reviewRef, {
        helpfulBy: newHelpfulBy,
        helpfulCount: newHelpfulCount,
      });

      return {
        helpfulCount: newHelpfulCount,
        helpedByMe,
      };
    });

    if (!transactionResult) {
      return NextResponse.json(
        { success: false, error: 'Review not found.' },
        { status: 404 }
      );
    }

    revalidateTag('reviews');

    return NextResponse.json({
      success: true,
      helpfulCount: transactionResult.helpfulCount,
      helpedByMe: transactionResult.helpedByMe,
    });
  } catch (err) {
    console.error('[ReviewsAPI] Error updating review helpful count:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update review.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!adminDb || !adminAuth) {
      return NextResponse.json(
        { success: false, error: 'Database service is unavailable.' },
        { status: 503 }
      );
    }

    const adminCheck = await verifyAdminServerSide(req);
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { success: false, error: adminCheck.error || 'Unauthorized: Admin access required.' },
        { status: adminCheck.status || 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id')?.trim();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review ID query parameter is required.' },
        { status: 400 }
      );
    }

    const reviewRef = adminDb.collection('reviews').doc(id);
    const reviewSnap = await reviewRef.get();

    if (!reviewSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Review not found.' },
        { status: 404 }
      );
    }

    const reviewData = reviewSnap.data();
    const productId = typeof reviewData?.productId === 'string' ? reviewData.productId : '';

    await reviewRef.delete();

    if (productId) {
      try {
        await recomputeProductRating(productId);
      } catch (err) {
        console.error('[ReviewsAPI] Rating recompute failed:', err);
      }
    }

    revalidateTag('reviews');
    revalidateTag('products');

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (err) {
    console.error('[ReviewsAPI] Error deleting review:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to delete review.' },
      { status: 500 }
    );
  }
}
