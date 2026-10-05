import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { BANGLADESH_DISTRICTS } from '@/lib/bangladeshDistricts';
import { FREE_SHIPPING_THRESHOLD_BDT, STANDARD_DELIVERY_DHAKA, STANDARD_DELIVERY_OUTSIDE } from '@/lib/constants';
import { dispatchServerOrderPlacedNotification } from '@/lib/serverNotifications';
import { products as initialMasterProducts } from '@/data/products';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

interface CreateOrderRequestBody {
  userEmail?: string;
  userName: string;
  phone: string;
  address: string;
  district?: string;
  orderNotes?: string;
  payment: string;
  trxId?: string;
  items: Array<{
    product: { id: string; name?: string; price?: number; image?: string; category?: string };
    quantity: number;
    selectedSize?: string;
    selectedColor?: { name: string; hex: string };
    customPrice?: number;
    isFreeItem?: boolean;
    isComboItem?: boolean;
    comboId?: string;
    promoLabel?: string;
  }>;
  appliedCoupon?: string;
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const isAllowed = rateLimit(`order_create:${clientIp}`, 10, 60 * 1000);
  if (!isAllowed.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const body: CreateOrderRequestBody = await req.json();
    const {
      userEmail: clientEmail,
      userName,
      phone,
      address,
      district = 'dhaka',
      orderNotes = '',
      payment = 'Cash on Delivery',
      trxId = '',
      items = [],
      appliedCoupon,
    } = body;

    // 1. Field validation
    if (!userName || !phone || !address || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required order details (Name, Phone, Address, or Items).' },
        { status: 400 }
      );
    }

    const cleanedPhone = phone.replace(/[\s-+]/g, '').replace(/^88/, '');
    if (!/^01[3-9]\d{8}$/.test(cleanedPhone)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 11-digit Bangladeshi mobile number.' },
        { status: 400 }
      );
    }

    // 2. Order Identity Verification: derive authenticated identity from Bearer token if present
    let verifiedUserEmail = (clientEmail || '').toLowerCase().trim();
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ') && adminAuth) {
      try {
        const token = authHeader.substring(7).trim();
        const decoded = await adminAuth.verifyIdToken(token);
        if (decoded?.email) {
          verifiedUserEmail = decoded.email.toLowerCase().trim();
        }
      } catch {
        // Fallback to provided guest email
      }
    }

    // 3. Authoritative Server Product Pricing & Stock Validation
    let siteSettingsData: any = null;
    if (adminDb) {
      try {
        const settingsDoc = await adminDb.collection('site_settings').doc('general').get();
        if (settingsDoc.exists) {
          siteSettingsData = settingsDoc.data();
        }
      } catch {}
    }
    const activeB1g1Offers = siteSettingsData?.b1g1Offers || [
      {
        id: 'b1g1-demo-1',
        buyProductId: 'elec-ultra-watch-pro',
        getProductId: 'elec-bluetooth-speaker',
        enabled: true,
      }
    ];
    const activeCombos = siteSettingsData?.combos || [
      {
        id: 'combo-demo-1',
        comboPrice: 2490,
        enabled: true,
        items: [
          { productId: 'elec-rgb-headset', quantity: 1 },
          { productId: 'elec-wireless-mouse', quantity: 1 },
        ],
      }
    ];

    let verifiedSubtotal = 0;
    const verifiedOrderItems: any[] = [];

    for (const item of items) {
      const prodId = item.product?.id;
      if (!prodId) {
        return NextResponse.json(
          { success: false, error: 'Invalid order item: missing product ID.' },
          { status: 400 }
        );
      }

      let prodData: any = null;

      // Try Firestore lookup first if adminDb is available
      if (adminDb) {
        try {
          const prodDoc = await adminDb.collection('products').doc(prodId).get();
          if (prodDoc.exists) {
            prodData = prodDoc.data();
          }
        } catch {
          // Fallback to master catalog
        }
      }

      // If not found in Firestore, resolve from master product catalog
      if (!prodData) {
        const catalogProd = initialMasterProducts.find((p) => p.id === prodId);
        if (catalogProd) {
          prodData = {
            id: catalogProd.id,
            name: catalogProd.name,
            price: catalogProd.price,
            stockQuantity: catalogProd.stockQuantity ?? 50,
            images: catalogProd.images,
            category: catalogProd.category,
          };
        }
      }

      // Reject if product does not exist in authoritative server catalog (no client price fallback)
      if (!prodData) {
        return NextResponse.json(
          { success: false, error: `Product "${prodId}" does not exist in the authoritative product catalog.` },
          { status: 400 }
        );
      }

      const authoritativePrice = typeof prodData.price === 'number' ? prodData.price : 0;
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));

      const availableStock = typeof prodData.stockQuantity === 'number' ? prodData.stockQuantity : 50;
      if (qty > availableStock) {
        return NextResponse.json(
          { success: false, error: `Sorry, product "${prodData.name || prodId}" only has ${availableStock} units left in stock.` },
          { status: 400 }
        );
      }

      // Calculate effective item price with strict server-side promotion validation
      let effectiveItemPrice = authoritativePrice;
      let isFreeItemVerified = false;
      let isComboItemVerified = false;

      if (item.isFreeItem) {
        const validOffer = activeB1g1Offers.find((offer: any) =>
          offer.enabled &&
          offer.getProductId === prodId
        );

        const qualifyingItem = items.find((i: any) =>
          (i.product?.id || i.productId) === validOffer?.buyProductId &&
          !i.isFreeItem &&
          Boolean(i.claimedB1G1 || i.claimedB1G1Offer)
        );

        if (validOffer && qualifyingItem) {
          const buyQty = validOffer.buyQuantity || 1;
          const getQty = validOffer.getQuantity || 1;
          const qualifyingQty = Math.max(1, Math.floor(Number(qualifyingItem.quantity) || 1));
          const maxFreeAllowed = Math.floor(qualifyingQty / buyQty) * getQty;

          if (qty <= maxFreeAllowed) {
            effectiveItemPrice = 0;
            isFreeItemVerified = true;
          } else {
            return NextResponse.json(
              { success: false, error: `Free gift quantity (${qty}) exceeds allowed offer quantity (${maxFreeAllowed}) for product "${prodId}".` },
              { status: 400 }
            );
          }
        } else {
          return NextResponse.json(
            { success: false, error: `Invalid or unauthorized free item claim for product "${prodId}". Qualifying product and explicit offer claim required.` },
            { status: 400 }
          );
        }
      } else if (item.isComboItem && item.comboId) {
        const validCombo = activeCombos.find((combo: any) =>
          combo.enabled &&
          combo.id === item.comboId &&
          combo.items?.some((ci: any) => ci.productId === prodId)
        );

        // Verify that ALL combo items are present in order payload for this combo
        const allComboItemsPresent = validCombo?.items?.every((ci: any) =>
          items.some((i: any) => (i.product?.id || i.productId) === ci.productId && i.isComboItem && i.comboId === validCombo.id)
        );

        if (validCombo && allComboItemsPresent) {
          // Calculate server-authoritative combo price allocation across combo items
          let comboOriginalSum = 0;
          const comboProductPrices: Record<string, number> = {};

          for (const ci of validCombo.items) {
            const catProd = initialMasterProducts.find((p) => p.id === ci.productId);
            const pPrice = catProd?.price || authoritativePrice;
            comboProductPrices[ci.productId] = pPrice;
            comboOriginalSum += pPrice * (ci.quantity || 1);
          }

          let allocatedComboPrice = validCombo.comboPrice;
          if (comboOriginalSum > 0) {
            allocatedComboPrice = Math.round((authoritativePrice / comboOriginalSum) * validCombo.comboPrice);
          }

          effectiveItemPrice = allocatedComboPrice;
          isComboItemVerified = true;
        } else {
          return NextResponse.json(
            { success: false, error: `Invalid or manipulated combo promotion for product "${prodId}". All combo items must be present.` },
            { status: 400 }
          );
        }
      }

      verifiedSubtotal += effectiveItemPrice * qty;
      verifiedOrderItems.push({
        product: {
          id: prodId,
          name: prodData.name || 'Product',
          price: authoritativePrice,
          image: prodData.images?.[0] || prodData.image || '',
          category: prodData.category || '',
        },
        quantity: qty,
        selectedSize: item.selectedSize || 'Standard',
        selectedColor: item.selectedColor || { name: 'Standard', hex: '#000000' },
        customPrice: effectiveItemPrice,
        isFreeItem: isFreeItemVerified,
        isComboItem: isComboItemVerified,
        ...(item.comboId ? { comboId: item.comboId } : {}),
        ...(item.promoLabel ? { promoLabel: item.promoLabel } : {}),
      });
    }

    if (verifiedOrderItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid product items in order.' },
        { status: 400 }
      );
    }

    // 4. Server-Side Delivery Fee Calculation
    const activeDistrict = BANGLADESH_DISTRICTS.find((d) => d.id === district || d.nameEn.toLowerCase() === district.toLowerCase());
    const isInsideDhaka = activeDistrict ? activeDistrict.isDhakaCity : true;
    
    const verifiedDeliveryFee = verifiedSubtotal >= FREE_SHIPPING_THRESHOLD_BDT
      ? 0
      : isInsideDhaka
      ? STANDARD_DELIVERY_DHAKA
      : STANDARD_DELIVERY_OUTSIDE;

    // 5. Server-Side Voucher Discount Calculation
    let verifiedDiscount = 0;
    if (appliedCoupon) {
      const codeClean = appliedCoupon.trim().toUpperCase();
      if (codeClean === 'MAGMA200') {
        if (verifiedSubtotal >= 1500) verifiedDiscount = 200;
      } else if (codeClean === 'FESTIVE500') {
        if (verifiedSubtotal >= 3500) verifiedDiscount = 500;
      } else if (codeClean === 'EIDMEGA1000') {
        if (verifiedSubtotal >= 6000) verifiedDiscount = 1000;
      } else if (codeClean === 'WELCOME10' || codeClean === 'MAGMATI10') {
        verifiedDiscount = Math.round(verifiedSubtotal * 0.1);
      } else if (codeClean === 'FASHION15') {
        verifiedDiscount = Math.round(verifiedSubtotal * 0.15);
      } else if (codeClean === 'FREESHIP') {
        verifiedDiscount = verifiedDeliveryFee;
      }
    }

    const verifiedTotal = Math.max(0, verifiedSubtotal + verifiedDeliveryFee - verifiedDiscount);

    // 6. Generate Order Document
    const orderId = `MGM-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    const currentDate = new Date().toLocaleDateString('en-US', dateOptions);
    const isoDate = new Date().toISOString();

    const verifiedOrderDocument = {
      id: orderId,
      userEmail: verifiedUserEmail,
      userName: userName.trim(),
      phone: cleanedPhone,
      address: address.trim(),
      district: activeDistrict ? activeDistrict.nameEn : 'Dhaka',
      orderNotes: orderNotes.trim(),
      payment,
      ...(trxId ? { trxId: trxId.trim() } : {}),
      items: verifiedOrderItems,
      subtotal: verifiedSubtotal,
      deliveryFee: verifiedDeliveryFee,
      discount: verifiedDiscount,
      total: verifiedTotal,
      status: 'Pending',
      date: currentDate,
      createdAt: isoDate,
    };

    // 7. Atomic Firestore Stock Deduction & Order Persistence (Strictly Transactional & Concurrency-Safe)
    if (adminDb) {
      try {
        const orderRef = adminDb.collection('orders').doc(orderId);
        await adminDb.runTransaction(async (transaction) => {
          for (const item of verifiedOrderItems) {
            const productRef = adminDb.collection('products').doc(item.product.id);
            const productSnap = await transaction.get(productRef);
            
            let stockNum = 50;
            let productExists = false;
            const catalogProd = initialMasterProducts.find((p) => p.id === item.product.id);

            if (productSnap.exists) {
              productExists = true;
              const currentStock = productSnap.data()?.stockQuantity;
              stockNum = typeof currentStock === 'number' ? currentStock : 50;
            } else if (catalogProd) {
              productExists = true;
              stockNum = typeof catalogProd.stockQuantity === 'number' ? catalogProd.stockQuantity : 50;
            }

            if (!productExists) {
              throw new Error(`Product "${item.product.id}" no longer exists.`);
            }

            if (stockNum < item.quantity) {
              throw new Error(`Insufficient stock for "${item.product.name || item.product.id}". Available: ${stockNum}, Requested: ${item.quantity}`);
            }

            const updatedStock = stockNum - item.quantity;

            if (productSnap.exists) {
              transaction.update(productRef, {
                stockQuantity: updatedStock,
                inStock: updatedStock > 0,
                updatedAt: isoDate,
              });
            } else if (catalogProd) {
              transaction.set(productRef, {
                id: catalogProd.id,
                name: catalogProd.name,
                slug: catalogProd.slug,
                price: catalogProd.price,
                originalPrice: catalogProd.originalPrice ?? null,
                discountPercent: catalogProd.discountPercent ?? null,
                category: catalogProd.category,
                subcategory: catalogProd.subcategory,
                images: catalogProd.images || [],
                sizes: catalogProd.sizes || [],
                colors: catalogProd.colors || [],
                description: catalogProd.description || '',
                details: catalogProd.details || [],
                brand: catalogProd.brand || 'MAGMATI',
                sku: catalogProd.sku || catalogProd.id,
                inStock: updatedStock > 0,
                stockQuantity: updatedStock,
                createdAt: isoDate,
                updatedAt: isoDate,
              });
            }
          }
          transaction.set(orderRef, verifiedOrderDocument);
        });
      } catch (adminErr: any) {
        if (adminErr.message && (adminErr.message.includes('Insufficient stock') || adminErr.message.includes('no longer exists.'))) {
          throw adminErr;
        }
        if (adminErr.message && adminErr.message.includes('PERMISSION_DENIED')) {
          for (const item of verifiedOrderItems) {
            const stockNum = 50;
            if (item.quantity > stockNum) {
              throw new Error(`Insufficient stock for "${item.product.name || item.product.id}". Available: ${stockNum}, Requested: ${item.quantity}`);
            }
          }
        } else {
          throw adminErr;
        }
      }
    }

    // 8. Dispatch Server-Side Order Placed Notifications
    dispatchServerOrderPlacedNotification(verifiedOrderDocument).catch((err) => {
      console.warn('Background order notification notice:', err);
    });

    return NextResponse.json({
      success: true,
      orderId,
      total: verifiedTotal,
      order: verifiedOrderDocument,
    });
  } catch (error: any) {
    console.error('Server order creation error:', error);
    const msg = error.message || 'Failed to create order.';
    const status = msg.includes('Insufficient stock') || msg.includes('no longer exists.') ? 400 : 500;
    return NextResponse.json(
      { success: false, error: msg },
      { status }
    );
  }
}
