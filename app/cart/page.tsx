/**
 * @file app/cart/page.tsx
 * @description Production-ready Shopping Bag & Checkout Page with item selection,
 * modular architecture, 64 Bangladeshi Districts, real-time shipping fees, bKash/Nagad mobile banking, and Firestore persistence.
 */

'use client';


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckSquare, Square, RotateCcw, Clock, Copy, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useVoucherStore } from '@/store/useVoucherStore';
import { useOrderStore, Order, OrderItem } from '@/store/useOrderStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { BANGLADESH_DISTRICTS } from '@/lib/bangladeshDistricts';
import { formatBDT } from '@/lib/formatCurrency';
import { FREE_SHIPPING_THRESHOLD_BDT, STANDARD_DELIVERY_DHAKA, STANDARD_DELIVERY_OUTSIDE } from '@/lib/constants';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { EmptyCartView } from '@/components/cart/EmptyCartView';
import { OrderConfirmedView } from '@/components/cart/OrderConfirmedView';
import { FreeDeliveryProgressBar } from '@/components/cart/FreeDeliveryProgressBar';
import { CheckoutDeliveryForm } from '@/components/cart/CheckoutDeliveryForm';
import { CheckoutPaymentSelector } from '@/components/cart/CheckoutPaymentSelector';
import { CartCouponSection } from '@/components/cart/CartCouponSection';
import { CartPricingSummary } from '@/components/cart/CartPricingSummary';
import { dispatchOrderNotifications } from '@/lib/notificationEngine';

export default function CartPage() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    clearSelectedItems, 
    toggleItemSelection, 
    selectAllItems, 
  } = useCartStore();
  const { currentUser } = useAuthStore();
  const { addOrder } = useOrderStore();
  const { vouchers, userClaimedCodes, applyAndValidateVoucher, getVisibleVouchers } = useVoucherStore();
  const myVoucherUsage = useVoucherStore((s) => s.myVoucherUsage);
  const siteSettings = useSiteSettingsStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const insideDhakaFee = siteSettings.insideDhakaDeliveryFee ?? STANDARD_DELIVERY_DHAKA;
  const outsideDhakaFee = siteSettings.outsideDhakaDeliveryFee ?? STANDARD_DELIVERY_OUTSIDE;
  const freeShippingThreshold = siteSettings.freeShippingThreshold ?? FREE_SHIPPING_THRESHOLD_BDT;

  const [couponCode, setCouponCode] = useState('');
  const [appliedCouponCodes, setAppliedCouponCodes] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('dhaka');
  const [deliveryArea, setDeliveryArea] = useState<'inside' | 'outside'>('inside');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'card'>('cod');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isCouponSuccess, setIsCouponSuccess] = useState<boolean>(false);
  const [couponAttemptError, setCouponAttemptError] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'order-confirmed'>('cart');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [gatewayReturnOrderId, setGatewayReturnOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isCopiedOrderId, setIsCopiedOrderId] = useState<boolean>(false);
  const [isCopiedPaymentNumber, setIsCopiedPaymentNumber] = useState<boolean>(false);

  // Customer form fields
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(currentUser?.address || '');
  const [orderNotes, setOrderNotes] = useState('');

  // Mobile Banking specific fields
  const [trxId, setTrxId] = useState('');

  // Card payment specific fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Official merchant mobile numbers for direct payments
  const OFFICIAL_PAYMENT_NUMBER = '01712-345678';

  const selectedItems = useMemo(() => isMounted ? items.filter((item) => item.selected !== false) : [], [isMounted, items]);
  const subtotal = useMemo(() => isMounted ? selectedItems.reduce((total, item) => {
    const price = typeof item.customPrice === 'number' ? item.customPrice : item.product.price;
    return total + price * item.quantity;
  }, 0) : 0, [isMounted, selectedItems]);
  const isAllSelected = items.length > 0 && items.every((i) => i.selected !== false);


  const deliveryCharge = selectedItems.length === 0 
    ? 0 
    : subtotal >= freeShippingThreshold 
    ? 0 
    : deliveryArea === 'inside' 
    ? insideDhakaFee 
    : outsideDhakaFee;

  const grandTotal = Math.max(0, subtotal + deliveryCharge - appliedDiscount);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Determine allowed payment methods based on selected cart products
  const activeCartItems = selectedItems.length > 0 ? selectedItems : items;
  const allowedPaymentMethodsInCart = (() => {
    const allMethods: ('cod' | 'bkash' | 'nagad' | 'card')[] = ['cod', 'bkash', 'nagad', 'card'];
    if (activeCartItems.length === 0) return allMethods;

    // Start with the methods allowed by the first product
    const firstProd = activeCartItems[0].product;
    let currentAllowed = firstProd.allowedPaymentMethods && firstProd.allowedPaymentMethods.length > 0
      ? [...firstProd.allowedPaymentMethods]
      : [...allMethods];

    // Intersect with remaining products
    for (let i = 1; i < activeCartItems.length; i++) {
      const prod = activeCartItems[i].product;
      const prodAllowed = prod.allowedPaymentMethods && prod.allowedPaymentMethods.length > 0
        ? prod.allowedPaymentMethods
        : allMethods;
      currentAllowed = currentAllowed.filter((method) => prodAllowed.includes(method));
    }

    // In case there is no common payment method, fallback to cod
    if (currentAllowed.length === 0) {
      return ['cod'];
    }
    return currentAllowed;
  })() as ('cod' | 'bkash' | 'nagad' | 'card')[];

  // Automatically adjust selected payment method if it's not allowed for current cart contents
  useEffect(() => {
    if (!allowedPaymentMethodsInCart.includes(paymentMethod)) {
      setPaymentMethod((allowedPaymentMethodsInCart[0] || 'cod') as 'cod' | 'bkash' | 'nagad' | 'card');
    }
  }, [items, allowedPaymentMethodsInCart, paymentMethod]);

  // Prefill user details if logged in
  useEffect(() => {
    if (currentUser) {
      const defaultAddr = currentUser.savedAddresses?.find((a) => a.isDefault) || currentUser.savedAddresses?.[0];
      setCustomerName((prev) => prev || defaultAddr?.recipientName || currentUser.name || '');
      setCustomerPhone((prev) => prev || defaultAddr?.phone || currentUser.phone || '');
      setCustomerAddress((prev) => prev || defaultAddr?.address || currentUser.address || '');
      if (defaultAddr?.districtId) {
        handleDistrictChange(defaultAddr.districtId);
      }
    }
  }, [currentUser]);

  // Reset confirmation screen if user clicks checkout in cart drawer while on /cart page
  useEffect(() => {
    const handleCheckoutRequested = () => {
      setCheckoutStep('cart');
      setConfirmedOrder(null);
      setGatewayReturnOrderId(null);
      window.scrollTo({ top: 0 });
    };

    window.addEventListener('magmati:checkout-requested', handleCheckoutRequested);
    return () => {
      window.removeEventListener('magmati:checkout-requested', handleCheckoutRequested);
    };
  }, []);

  // Handle SSLCommerz payment callback status in query parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const checkoutStatus = params.get('checkout_status');
      const orderId = params.get('order_id');

      if (checkoutStatus === 'success' && orderId) {
        // Clear query parameters to make a clean interface
        window.history.replaceState({}, '', window.location.pathname);

        if (/^\d{10}$/.test(orderId)) {
          setGatewayReturnOrderId(orderId);
        }
        clearSelectedItems();
      } else if (checkoutStatus === 'failed') {
        window.history.replaceState({}, '', window.location.pathname);
        setFormError(
          'Sorry, card payment failed or was cancelled. Please try again.'
        );
      }
    }
  }, [clearSelectedItems, currentUser, customerName, customerPhone, customerAddress, grandTotal]);

  // Sync delivery area when district selection changes
  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    const foundDistrict = BANGLADESH_DISTRICTS.find((d) => d.id === districtId);
    if (foundDistrict?.isDhakaCity) {
      setDeliveryArea('inside');
    } else {
      setDeliveryArea('outside');
    }
  };

  const recalculateAllCoupons = useCallback((codes: string[]) => {
    const validCodes: string[] = [];
    let totalDiscount = 0;
    const removed: { code: string; message: string }[] = [];
    const itemCategories = selectedItems.map((i) => i.product.category);

    for (const code of codes) {
      const validation = applyAndValidateVoucher(code, subtotal, deliveryCharge, {
        isLoggedIn: !!currentUser,
        userEmail: currentUser?.email || undefined,
        paymentMethod,
        categories: itemCategories,
      });

      if (validation.isValid) {
        validCodes.push(code);
        totalDiscount += validation.discountAmount;
      } else {
        removed.push({ code, message: validation.message });
      }
    }

    if (removed.length > 0) {
      setAppliedCouponCodes(validCodes);
      setCouponAttemptError(removed.map((r) => `${r.code}: ${r.message}`).join(' | '));
    }

    if (validCodes.length > 0) {
      setAppliedDiscount(totalDiscount);
      setIsCouponSuccess(true);
      setCouponMessage(
        `Successfully applied ${validCodes.length} voucher${validCodes.length > 1 ? 's' : ''}! Total saved: ৳${totalDiscount}`
      );
    } else {
      setAppliedDiscount(0);
      setIsCouponSuccess(false);
      setCouponMessage(null);
    }
  }, [selectedItems, applyAndValidateVoucher, subtotal, deliveryCharge, currentUser, paymentMethod, myVoucherUsage]);

  const handleApplyCoupon = (e?: React.FormEvent, codeToUse?: string) => {
    if (e) e.preventDefault();
    const code = (codeToUse || couponCode).trim().toUpperCase();
    if (!code) {
      setCouponAttemptError('Please enter a coupon code.');
      return;
    }

    // Check if already applied -> toggle off
    if (appliedCouponCodes.includes(code)) {
      const remaining = appliedCouponCodes.filter(c => c !== code);
      setAppliedCouponCodes(remaining);
      setCouponAttemptError(null);
      recalculateAllCoupons(remaining);
      return;
    }

    const { maxVouchersPerOrder } = useVoucherStore.getState();
    if (appliedCouponCodes.length >= maxVouchersPerOrder) {
      if (maxVouchersPerOrder === 1) {
        const validation = applyAndValidateVoucher(code, subtotal, deliveryCharge, {
          isLoggedIn: !!currentUser,
          userEmail: currentUser?.email || undefined,
          paymentMethod,
          categories: selectedItems.map((i) => i.product.category),
        });
        if (!validation.isValid) {
          setCouponAttemptError(validation.message);
          return;
        }

        // Replace single voucher
        const newCodes = [code];
        setAppliedCouponCodes(newCodes);
        setCouponAttemptError(null);
        recalculateAllCoupons(newCodes);
        setCouponCode('');
        return;
      } else {
        setCouponAttemptError(
          `You can apply a maximum of ${maxVouchersPerOrder} vouchers together!`
        );
        return;
      }
    }

    const validation = applyAndValidateVoucher(code, subtotal, deliveryCharge, {
      isLoggedIn: !!currentUser,
      userEmail: currentUser?.email || undefined,
      paymentMethod,
      categories: selectedItems.map((i) => i.product.category),
    });
    if (!validation.isValid) {
      setCouponAttemptError(validation.message);
      return;
    }

    const newCodes = [...appliedCouponCodes, code];
    setAppliedCouponCodes(newCodes);
    setCouponAttemptError(null);
    recalculateAllCoupons(newCodes);
    setCouponCode('');
  };

  // Re-validate applied coupon if user changes payment method, login state, or cart total
  useEffect(() => {
    if (appliedCouponCodes.length > 0) {
      recalculateAllCoupons(appliedCouponCodes);
    }
  }, [paymentMethod, subtotal, deliveryCharge, currentUser, selectedItems, applyAndValidateVoucher, appliedCouponCodes, recalculateAllCoupons, myVoucherUsage]);

  useEffect(() => {
    if (couponAttemptError !== null) {
      const timer = setTimeout(() => {
        setCouponAttemptError(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [couponAttemptError]);

  const handleCopy = (text: string, type: 'orderId' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'orderId') {
      setIsCopiedOrderId(true);
      setTimeout(() => setIsCopiedOrderId(false), 2000);
    } else {
      setIsCopiedPaymentNumber(true);
      setTimeout(() => setIsCopiedPaymentNumber(false), 2000);
    }
  };

  const handleCompleteOrder = async () => {
    if (isSubmitting) return;

    if (selectedItems.length === 0) {
      setFormError(
          'Please select at least one item to proceed with checkout.'
      );
      return;
    }

    if (!customerName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    // Bangladeshi phone validation
    const cleanedPhone = customerPhone.replace(/[\s-+]/g, '').replace(/^88/, '');
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      setFormError(
          'Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).'
      );
      return;
    }

    if (!customerAddress.trim()) {
      setFormError('Please enter your full delivery address.');
      return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !trxId.trim()) {
      setFormError(
          `Please enter your ${paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Transaction ID (TrxID).`
      );
      return;
    }

    if (paymentMethod === 'card') {
      const cleanCardNo = cardNumber.replace(/\s+/g, '');
      if (!cleanCardNo || cleanCardNo.length < 15 || cleanCardNo.length > 19) {
        setFormError(
            'Please enter a valid 15 or 16-digit Card Number.'
        );
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setFormError(
            'Please enter card expiry in MM/YY format.'
        );
        return;
      }
      if (!cardCvv || cardCvv.length < 3 || cardCvv.length > 4) {
        setFormError(
            'Please enter a valid 3 or 4-digit CVV/CVC code.'
        );
        return;
      }
      if (!cardName.trim()) {
        setFormError(
            'Please enter the Cardholder Name.'
        );
        return;
      }
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      // Prepare selected items matching the OrderItem interface
      const orderItems: OrderItem[] = selectedItems.map((cartItem) => ({
        product: cartItem.product,
        quantity: cartItem.quantity,
        selectedSize: cartItem.selectedSize,
        selectedColor: cartItem.selectedColor,
        customPrice: cartItem.customPrice,
        isFreeItem: cartItem.isFreeItem,
        isComboItem: cartItem.isComboItem,
        comboId: cartItem.comboId,
        promoLabel: cartItem.promoLabel,
      }));

      const paymentLabel = 
        paymentMethod === 'bkash' ? 'bKash Online' :
        paymentMethod === 'nagad' ? 'Nagad Online' :
        paymentMethod === 'card' ? 'Debit/Credit Card' : 'Cash on Delivery';

      const activeDistrictObj = BANGLADESH_DISTRICTS.find((d) => d.id === selectedDistrict);
      const districtLabel = activeDistrictObj 
        ? (activeDistrictObj.nameEn)
        : selectedDistrict;

      const orderPayload = {
        userEmail: currentUser?.email || '',
        userName: customerName.trim(),
        total: grandTotal,
        subtotal,
        deliveryFee: deliveryCharge,
        discount: appliedDiscount,
        payment: paymentLabel,
        ...(trxId.trim() ? { trxId: trxId.trim() } : {}),
        items: orderItems,
        phone: cleanedPhone,
        address: customerAddress.trim(),
        district: districtLabel,
        ...(orderNotes.trim() ? { orderNotes: orderNotes.trim() } : {}),
        ...(isCouponSuccess && appliedCouponCodes.length > 0 ? { appliedCoupons: appliedCouponCodes } : {}),
      };

      const generatedId = await addOrder(orderPayload);
      useVoucherStore.getState().refreshMyVoucherUsage();


      if (paymentMethod === 'card') {
        const initResponse = await fetch('/api/payment/sslcommerz/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: generatedId,
            totalAmount: grandTotal,
            customerName: customerName.trim(),
            customerPhone: cleanedPhone,
            customerAddress: customerAddress.trim(),
            customerEmail: currentUser?.email || '',
          }),
        });

        const initData = await initResponse.json();

        if (initResponse.ok && initData.gatewayUrl) {
          // Redirect browser to SSLCommerz Secure Gateway page
          window.location.href = initData.gatewayUrl;
          return;
        } else {
          throw new Error(initData.error || 'Payment gateway initialization failed.');
        }
      }

      const serverOrder = useOrderStore.getState().orders.find((o) => o.id === generatedId);
      const placedOrder: Order = serverOrder || {
        ...orderPayload,
        id: generatedId,
        date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdAt: new Date().toISOString(),
        status: 'Pending',
      };

      setConfirmedOrder(placedOrder);
      setCheckoutStep('order-confirmed');
      // Only clear the selected items so unselected items remain in cart
      clearSelectedItems();

      // Non-blocking, fail-safe background notification dispatch (SMS & Email)
      dispatchOrderNotifications(placedOrder).catch((notifErr) => {
        console.warn('Notification handled gracefully in background:', notifErr);
      });
    } catch (err) {
      console.error('Order submission error:', err);
      if (err instanceof Error) {
        const lowerMsg = err.message.toLowerCase();
        if (lowerMsg.includes('use limit') || lowerMsg.includes('limit') || lowerMsg.includes('budget')) {
          useVoucherStore.getState().refreshMyVoucherUsage();
        }
      }
      if (
        err instanceof Error &&
        err.message.trim() !== '' &&
        !err.message.includes('Failed to fetch') &&
        !err.message.includes('NetworkError') &&
        !err.message.includes('Load failed') &&
        !err.message.includes('fetch')
      ) {
        setFormError(err.message);
      } else {
        setFormError(
          'Failed to process order. Please check your connection and try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (gatewayReturnOrderId) {
    return (
      <div className="min-h-screen bg-app-bg py-10 sm:py-16 px-4 animate-fade-in">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-10 shadow-xl font-sans text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Clock className="w-9 h-9 stroke-[2.5]" />
          </div>
          <span className="text-xs font-bold text-primary uppercase tracking-[0.25em]">
            {'MAGMATI ATELIER • PAYMENT PROCESSING'}
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl font-bold text-text-main mt-1.5 mb-2">
            {'Your card payment is being confirmed'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto leading-relaxed font-normal">
            We are confirming your payment with the payment gateway. You can follow your order status using the Order ID below.
          </p>

          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl inline-flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-zinc-700">#{gatewayReturnOrderId}</span>
            <button
              onClick={() => handleCopy(gatewayReturnOrderId, 'orderId')}
              className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-zinc-500" />
              <span>{isCopiedOrderId ? 'Copied!' : 'Copy ID'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/track?orderId=${encodeURIComponent(gatewayReturnOrderId)}`}
              className="flex-1 py-3.5 px-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-all text-center shadow-xs active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="text-white font-bold">{'🚀 Track Live Status'}</span>
            </Link>

            <Link
              href="/shop"
              className="flex-1 py-3.5 px-5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition-all text-center shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="text-white font-bold">{'Continue Shopping'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Real Application Order Confirmation Screen
  if (checkoutStep === 'order-confirmed' && confirmedOrder) {
    return (
      <OrderConfirmedView
        confirmedOrder={confirmedOrder}
        
        formatBDT={formatBDT}
        handleCopy={handleCopy}
        isCopiedOrderId={isCopiedOrderId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-app-bg py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb / Title */}
        <div className="mb-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{'Back to Shop'}</span>
          </Link>
          <h1 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-text-main">
            {'Shopping Cart & Checkout'}
          </h1>
          <p className="text-xs text-text-muted mt-1">
            {items.length} {'items in your cart'} • {' '}
            <span className="font-bold text-primary">
              {selectedItems.length} {'selected for checkout'}
            </span>
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyCartView  />
        ) : (
          <div className="space-y-6">
            {/* Important Returns Warning Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs animate-fade-in font-sans">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 border border-amber-400/40">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-extrabold text-amber-950 uppercase tracking-wider">
                  {'⚠️ Returns & Unboxing Requirement'}
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed font-semibold">
                  Upon receiving your parcel, please take a clear photo of the product next to the printed invoice copy right after opening. In case of any discrepancy or defect, uploading this photo is strictly REQUIRED to authorize a replacement or refund.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Items Column */}
              <div className="lg:col-span-7 space-y-6">
                {/* Free Delivery Goal Bar */}
              <FreeDeliveryProgressBar
                remainingForFreeShipping={remainingForFreeShipping}
                progressPercent={progressPercent}
                
                formatBDT={formatBDT}
              />

              {/* Select All Controls Bar */}
              <div className="bg-white rounded-2xl border border-border-color/90 px-5 py-3.5 flex items-center justify-between font-sans shadow-2xs">
                <button
                  type="button"
                  onClick={() => selectAllItems(!isAllSelected)}
                  className="flex items-center gap-2.5 text-xs font-bold text-text-main hover:text-primary transition-colors cursor-pointer"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-primary fill-primary/10 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-text-subtle shrink-0" />
                  )}
                  <span>
                    {'Select All Items'} ({items.length})
                  </span>
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-text-muted font-mono">
                    {selectedItems.length}/{items.length} {'Selected'}
                  </span>
                  {selectedItems.length < items.length && (
                    <button
                      type="button"
                      onClick={() => selectAllItems(true)}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      {'Select All'}
                    </button>
                  )}
                </div>
              </div>

              {/* Items Card List */}
              <div className="bg-white rounded-3xl border border-border-color/90 p-5 divide-y divide-zinc-100 shadow-xs overflow-hidden font-sans">
                {items.map((item) => (
                  <CartItemRow
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor.hex}${item.isFreeItem ? '-free' : ''}${item.isComboItem ? `-combo-${item.comboId || ''}` : ''}`}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    onToggleSelect={toggleItemSelection}
                  />
                ))}
              </div>
            </div>

            {/* Right Summary & Checkout Form */}
            <div className="lg:col-span-5 space-y-6 font-sans">
              {/* Delivery Address & Express Checkout Form */}
              <CheckoutDeliveryForm
                
                customerName={customerName}
                setCustomerName={setCustomerName}
                customerPhone={customerPhone}
                setCustomerPhone={setCustomerPhone}
                selectedDistrict={selectedDistrict}
                handleDistrictChange={handleDistrictChange}
                customerAddress={customerAddress}
                setCustomerAddress={setCustomerAddress}
                orderNotes={orderNotes}
                setOrderNotes={setOrderNotes}
                deliveryArea={deliveryArea}
                setDeliveryArea={setDeliveryArea}
                insideDhakaFee={insideDhakaFee}
                outsideDhakaFee={outsideDhakaFee}
                formatBDT={formatBDT}
                savedAddresses={
                  currentUser
                    ? (currentUser.savedAddresses && currentUser.savedAddresses.length > 0)
                      ? currentUser.savedAddresses
                      : currentUser.address
                      ? [{
                          id: 'default-fallback',
                          title: 'Home Address',
                          recipientName: currentUser.name || 'Valued Customer',
                          phone: currentUser.phone || '',
                          districtId: 'dhaka',
                          address: currentUser.address,
                          isDefault: true,
                        }]
                      : []
                    : []
                }
              />

              {/* Payment Method Selector */}
              <CheckoutPaymentSelector
                
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                officialPaymentNumber={OFFICIAL_PAYMENT_NUMBER}
                handleCopy={handleCopy}
                isCopiedPaymentNumber={isCopiedPaymentNumber}
                grandTotal={grandTotal}
                formatBDT={formatBDT}
                trxId={trxId}
                setTrxId={setTrxId}
                cardNumber={cardNumber}
                setCardNumber={setCardNumber}
                cardExpiry={cardExpiry}
                setCardExpiry={setCardExpiry}
                cardCvv={cardCvv}
                setCardCvv={setCardCvv}
                cardName={cardName}
                setCardName={setCardName}
                allowedMethods={allowedPaymentMethodsInCart}
              />

              {/* Coupon Form */}
              <CartCouponSection
                
                userClaimedCodes={userClaimedCodes}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                handleApplyCoupon={handleApplyCoupon}
                vouchers={getVisibleVouchers()}
                couponMessage={couponAttemptError ?? couponMessage}
                isCouponSuccess={couponAttemptError ? false : isCouponSuccess}
                subtotal={subtotal}
                appliedCouponCodes={appliedCouponCodes}
              />

              {/* Order Cost Breakdown & Confirm Button */}
              <CartPricingSummary
                
                subtotal={subtotal}
                deliveryCharge={deliveryCharge}
                appliedDiscount={appliedDiscount}
                grandTotal={grandTotal}
                formatBDT={formatBDT}
                formError={formError}
                paymentMethod={paymentMethod}
                handleCompleteOrder={handleCompleteOrder}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
