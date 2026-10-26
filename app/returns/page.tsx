/**
 * @file app/returns/page.tsx
 * @description Dedicated, production-grade product returns panel.
 */

'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  RotateCcw,
  Package,
  AlertCircle,
  Phone,
  ArrowLeft,
  ShieldCheck,
  ClipboardList,
  Check,
  Upload
} from 'lucide-react';
import type { Order } from '@/store/useOrderStore';
import { useReturnStore, ReturnRequest, ReturnedItem } from '@/store/useReturnStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { auth } from '@/lib/firebase';
import { formatBDT } from '@/lib/formatCurrency';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ReturnSuccessScreen } from '@/components/returns/ReturnSuccessScreen';
import { ReturnDetailsModal } from '@/components/returns/ReturnDetailsModal';
import { getReturnShippingFee } from '@/lib/returnPolicy';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { ReturnsRequestSection } from '@/components/returns/ReturnsRequestSection';
import { ReturnsTrackSection } from '@/components/returns/ReturnsTrackSection';
import { toast } from '@/store/useToastStore';

function ReturnsContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';
  const initialPhone = searchParams.get('phone') || '';
  const initialReturnId = searchParams.get('returnId') || '';

  const { currentUser } = useAuthStore();
  const { returnRequests, submitReturnRequest, syncWithFirestore: syncReturns } = useReturnStore();
  const siteSettings = useSiteSettingsStore();

  const getPotentialShippingFee = (order: any) => {
    return getReturnShippingFee(order);
  };

  const [activeTab, setActiveTab] = useState<'request' | 'track'>(initialReturnId ? 'track' : 'request');
  useScrollToTop(activeTab);

  // Request Tab States
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const autoLookupDone = useRef(false);

  const fetchOrderFromServer = async (
    orderId: string,
    phone: string
  ): Promise<{ order: Order | null; error: string | null }> => {
    try {
      const res = await fetch('/api/returns/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, phone }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && data?.order) {
        return { order: data.order as Order, error: null };
      }
      return {
        order: null,
        error: data?.error || 'Order not found. Please double-check your Order ID and Phone Number.',
      };
    } catch {
      return { order: null, error: 'Network error. Please try again.' };
    }
  };

  const applyFoundOrder = (found: Order) => {
    if (found.status !== 'Delivered') {
      setLookupError('Returns can only be requested for orders with "Delivered" status.');
      setMatchedOrder(null);
      return;
    }
    setMatchedOrder(found);
    setLookupError(null);
  };

  const handleLookupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim() || !phoneInput.trim()) {
      setLookupError('Please enter both Order ID and Phone Number.');
      return;
    }
    setIsLookingUp(true);
    setLookupError(null);
    const { order, error } = await fetchOrderFromServer(orderIdInput.trim(), phoneInput.trim());
    setIsLookingUp(false);
    if (error || !order) {
      setLookupError(error || 'Order lookup failed.');
      setMatchedOrder(null);
    } else {
      applyFoundOrder(order);
    }
  };

  useEffect(() => {
    if (initialOrderId && initialPhone && !autoLookupDone.current) {
      autoLookupDone.current = true;
      fetchOrderFromServer(initialOrderId, initialPhone).then(({ order, error }) => {
        if (order) applyFoundOrder(order);
        else if (error) setLookupError(error);
      });
    }
  }, [initialOrderId, initialPhone]);

  // Selected Items & Return Form
  const [selectedReturnItems, setSelectedReturnItems] = useState<Record<string, { quantity: number; reason: string; comment: string }>>({});
  const [returnImages, setReturnImages] = useState<string[]>([]);
  const [returnMethod, setReturnMethod] = useState<'bKash' | 'Bank' | 'StoreCredit'>('bKash');
  const [returnBankName, setReturnBankName] = useState('');
  const [returnAccountNo, setReturnAccountNo] = useState('');
  const [returnAccountName, setReturnAccountName] = useState('');
  const [returnBkashNo, setReturnBkashNo] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [successReturnId, setSuccessReturnId] = useState<string | null>(initialReturnId || null);
  const [matchedReturnModal, setMatchedReturnModal] = useState<ReturnRequest | null>(null);
  const [trackSearchTerm, setTrackSearchTerm] = useState('');
  const [copiedReturnId, setCopiedReturnId] = useState(false);

  const handleCopyReturnId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedReturnId(true);
    toast.success('Return ID copied to clipboard!');
    setTimeout(() => setCopiedReturnId(false), 2500);
  };

  const handleToggleSelectItem = (skuOrId: string, maxQty: number) => {
    setSelectedReturnItems((prev) => {
      const next = { ...prev };
      if (next[skuOrId]) {
        delete next[skuOrId];
      } else {
        next[skuOrId] = {
          quantity: 1,
          reason: 'Defective / Damaged',
          comment: '',
        };
      }
      return next;
    });
  };

  const handleUpdateItemQuantity = (skuOrId: string, quantity: number, maxQty: number) => {
    const validQty = Math.max(1, Math.min(quantity, maxQty));
    setSelectedReturnItems((prev) => ({
      ...prev,
      [skuOrId]: {
        ...(prev[skuOrId] || { reason: 'Defective / Damaged', comment: '' }),
        quantity: validQty,
      },
    }));
  };

  const handleUpdateItemReason = (skuOrId: string, reason: string) => {
    setSelectedReturnItems((prev) => ({
      ...prev,
      [skuOrId]: {
        ...(prev[skuOrId] || { quantity: 1, comment: '' }),
        reason,
      },
    }));
  };

  const handleUpdateItemComment = (skuOrId: string, comment: string) => {
    setSelectedReturnItems((prev) => ({
      ...prev,
      [skuOrId]: {
        ...(prev[skuOrId] || { quantity: 1, reason: 'Defective / Damaged' }),
        comment,
      },
    }));
  };

  const handleSubmitReturnRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedOrder) {
      toast.error('Please lookup and select an order first.');
      return;
    }
    const selectedEntries = Object.entries(selectedReturnItems);
    if (selectedEntries.length === 0) {
      toast.error('Please select at least one item to return.');
      return;
    }
    if (returnImages.length === 0) {
      toast.error('Please upload at least one unboxing or defect photo.');
      return;
    }

    if (returnMethod === 'bKash' && !returnBkashNo.trim()) {
      toast.error('Please enter your bKash account number for refund payout.');
      return;
    }
    if (returnMethod === 'Bank' && (!returnBankName.trim() || !returnAccountNo.trim() || !returnAccountName.trim())) {
      toast.error('Please fill in all bank account details.');
      return;
    }

    setIsSubmittingReturn(true);
    try {
      const itemsToReturn: ReturnedItem[] = selectedEntries.map(([skuOrId, data]) => {
        const foundItem = matchedOrder.items.find((i: any, idx: number) => (i.product?.id || String(idx)) === skuOrId);
        return {
          productId: foundItem?.product?.id || skuOrId,
          name: foundItem?.product?.name || 'Product item',
          image: foundItem?.product?.image || '',
          price: foundItem ? ((foundItem.customPrice ?? foundItem.product?.price) || 0) : 0,
          quantity: data.quantity,
          selectedSize: foundItem?.selectedSize || null,
          selectedColor: foundItem?.selectedColor || null,
        };
      });

      const shippingFeeDeducted = getReturnShippingFee(matchedOrder);
      const itemsTotal = itemsToReturn.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const estimatedRefund = Math.max(0, itemsTotal - shippingFeeDeducted);

      const payload = {
        orderId: matchedOrder.id,
        customerName: matchedOrder.userName || currentUser?.name || 'Valued Customer',
        phone: matchedOrder.phone || phoneInput,
        email: currentUser?.email || matchedOrder.userEmail || '',
        items: itemsToReturn,
        images: returnImages,
        refundMethod: returnMethod,
        refundDetails: {
          bankName: returnMethod === 'Bank' ? returnBankName : undefined,
          accountNumber: returnMethod === 'Bank' ? returnAccountNo : returnMethod === 'bKash' ? returnBkashNo : undefined,
          accountName: returnMethod === 'Bank' ? returnAccountName : undefined,
        },
        shippingFeeDeducted,
        estimatedRefund,
      };

      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/returns/create', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        toast.success('Return request submitted successfully!');
        setSuccessReturnId(data.returnId || 'RET-' + Date.now());
        syncReturns();
      } else {
        toast.error(data?.error || 'Failed to submit return request.');
      }
    } catch (err) {
      console.error('Return submission error:', err);
      toast.error('Network error during return submission.');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Storefront
        </Link>
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('request')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'request' ? 'bg-rose-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Request Return
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'track' ? 'bg-rose-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Track Returns ({returnRequests.length})
          </button>
        </div>
      </div>

      {successReturnId ? (
        <ReturnSuccessScreen
          successReturnId={successReturnId}
          setActiveTab={setActiveTab}
          setTrackSearchTerm={setTrackSearchTerm}
          setMatchedReturn={setMatchedReturnModal}
          copiedReturnId={copiedReturnId}
          returnRequests={returnRequests}
          handleCopyReturnId={handleCopyReturnId}
        />
      ) : activeTab === 'request' ? (
        <ReturnsRequestSection
          orderIdInput={orderIdInput}
          setOrderIdInput={setOrderIdInput}
          phoneInput={phoneInput}
          setPhoneInput={setPhoneInput}
          isLookingUp={isLookingUp}
          onLookupOrder={handleLookupOrder}
          lookupError={lookupError}
          matchedOrder={matchedOrder}
          selectedReturnItems={selectedReturnItems}
          onToggleSelectItem={handleToggleSelectItem}
          onUpdateItemQuantity={handleUpdateItemQuantity}
          onUpdateItemReason={handleUpdateItemReason}
          onUpdateItemComment={handleUpdateItemComment}
          returnImages={returnImages}
          setReturnImages={setReturnImages}
          returnBankName={returnBankName}
          setReturnBankName={setReturnBankName}
          returnAccountNo={returnAccountNo}
          setReturnAccountNo={setReturnAccountNo}
          returnAccountName={returnAccountName}
          setReturnAccountName={setReturnAccountName}
          returnBkashNo={returnBkashNo}
          setReturnBkashNo={setReturnBkashNo}
          returnMethod={returnMethod}
          setReturnMethod={setReturnMethod}
          isSubmittingReturn={isSubmittingReturn}
          onSubmitReturn={handleSubmitReturnRequest}
        />
      ) : (
        <ReturnsTrackSection
          returnRequests={returnRequests}
          setActiveTab={setActiveTab}
          setMatchedReturn={setMatchedReturnModal}
        />
      )}

      {matchedReturnModal && (
        <ReturnDetailsModal
          matchedReturn={matchedReturnModal}
          setMatchedReturn={setMatchedReturnModal}
        />
      )}
    </div>
  );
}

export default function ReturnsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
      <ReturnsContent />
    </Suspense>
  );
}
