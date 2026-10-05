/**
 * @file app/track/page.tsx
 * @description Dedicated, production-grade Live Order Tracking page.
 * Allows both registered members and guest customers to track their parcels
 * by Order ID (e.g. MGM-849201) or Mobile Phone Number.
 */

'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  PhoneCall, 
  MessageSquare,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { useOrderStore, Order } from '@/store/useOrderStore';
import { formatBDT } from '@/lib/formatCurrency';
import { getItemLineTotal } from '@/lib/itemPrice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || searchParams.get('id') || '';
  
  const { orders, syncWithFirestore } = useOrderStore();
  
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [phoneInput, setPhoneInput] = useState('');
  
  const [activeOrderId, setActiveOrderId] = useState(initialOrderId);
  const [activePhone, setActivePhone] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Sync firestore orders on mount
  useEffect(() => {
    const unsub = syncWithFirestore();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [syncWithFirestore]);

  const [remoteOrder, setRemoteOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  useEffect(() => {
    const oid = activeOrderId.trim();
    const phone = activePhone.trim();

    if (!oid || !phone) {
      setRemoteOrder(null);
      setTrackError(null);
      return;
    }

    const fetchRemoteOrder = async () => {
      setIsSearching(true);
      setTrackError(null);
      try {
        const res = await fetch(
          `/api/orders/track?orderId=${encodeURIComponent(oid)}&phone=${encodeURIComponent(phone)}`
        );
        const data = await res.json();
        if (res.ok && data.success && data.order) {
          setRemoteOrder(data.order);
        } else {
          setRemoteOrder(null);
          setTrackError(data.error || 'No order found with the provided Order ID and matching phone number.');
        }
      } catch (e) {
        setRemoteOrder(null);
        setTrackError('Failed to connect to order tracking service. Please try again.');
      } finally {
        setIsSearching(false);
      }
    };

    fetchRemoteOrder();
  }, [activeOrderId, activePhone]);

  const matchedOrder = remoteOrder;

  const searched = Boolean(activeOrderId.trim());

  const handleSearch = (oid?: string, phone?: string) => {
    setActiveOrderId(oid !== undefined ? oid : orderIdInput);
    setActivePhone(phone !== undefined ? phone : phoneInput);
  };

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  // Timeline steps computation
  const timelineSteps = useMemo(() => {
    if (!matchedOrder) return [];
    const status = matchedOrder.status;

    const steps = [
      {
        id: 'Pending',
        labelEn: 'Order Placed',
        descEn: 'We received your order and are validating details',
        icon: Package,
      },
      {
        id: 'Processing',
        labelEn: 'Processing & Quality Check',
        descEn: 'Packed carefully and prepared for courier dispatch',
        icon: Clock,
      },
      {
        id: 'Shipped',
        labelEn: 'Shipped via Courier',
        descEn: 'In transit with delivery partner (Steadfast / RedX)',
        icon: Truck,
      },
      {
        id: 'Delivered',
        labelEn: 'Successfully Delivered',
        descEn: 'Parcel handed over to customer with receipt',
        icon: CheckCircle2,
      },
    ];

    const statusRanks: Record<string, number> = {
      Pending: 0,
      Processing: 1,
      Shipped: 2,
      Delivered: 3,
      Cancelled: -1,
    };

    const currentRank = statusRanks[status] ?? 0;

    return steps.map((s, idx) => {
      const isDone = status !== 'Cancelled' && currentRank >= idx;
      const isCurrent = status !== 'Cancelled' && currentRank === idx;
      return {
        ...s,
        isDone,
        isCurrent,
      };
    });
  }, [matchedOrder]);

  return (
    <div className="min-h-screen bg-app-bg text-text-main font-sans py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Hero */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5" />
            <span>{'Live Parcel Tracker'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            {'Track Your Order Status'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
            Enter your Order ID (e.g. MGM-849201) or Phone Number to check real-time courier progress.
          </p>
        </div>

        {/* Search Box Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-sm space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Order ID Input */}
              <div className="relative">
                <label className="text-2xs font-extrabold uppercase tracking-widest text-zinc-400 block mb-1.5 ml-1">
                  {'Order ID'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={orderIdInput}
                    onChange={(e) => setOrderIdInput(e.target.value)}
                    placeholder={'e.g. MGM-746629'}
                    className="w-full h-12 pl-11 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:border-primary focus:bg-white transition-all font-mono font-bold"
                  />
                  <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Phone Number Input */}
              <div className="relative">
                <label className="text-2xs font-extrabold uppercase tracking-widest text-zinc-400 block mb-1.5 ml-1">
                  {'Phone Number / Mobile'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder={'e.g. 01712XXXXXX'}
                    className="w-full h-12 pl-11 pr-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:border-primary focus:bg-white transition-all font-mono font-bold"
                  />
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4.5 h-4.5" />
              <span>{'Verify & Track Order'}</span>
            </button>
          </form>

          {/* Quick suggestions if user has any existing orders on this device */}
          {orders.length > 0 && !matchedOrder && !searched && (
            <div className="mt-4 pt-4 border-t border-zinc-100">
              <span className="text-2xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                {'Recent orders on this device:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {orders.slice(0, 3).map((ord) => (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      setOrderIdInput(ord.id);
                      setPhoneInput(ord.phone || '');
                      handleSearch(ord.id, ord.phone || '');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-primary/10 hover:text-primary text-xs font-mono font-medium text-zinc-700 transition-colors cursor-pointer border border-zinc-200"
                  >
                    #{ord.id} ({ord.status})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Result Area */}
        {searched && !matchedOrder && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-zinc-200 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900">
                {'Order Not Found'}
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                We could not find any order matching this criteria. Please double check the Order ID or phone number from your confirmation SMS.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/shop"
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-primary-hover transition-colors"
              >
                {'Browse Store'}
              </Link>
              <a
                href="tel:+8809612445566"
                className="px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition-colors flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-primary" />
                <span>{'Call 24/7 Helpline'}</span>
              </a>
            </div>
          </div>
        )}

        {matchedOrder && (
          <div className="space-y-6">
            
            {/* Order Status Banner */}
            <div className={`rounded-3xl p-6 sm:p-8 border shadow-sm ${
              matchedOrder.status === 'Cancelled'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : matchedOrder.status === 'Delivered'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-white border-zinc-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      {'Order ID:'}
                    </span>
                    <span className="text-base sm:text-lg font-extrabold font-mono text-zinc-900">
                      #{matchedOrder.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyOrderId(matchedOrder.id)}
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                      title="Copy ID"
                    >
                      {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    {'Placed on: '}
                    <strong>{matchedOrder.date || matchedOrder.createdAt}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    matchedOrder.status === 'Delivered'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : matchedOrder.status === 'Cancelled'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : matchedOrder.status === 'Shipped'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-primary text-white shadow-xs'
                  }`}>
                    {matchedOrder.status}
                  </span>
                </div>
              </div>

              {/* Step-by-Step Delivery Timeline */}
              {matchedOrder.status !== 'Cancelled' ? (
                <div className="pt-6">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-6">
                    {'Delivery Progress'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                    {timelineSteps.map((step, idx) => {
                      const StepIcon = step.icon;
                      return (
                        <div key={step.id} className="flex sm:flex-col items-start sm:items-center gap-3.5 sm:gap-2 sm:text-center relative">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                            step.isCurrent
                              ? 'bg-primary text-white ring-4 ring-primary/20 shadow-sm'
                              : step.isDone
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                          }`}>
                            <StepIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={`text-xs font-bold ${
                              step.isCurrent ? 'text-primary' : step.isDone ? 'text-zinc-900' : 'text-zinc-400'
                            }`}>
                              {step.labelEn}
                            </p>
                            <p className="text-2xs text-zinc-500 mt-0.5 max-w-[160px]">
                              {step.descEn}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="pt-4 text-center">
                  <p className="text-xs font-medium text-rose-700">
                    This order has been cancelled. For any inquiries, please contact our customer support.
                  </p>
                </div>
              )}
            </div>

            {/* Delivery & Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{'Shipping Address'}</span>
                </div>
                <div className="space-y-1 text-xs text-zinc-600">
                  <p className="font-bold text-zinc-900">{matchedOrder.userName}</p>
                  <p className="flex items-center gap-1.5 text-zinc-500">
                    <Phone className="w-3 h-3" />
                    <span>{matchedOrder.phone}</span>
                  </p>
                  <p className="pt-1">{matchedOrder.address}</p>
                  {matchedOrder.district && (
                    <p className="text-2xs font-bold uppercase text-zinc-400 tracking-wider">
                      {'District: '} {matchedOrder.district}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{'Payment Details'}</span>
                </div>
                <div className="space-y-1 text-xs text-zinc-600">
                  <p>
                    <span className="text-zinc-400">{'Method: '}</span>
                    <strong className="text-zinc-900 capitalize">{matchedOrder.payment || matchedOrder.paymentMethod}</strong>
                  </p>
                  {matchedOrder.trxId && (
                    <p className="font-mono text-2xs text-zinc-500">
                      TrxID: <strong>{matchedOrder.trxId}</strong>
                    </p>
                  )}
                  <p>
                    <span className="text-zinc-400">{'Grand Total: '}</span>
                    <strong className="text-primary font-mono text-sm">{formatBDT(matchedOrder.total)}</strong>
                  </p>
                  <p className="text-2xs text-emerald-600 font-bold flex items-center gap-1 pt-1">
                    <Check className="w-3 h-3" />
                    <span>{'Cash on Delivery / Verified'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span>{'Order Items'} ({matchedOrder.items?.length || 0})</span>
              </h4>

              <div className="divide-y divide-zinc-100">
                {matchedOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                    <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                      {(item.product?.image || item.product?.images?.[0]) ? (
                        <Image
                          src={item.product?.image || item.product?.images?.[0] || ''}
                          alt={item.product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/product/${item.product.id}`}
                        className="text-xs font-bold text-zinc-900 hover:text-primary transition-colors truncate block"
                      >
                        {item.product.name}
                      </Link>
                      <div className="flex items-center gap-2 text-2xs text-zinc-500 mt-0.5">
                        {item.selectedSize && <span>Size: <strong>{item.selectedSize}</strong></span>}
                        {item.selectedColor && (
                          <span className="flex items-center gap-1">
                            <span 
                              className="w-2 h-2 rounded-full inline-block border border-zinc-300"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            {item.selectedColor.name}
                          </span>
                        )}
                        <span>Qty: <strong>{item.quantity}</strong></span>
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs font-bold text-zinc-900">
                      {formatBDT(getItemLineTotal(item))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="pt-3 border-t border-zinc-100 space-y-1.5 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>{'Subtotal'}</span>
                  <span className="font-mono font-medium text-zinc-900">
                    {formatBDT(matchedOrder.subtotal ?? matchedOrder.total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{'Delivery Charge'}</span>
                  <span className="font-mono font-medium text-zinc-900">
                    {matchedOrder.deliveryFee === 0 ? ('FREE') : formatBDT(matchedOrder.deliveryFee || 0)}
                  </span>
                </div>
                {Boolean(matchedOrder.discount && matchedOrder.discount > 0) && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>{'Discount'}</span>
                    <span className="font-mono">-{formatBDT(matchedOrder.discount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-zinc-200 text-sm font-bold text-zinc-900">
                  <span>{'Total'}</span>
                  <span className="font-mono text-primary">{formatBDT(matchedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Assistance Card */}
            <div className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold">
                  {'Have Questions About Your Delivery?'}
                </h4>
                <p className="text-xs text-zinc-400">
                  Our dedicated care team is available 24/7 to assist with updates and requests.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href="tel:+8809612445566"
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>09612-445566</span>
                </a>
                <Link
                  href="/shop"
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all"
                >
                  {'Shop More'}
                </Link>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60dvh] flex flex-col items-center justify-center p-8">
        <LoadingSpinner size="lg" text="Loading order information..." subtext="Please wait a moment" />
      </div>
    }>
      <OrderTrackingContent />
    </Suspense>
  );
}
