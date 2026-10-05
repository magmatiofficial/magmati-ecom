/**
 * @file app/returns/page.tsx
 * @description Dedicated, production-grade product returns panel.
 * Features:
 * - Guest & registered customer verification using Order ID and Phone Number.
 * - Dynamic return reasons dropdown filtered based on the category of returning products.
 * - Cloudinary-integrated multiple returns image uploader under the 'returns' folder.
 * - Enforces required unboxing/billing images to proceed with submission.
 * - Allows tracking of return status with image previews.
 */

'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { 
  RotateCcw, 
  Search, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  HelpCircle, 
  ArrowLeft, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  DollarSign, 
  ClipboardList,
  Check,
  Copy,
  Upload,
  Trash2,
  Image as ImageIcon,
  ZoomIn,
  X,
  Eye,
  Truck
} from 'lucide-react';
import { useOrderStore, Order, OrderItem } from '@/store/useOrderStore';
import { useReturnStore, ReturnRequest, ReturnedItem } from '@/store/useReturnStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { auth } from '@/lib/firebase';
import { formatBDT } from '@/lib/formatCurrency';
import { getItemUnitPrice, getItemLineTotal } from '@/lib/itemPrice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ResponsiveTableContainer } from '@/components/ui/ResponsiveTableContainer';
import { isPhoneMatching, isValidBDPhone } from '@/lib/phoneUtils';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { ReturnPolicyNotice } from '@/components/returns/ReturnPolicyNotice';
import { getReturnShippingFee } from '@/lib/returnPolicy';
import { OUTSIDE_DHAKA_DELIVERY_FEE_BDT } from '@/lib/constants';

function getReturnShippingDisplay(req: ReturnRequest) {
  const prodSubtotal = req.items?.reduce((s, i) => s + getItemLineTotal(i), 0) || (req.refundSubtotal ?? 0);

  if (req.status === 'Rejected') {
    return {
      type: 'rejected' as const,
      deduction: 0,
      subtotal: prodSubtotal,
      netRefund: 0,
      note: 'রিটার্ন বাতিল করা হয়েছে, কোনো রিফান্ড নেই',
    };
  }

  if (req.shippingReview === 'applied') {
    const deduction = typeof req.shippingDeduction === 'number' && req.shippingDeduction > 0
      ? req.shippingDeduction
      : (req.potentialShippingDeduction || 0);
    const netRefund = typeof req.refundTotal === 'number' ? req.refundTotal : Math.max(0, prodSubtotal - deduction);
    return {
      type: 'applied' as const,
      deduction,
      subtotal: prodSubtotal,
      netRefund,
      note: 'শিপিং চার্জ কাটা হয়েছে',
    };
  }

  if (req.shippingReview === 'waived') {
    return {
      type: 'waived' as const,
      deduction: 0,
      subtotal: prodSubtotal,
      netRefund: typeof req.refundTotal === 'number' ? req.refundTotal : prodSubtotal,
      note: 'শিপিং চার্জ মওকুফ করা হয়েছে (আমরা বহন করেছি)',
    };
  }

  if (req.shippingReview === 'pending') {
    return {
      type: 'pending' as const,
      deduction: 0,
      subtotal: prodSubtotal,
      netRefund: prodSubtotal,
      note: 'Pending Review: if our team finds no problem with the product, the delivery charge will be deducted.',
    };
  }

  // Fallback for old records where shippingReview is missing
  const isMindChange = req.reason.toLowerCase().includes('mind') || req.reason.toLowerCase().includes('changed');
  const deduction = (typeof req.shippingDeduction === 'number' && req.shippingDeduction > 0)
    ? req.shippingDeduction
    : (isMindChange ? (req.potentialShippingDeduction || 0) : 0);
  const netRefund = typeof req.refundTotal === 'number' ? req.refundTotal : Math.max(0, prodSubtotal - deduction);

  return {
    type: isMindChange ? ('applied' as const) : ('pending' as const),
    deduction,
    subtotal: prodSubtotal,
    netRefund,
    note: isMindChange
      ? 'শিপিং চার্জ কাটা হয়েছে'
      : 'Pending Review: if our team finds no problem with the product, the delivery charge will be deducted.',
  };
}

function ReturnsContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';
  const initialPhone = searchParams.get('phone') || '';
  const initialReturnId = searchParams.get('returnId') || '';

  const { currentUser } = useAuthStore();
  const { orders, syncWithFirestore: syncOrders } = useOrderStore();
  const { returnRequests, submitReturnRequest, syncWithFirestore: syncReturns } = useReturnStore();
  const siteSettings = useSiteSettingsStore();

  const getPotentialShippingFee = (order: any) => {
    return getReturnShippingFee(order);
  };

  const [activeTab, setActiveTab] = useState<'request' | 'track'>(initialReturnId ? 'track' : 'request');

  // Request Tab States
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Return Form States
  const [selectedItems, setSelectedItems] = useState<Record<string, { selected: boolean; quantity: number }>>({});
  const [returnReason, setReturnReason] = useState('');
  const [customReasonText, setCustomReasonText] = useState('');
  const [detailedReason, setDetailedReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('bKash');
  const [refundDetails, setRefundDetails] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [walletNumber, setWalletNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReturnId, setSuccessReturnId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Returns Multiple Image Upload States
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Tracking Tab States
  const [trackSearchTerm, setTrackSearchTerm] = useState('');
  const [matchedReturn, setMatchedReturn] = useState<ReturnRequest | null>(null);
  const [copiedReturnId, setCopiedReturnId] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Auto-filter return requests for customer
  const filteredReturnRequests = useMemo(() => {
    return returnRequests.filter((r) => {
      if (currentUser) {
        const matchesUser = (currentUser.email && r.email.toLowerCase() === currentUser.email.toLowerCase()) || 
                            (currentUser.phone && isPhoneMatching(r.phone, currentUser.phone));
        if (!matchesUser) return false;
      }

      if (!trackSearchTerm.trim()) return true;
      const q = trackSearchTerm.toLowerCase().trim();
      return (
        r.id.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        r.items.some(i => i.name.toLowerCase().includes(q))
      );
    });
  }, [returnRequests, currentUser, trackSearchTerm]);

  // Sync state with cloud Firestore
  useEffect(() => {
    const unsubOrders = syncOrders();
    const unsubReturns = syncReturns();
    return () => {
      if (typeof unsubOrders === 'function') unsubOrders();
      if (typeof unsubReturns === 'function') unsubReturns();
    };
  }, [syncOrders, syncReturns]);

  // Auto-lookup if query params are present and orders are synced
  useEffect(() => {
    if (initialOrderId && initialPhone && orders.length > 0 && !matchedOrder) {
      setOrderIdInput(initialOrderId);
      setPhoneInput(initialPhone);
      
      const oid = initialOrderId.trim().toUpperCase();
      const phone = initialPhone.trim().replace(/[\s-+]/g, '').replace(/^88/, '');
      
      const found = orders.find((o) => {
        const orderIdClean = o.id.toUpperCase().replace(/^mgm-?/i, '').replace(/[\s-]/g, '');
        const searchIdClean = oid.replace(/^mgm-?/i, '').replace(/[\s-]/g, '');
        return (o.id.toUpperCase() === oid || orderIdClean === searchIdClean) && isPhoneMatching(o.phone, phone);
      });

      if (found) {
        if (found.status !== 'Delivered') {
          setLookupError(
            `Sorry, this order has not been delivered yet (Current Status: ${found.status}). Return requests are only allowed for delivered orders.`
          );
        } else {
          setMatchedOrder(found);
          const initialSelection: Record<string, { selected: boolean; quantity: number }> = {};
          found.items.forEach((item, idx) => {
            const key = `${item.product.id}__${idx}`;
            initialSelection[key] = { selected: false, quantity: 1 };
          });
          setSelectedItems(initialSelection);
        }
      }
    }
  }, [initialOrderId, initialPhone, orders, matchedOrder]);

  // Handle Order Lookup
  const handleOrderLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setMatchedOrder(null);
    setSuccessReturnId(null);
    setUploadedImages([]);

    const oid = orderIdInput.trim().toUpperCase();
    const phone = phoneInput.trim().replace(/[\s-+]/g, '').replace(/^88/, '');

    if (!oid || !phone) {
      setLookupError('Please enter both Order ID and Phone Number.');
      return;
    }

    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(phone)) {
      setLookupError('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712XXXXXX).');
      return;
    }

    setIsLookingUp(true);

    setTimeout(() => {
      const found = orders.find((o) => {
        const orderIdClean = o.id.toUpperCase().replace(/^mgm-?/i, '').replace(/[\s-]/g, '');
        const searchIdClean = oid.replace(/^mgm-?/i, '').replace(/[\s-]/g, '');
        return (o.id.toUpperCase() === oid || orderIdClean === searchIdClean) && isPhoneMatching(o.phone, phone);
      });

      setIsLookingUp(false);

      if (found) {
        if (found.status !== 'Delivered') {
          setLookupError(
            `Sorry, this order has not been delivered yet (Current Status: ${found.status}). Return requests are only allowed for delivered orders.`
          );
        } else {
          // Check return window days allowed by Admin Policy
          const deliveryDate = found.createdAt ? new Date(found.createdAt) : new Date();
          const daysElapsed = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
          const allowedDays = siteSettings.returnWindowDays || 7;

          if (daysElapsed > allowedDays) {
            setLookupError(
              `Sorry, the return policy window of ${allowedDays} days has expired for this order (Delivered ${daysElapsed} days ago).`
            );
          } else {
            setMatchedOrder(found);
            const initialSelection: Record<string, { selected: boolean; quantity: number }> = {};
            found.items.forEach((item, idx) => {
              const key = `${item.product.id}__${idx}`;
              initialSelection[key] = { selected: false, quantity: 1 };
            });
            setSelectedItems(initialSelection);
          }
        }
      } else {
        setLookupError('Order not found. Please double-check your Order ID and Phone Number.');
      }
    }, 600);
  };

  // Toggle Item checkbox for return
  const handleItemSelectToggle = (key: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        selected: !prev[key].selected,
      },
    }));
  };

  // Adjust return quantity
  const handleReturnQtyChange = (key: string, maxQty: number, value: number) => {
    const safeVal = Math.max(1, Math.min(maxQty, value));
    setSelectedItems((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        quantity: safeVal,
      },
    }));
  };

  // Extract returning categories to provide context-aware reasons
  const returningCategories = useMemo(() => {
    if (!matchedOrder) return [];
    return Object.keys(selectedItems)
      .filter((key) => selectedItems[key].selected)
      .map((key) => {
        const [productId, idxStr] = key.split('__');
        const idx = parseInt(idxStr, 10);
        return matchedOrder.items[idx]?.product?.category || '';
      });
  }, [selectedItems, matchedOrder]);

  // Get dynamic return reasons based on selected items' categories
  const dynamicReasonsList = useMemo(() => {
    const hasFashion = returningCategories.some((cat) => cat.toLowerCase().includes('fashion') || cat.toLowerCase().includes('wear'));
    const hasTech = returningCategories.some((cat) => cat.toLowerCase().includes('gadget') || cat.toLowerCase().includes('electron') || cat.toLowerCase().includes('tech'));
    const hasAppliances = returningCategories.some((cat) => cat.toLowerCase().includes('appliance') || cat.toLowerCase().includes('kitchen'));

    let reasons: { val: string; en: string }[] = [];

    if (hasTech) {
      reasons = [
        { val: 'Not turning on', en: 'Device not turning on / Power issue' },
        { val: 'Bluetooth connection issue', en: 'Bluetooth / Wireless connectivity issue' },
        { val: 'Charging issue', en: 'Not charging / Battery defect' },
        { val: 'Display issue', en: 'Display blank / Screen lines defect' },
        { val: 'Broken/Physical damage', en: 'Physically broken or cracked on arrival' },
      ];
    } else if (hasFashion) {
      reasons = [
        { val: 'Wrong Size', en: 'Wrong Size received / Fit issue' },
        { val: 'Fitting issue', en: 'Fit issue / Bad cut or drape' },
        { val: 'Color/fabric defect', en: 'Color or fabric defect (stains, holes, running color)' },
        { val: 'Stitching issue', en: 'Loose thread or stitching defect' },
        { val: 'Damaged in transit', en: 'Cloth damaged in transit bag' },
      ];
    } else if (hasAppliances) {
      reasons = [
        { val: 'Not working properly', en: 'Appliance motor or heating not working' },
        { val: 'Body damage/crack', en: 'Plastic body cracked or chipped shell' },
        { val: 'Missing accessory', en: 'Missing box accessory or parts' },
        { val: 'Defective heater/plug', en: 'Defective heating coil or power cord' },
      ];
    }

    // Always append universal reasons
    reasons.push(
      { val: 'Incorrect Item Sent', en: 'Completely incorrect product sent instead' },
      { val: 'Product not as described', en: 'Product differs from website images' }
    );

    if (siteSettings.allowMindChangeReturns !== false) {
      reasons.push({ val: 'Changed My Mind', en: 'No longer needed / Changed my mind' });
    }

    reasons.push({ val: 'Other', en: 'Other issue (Explain in detail below)' });

    return reasons;
  }, [returningCategories, siteSettings.allowMindChangeReturns]);

  // Set default reason when list changes only if current reason is unset or invalid
  useEffect(() => {
    if (dynamicReasonsList.length > 0) {
      setReturnReason((prev) => {
        if (!prev || !dynamicReasonsList.some((r) => r.val === prev)) {
          return dynamicReasonsList[0].val;
        }
        return prev;
      });
    }
  }, [dynamicReasonsList]);

  // Handle Multiple Images Upload
  const handleMultipleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Safety limit of 5MB per file
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Each file size must be less than 5MB.');
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'return_evidence');
      if (matchedOrder?.id) formData.append('orderId', matchedOrder.id);
      if (matchedOrder?.phone) formData.append('phone', matchedOrder.phone);

      try {
        const token = await auth.currentUser?.getIdToken();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers,
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          urls.push(data.url);
        } else {
          console.error('Image upload failed:', data.error);
          setUploadError(data.error || 'Failed to upload image.');
        }
      } catch (err) {
        console.error('Error uploading image:', err);
        setUploadError('Network error during upload.');
      }
    }

    setUploadedImages((prev) => [...prev, ...urls]);
    setIsUploading(false);
    e.target.value = '';
  };

  const handleRemoveUploadedImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Handle Return Form Submission
  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedOrder) return;
    setFormError(null);

    const selectedKeys = Object.keys(selectedItems).filter((key) => selectedItems[key].selected);
    if (selectedKeys.length === 0) {
      setFormError('Please select at least one item to return.');
      return;
    }

    // Image Upload requirement check based on Admin Policy
    if (siteSettings.requirePhotoUpload && uploadedImages.length === 0) {
      setFormError('Invoice & product photos are strictly required by store return policy.');
      return;
    }

    // Enforce detailed reason if "Other" is selected
    const isOtherReason = returnReason.includes('Other');
    if (isOtherReason) {
      if (!customReasonText.trim()) {
        setFormError('Please specify the custom return reason.');
        return;
      }
      if (!detailedReason.trim() || detailedReason.trim().length < 10) {
        setFormError('For "Other" reasons, please explain the issue in the "Additional Explanation" field (minimum 10 characters).');
        return;
      }
    }

    // Dynamic refund method validation
    let finalRefundDetails = '';
    if (refundMethod === 'Bank Transfer') {
      if (!bankName.trim() || !bankBranch.trim() || !accountName.trim() || !accountNumber.trim()) {
        setFormError('For bank transfers, Bank Name, Branch, Account Name, and Account Number are all strictly required.');
        return;
      }
      finalRefundDetails = `Bank: ${bankName.trim()} | Branch: ${bankBranch.trim()} | Name: ${accountName.trim()} | A/C No: ${accountNumber.trim()}`;
    } else {
      const cleanWallet = walletNumber.trim().replace(/[\s-+]/g, '').replace(/^88/, '');
      const bdMobileRegex = /^01[3-9]\d{8}$/;

      if (!bdMobileRegex.test(cleanWallet)) {
        setFormError(`"${walletNumber}" is not a valid Bangladeshi mobile number. Please enter a valid 11-digit ${refundMethod} number starting with 013-019 (e.g., 017XXXXXXXX).`);
        return;
      }

      if (/^(\d)\1{10}$/.test(cleanWallet)) {
        setFormError(`"${walletNumber}" is an invalid repeated number sequence. Please enter your real ${refundMethod} mobile number.`);
        return;
      }

      finalRefundDetails = `${refundMethod} Personal: ${cleanWallet}`;
    }

    setIsSubmitting(true);

    try {
      const itemsToReturn: ReturnedItem[] = selectedKeys.map((key) => {
        const [productId, idxStr] = key.split('__');
        const idx = parseInt(idxStr, 10);
        const orderItem = matchedOrder.items[idx];
        const selection = selectedItems[key];

        return {
          productId,
          name: orderItem.product.name,
          quantity: selection.quantity,
          price: getItemUnitPrice(orderItem),
          image: orderItem.product.image || orderItem.product.images?.[0] || '',
          selectedColor: orderItem.selectedColor,
          selectedSize: orderItem.selectedSize,
        };
      });

      const finalReason = isOtherReason ? `Other: ${customReasonText.trim()}` : returnReason;
      const isMindChange = finalReason.toLowerCase().includes('mind') || finalReason.toLowerCase().includes('changed');

      const potentialFee = getPotentialShippingFee(matchedOrder);
      const shippingDeduction = isMindChange ? potentialFee : 0;
      const shippingReview: 'applied' | 'pending' = isMindChange ? 'applied' : 'pending';
      const refundSubtotal = itemsToReturn.reduce((sum, item) => sum + getItemLineTotal(item), 0);
      const refundTotal = Math.max(0, refundSubtotal - shippingDeduction);

      const returnId = await submitReturnRequest({
        orderId: matchedOrder.id,
        phone: matchedOrder.phone,
        email: matchedOrder.userEmail || '',
        customerName: matchedOrder.userName,
        reason: finalReason,
        detailedReason: detailedReason.trim(),
        paymentMethod: refundMethod,
        paymentDetails: finalRefundDetails,
        items: itemsToReturn,
        images: uploadedImages, // Array of secure Cloudinary URLs
        shippingDeduction,
        shippingReview,
        potentialShippingDeduction: potentialFee,
        refundSubtotal,
        refundTotal,
      });

      setSuccessReturnId(returnId);
      setMatchedOrder(null);
      setOrderIdInput('');
      setPhoneInput('');
      setDetailedReason('');
      setRefundDetails('');
      setBankName('');
      setBankBranch('');
      setAccountName('');
      setAccountNumber('');
      setWalletNumber('');
      setCustomReasonText('');
    } catch (err: any) {
      console.error('Error submitting return request:', err);
      setFormError(err.message || 'Failed to submit return request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReturnId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedReturnId(true);
    setTimeout(() => setCopiedReturnId(false), 2000);
  };

  return (
    <div className="min-h-screen bg-app-bg text-text-main font-sans py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Navigation Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-primary transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{'Back to Storefront'}</span>
          </Link>

          <Link
            href="/track"
            className="text-xs text-primary font-bold hover:underline"
          >
            {'Order Tracking Panel →'}
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{'Returns & Exchange HQ'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            {siteSettings.returnPageTitle || 'Request Product Return'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
            {siteSettings.returnPageSubtitle || 'Submit a return request within the allowed policy window for a fast refund or replacement.'}
          </p>
        </div>

        {/* Master Enabled Check Notice */}
        {!siteSettings.enableReturns && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-rose-900">
                {'Product Returns Suspended'}
              </h3>
              <p className="text-xs text-rose-700 max-w-md mx-auto leading-relaxed">
                {'Online return request submissions are currently paused by administration. Please contact customer support for assistance.'}
              </p>
            </div>
          </div>
        )}

        {/* Unboxing Notice Strip */}
        {siteSettings.enableReturns && siteSettings.showUnboxingNotice && siteSettings.unboxingNoticeText && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 sm:p-5 flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <RotateCcw className="w-4.5 h-4.5" />
            </div>
            <p className="text-xs text-amber-800 leading-relaxed font-semibold">
              {siteSettings.unboxingNoticeText}
            </p>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 bg-zinc-100 p-1 rounded-2xl border border-zinc-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('request');
              setLookupError(null);
            }}
            className={`py-3 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'request'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{'New Return'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('track');
              setLookupError(null);
            }}
            className={`py-3 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'track'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>{'Track Return'}</span>
          </button>
        </div>

        {/* TAB 1: SUBMIT NEW RETURN REQUEST */}
        {activeTab === 'request' && (
          <div className="space-y-6">
            
            {/* Success Screen */}
            {successReturnId && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200 shadow-md text-center space-y-5 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 ring-4 ring-emerald-50">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900">
                    {'Return Request Submitted Successfully!'}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                    {'Your return request has been submitted. Our support representative will contact you shortly to arrange pickup.'}
                  </p>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 max-w-sm mx-auto flex items-center justify-between gap-3">
                  <div className="text-left">
                    <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest block">
                      {'Return Request ID:'}
                    </span>
                    <strong className="text-base sm:text-lg font-black font-mono text-zinc-900">
                      {successReturnId}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyReturnId(successReturnId)}
                    className="h-10 px-4 rounded-xl border border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedReturnId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{'Copy'}</span>
                  </button>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (successReturnId) setTrackSearchTerm(successReturnId);
                      setActiveTab('track');
                      setTimeout(() => {
                        const found = returnRequests.find(r => r.id === successReturnId);
                        if (found) {
                          setMatchedReturn(found);
                        }
                      }, 100);
                    }}
                    className="w-full sm:w-auto px-6 h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>{'Track Status'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    href="/"
                    className="w-full sm:w-auto px-6 h-12 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold uppercase tracking-wider flex items-center justify-center cursor-pointer"
                  >
                    {'Back to Shop'}
                  </Link>
                </div>
              </div>
            )}

            {/* Step 1: Order Lookup form */}
            {!matchedOrder && !successReturnId && (
              <div className="bg-white rounded-3xl p-5 sm:p-8 border border-zinc-200 shadow-sm space-y-5">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-zinc-900">
                    {'1. Verify Order Details'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {'Please verify your original Order ID and shipping mobile number to proceed.'}
                  </p>
                </div>

                <form onSubmit={handleOrderLookup} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 block mb-1">
                        {'Order ID:'}
                      </label>
                      <input
                        type="text"
                        required
                        value={orderIdInput}
                        onChange={(e) => setOrderIdInput(e.target.value)}
                        placeholder="MGM-849201"
                        className="w-full h-11 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm placeholder-zinc-400 focus:outline-hidden focus:border-primary focus:bg-white text-zinc-900 uppercase font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 block mb-1">
                        {'Mobile Phone:'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="017XXXXXXXX"
                        maxLength={15}
                        className="w-full h-11 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm placeholder-zinc-400 focus:outline-hidden focus:border-primary focus:bg-white text-zinc-900 font-bold font-mono"
                      />
                    </div>
                  </div>

                  {lookupError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{lookupError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLookingUp}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLookingUp ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>{'Verify Order'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Main Return Request Form */}
            {matchedOrder && (
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden animate-slide-up">
                
                {/* Header info bar */}
                <div className="bg-zinc-50 border-b border-zinc-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest block">
                      {'VERIFIED ORDER'}
                    </span>
                    <strong className="text-sm font-extrabold font-mono text-zinc-900">
                      #{matchedOrder.id}
                    </strong>
                    <span className="text-xs text-zinc-500 ml-2">
                      ({matchedOrder.date || matchedOrder.createdAt})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMatchedOrder(null)}
                    className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{'Change Order'}</span>
                  </button>
                </div>

                <form onSubmit={handleReturnSubmit} className="p-5 sm:p-8 space-y-6">
                  
                  {/* Select Items to Return */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-zinc-850 block mb-1">
                      {'Select Items to Return:'}
                    </label>

                    <div className="space-y-3.5">
                      {matchedOrder.items?.map((item, idx) => {
                        const key = `${item.product.id}__${idx}`;
                        const selection = selectedItems[key] || { selected: false, quantity: 1 };

                        return (
                          <div 
                            key={key} 
                            className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border transition-all duration-200 select-none ${
                              selection.selected 
                                ? 'bg-primary/[0.02] border-primary shadow-xs' 
                                : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-3xs'
                            }`}
                          >
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              {/* Checkbox wrapper */}
                              <div className="pt-2 flex items-center justify-center shrink-0">
                                <input
                                  type="checkbox"
                                  id={key}
                                  checked={selection.selected}
                                  onChange={() => handleItemSelectToggle(key)}
                                  className="w-5 h-5 text-primary border-zinc-300 rounded-md focus:ring-primary focus:ring-offset-0 cursor-pointer accent-primary"
                                />
                              </div>

                              {/* Beautiful Square Product Image */}
                              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-50 border border-zinc-150 shrink-0 shadow-2xs">
                                {(item.product.image || item.product.images?.[0]) ? (
                                  <Image
                                    src={item.product.image || item.product.images?.[0] || ''}
                                    alt={item.product.name}
                                    fill
                                    sizes="(max-width: 640px) 64px, 80px"
                                    className="object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                    <Package className="w-6 h-6" />
                                  </div>
                                )}
                              </div>

                              {/* Product Title and Details without truncation */}
                              <div className="flex-1 min-w-0">
                                <label 
                                  htmlFor={key} 
                                  className="text-sm sm:text-base font-bold text-zinc-900 block leading-snug cursor-pointer hover:text-primary transition-colors whitespace-normal"
                                >
                                  {item.product.name}
                                </label>
                                
                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-2 text-xs text-zinc-500 font-medium">
                                  {item.selectedSize && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-xs font-bold">
                                      {'Size:'} {item.selectedSize}
                                    </span>
                                  )}
                                  {item.selectedColor && (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-xs font-bold">
                                      <span className="w-2.5 h-2.5 rounded-full inline-block border border-black/10" style={{ backgroundColor: item.selectedColor.hex }} />
                                      <span>{item.selectedColor.name}</span>
                                    </span>
                                  )}
                                  <span className="text-zinc-500 font-semibold">
                                    {'Ordered Qty:'} <strong className="text-zinc-800 font-bold font-mono">{item.quantity}</strong>
                                  </span>
                                </div>

                                {/* Custom Return Qty selector */}
                                {selection.selected && item.quantity > 1 && (
                                  <div className="flex items-center gap-2 mt-3 p-1 rounded-xl bg-zinc-50 border border-zinc-150 inline-flex">
                                    <span className="text-2xs text-zinc-500 font-bold uppercase tracking-wider ml-1.5">
                                      {'Qty:'}
                                    </span>
                                    <div className="flex items-center border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-3xs">
                                      <button
                                        type="button"
                                        onClick={() => handleReturnQtyChange(key, item.quantity, selection.quantity - 1)}
                                        className="w-7 h-7 flex items-center justify-center text-xs font-bold text-zinc-500 hover:bg-zinc-100 transition-colors select-none"
                                      >
                                        -
                                      </button>
                                      <span className="w-8 h-7 text-xs font-bold font-mono flex items-center justify-center text-zinc-950 border-x border-zinc-200 bg-zinc-50/20">
                                        {selection.quantity}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleReturnQtyChange(key, item.quantity, selection.quantity + 1)}
                                        className="w-7 h-7 flex items-center justify-center text-xs font-bold text-zinc-500 hover:bg-zinc-100 transition-colors select-none"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Price display with responsive layout */}
                            <div className="flex sm:flex-col justify-between items-center sm:items-end gap-1 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 mt-1 sm:mt-0 shrink-0">
                              <span className="text-2xs text-zinc-400 font-bold uppercase tracking-wider sm:hidden">
                                {'Price'}
                              </span>
                              <div className="text-sm sm:text-base font-extrabold text-zinc-900 font-mono">
                                {formatBDT(getItemUnitPrice(item))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Return Reason, Method & Refund details */}
                  <div className="space-y-4 pt-1 border-t border-zinc-100">
                    <ReturnPolicyNotice />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <CustomDropdown
                          label="Primary Reason:"
                          value={returnReason}
                          onChange={setReturnReason}
                          options={dynamicReasonsList.map((reason) => ({
                            value: reason.val,
                            label: reason.val,
                          }))}
                          triggerClassName="h-11 font-semibold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <CustomDropdown
                          label="Refund Payment Method:"
                          value={refundMethod}
                          onChange={setRefundMethod}
                          options={[
                            ...(siteSettings.enableBkashRefund ? [{ value: 'bKash', label: 'bKash Personal' }] : []),
                            ...(siteSettings.enableNagadRefund ? [{ value: 'Nagad', label: 'Nagad Personal' }] : []),
                            ...(siteSettings.enableRocketRefund ? [{ value: 'Rocket', label: 'Rocket Personal' }] : []),
                            ...(siteSettings.enableBankRefund ? [{ value: 'Bank Transfer', label: 'Bank Transfer' }] : []),
                          ]}
                          triggerClassName="h-11 font-semibold"
                        />
                      </div>

                    </div>

                    {/* Custom reason text block if "Other" is selected */}
                    {returnReason.includes('Other') && (
                      <div className="space-y-1.5 animate-slide-up">
                        <label className="text-sm font-semibold text-zinc-850 block mb-1 flex items-center gap-1.5">
                          <span>{'Specify Custom Reason:'}</span>
                          <span className="text-red-500 font-bold text-xs">({'Required'}) *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={customReasonText}
                          onChange={(e) => setCustomReasonText(e.target.value)}
                          placeholder={'E.g., size tag mismatches / wrong color shades'}
                          className="w-full h-11 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm placeholder-zinc-400 focus:outline-hidden focus:border-primary focus:bg-white text-zinc-900 font-semibold"
                        />
                      </div>
                    )}

                    {/* Dynamic Refund Account details depending on Payment Method */}
                    {refundMethod === 'Bank Transfer' ? (
                      <div className="space-y-3.5 p-4 border border-zinc-200/80 bg-zinc-50/50 rounded-2xl animate-slide-up">
                        <p className="text-xs font-bold text-zinc-850 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-primary" />
                          <span>{'Bank Account Information (Required):'}</span>
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-500">{'Bank Name:'} <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              placeholder={'E.g., BRAC Bank PLC'}
                              className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-xs sm:text-sm placeholder-zinc-400 focus:outline-hidden focus:border-primary text-zinc-900 font-bold"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-500">{'Branch Name:'} <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={bankBranch}
                              onChange={(e) => setBankBranch(e.target.value)}
                              placeholder={'E.g., Banani Branch'}
                              className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-xs sm:text-sm placeholder-zinc-400 focus:outline-hidden focus:border-primary text-zinc-900 font-bold"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-500">{'Account Holder Name:'} <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={accountName}
                              onChange={(e) => setAccountName(e.target.value)}
                              placeholder={'E.g., Md Sajjad Hossen'}
                              className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-xs sm:text-sm placeholder-zinc-400 focus:outline-hidden focus:border-primary text-zinc-900 font-bold"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-500">{'Account Number:'} <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={accountNumber}
                              onChange={(e) => setAccountNumber(e.target.value)}
                              placeholder={'E.g., 123.456.789'}
                              className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-xs sm:text-sm placeholder-zinc-400 focus:outline-hidden focus:border-primary text-zinc-900 font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 animate-slide-up">
                        <label className="text-sm font-semibold text-zinc-850 block mb-1 flex items-center gap-1.5">
                          <span>{`${refundMethod} Mobile Wallet Number:`}</span>
                          <span className="text-red-500 font-bold text-xs">({'Required'}) *</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={walletNumber}
                          onChange={(e) => setWalletNumber(e.target.value)}
                          placeholder={'E.g. 017XXXXXXXX (11-digit mobile wallet number)'}
                          maxLength={15}
                          className="w-full h-11 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm placeholder-zinc-400 focus:outline-hidden focus:border-primary focus:bg-white text-zinc-900 font-bold font-mono"
                        />
                      </div>
                    )}

                    {/* Detailed Reason text area */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-zinc-850 block mb-1 flex items-center gap-1.5">
                        <span>
                          {'Additional Explanation:'}
                        </span>
                        {returnReason.includes('Other') ? (
                          <span className="text-red-500 font-bold text-xs">({'Required - Minimum 10 characters'}) *</span>
                        ) : (
                          <span className="text-zinc-400 font-medium text-xs">({'Optional'})</span>
                        )}
                      </label>
                      <textarea
                        rows={3}
                        value={detailedReason}
                        onChange={(e) => setDetailedReason(e.target.value)}
                        placeholder={
                          'Explain briefly about size discrepancy or product defects to help us audit quickly...'
                        }
                        className="w-full p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm placeholder-zinc-400 focus:outline-hidden focus:border-primary focus:bg-white text-zinc-900 leading-relaxed font-medium resize-none"
                      />
                    </div>

                    {/* REQUIRED Returns Image Uploader (Direct Cloudinary Integration) */}
                    <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                      <div>
                        <span className="text-sm font-semibold text-zinc-850 block flex items-center gap-1.5 mb-1">
                          <ImageIcon className="w-4 h-4 text-primary" />
                          <span>
                            {'Upload Invoice & Product Damage Photos (Required):'}
                          </span>
                        </span>
                        <span className="text-2xs text-zinc-500 leading-none mt-1 block">
                          {'• Take a clear shot of invoice next to the damaged item (Up to 5 images)'}
                        </span>
                      </div>

                      {/* Upload grid list */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {uploadedImages.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden group">
                            <Image
                              src={url}
                              alt="Return attachment"
                              fill
                              sizes="120px"
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveUploadedImage(idx)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-red-600/90 text-white flex items-center justify-center cursor-pointer shadow-sm hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100 duration-200"
                              title="Delete Photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {/* Upload trigger button if < 5 */}
                        {uploadedImages.length < 5 && (
                          <label className={`aspect-square rounded-2xl border-2 border-dashed border-zinc-300 hover:border-primary bg-zinc-50/50 hover:bg-primary/5 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all ${
                            isUploading ? 'pointer-events-none' : ''
                          }`}>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleMultipleImagesUpload}
                              className="hidden"
                              disabled={isUploading}
                            />
                            {isUploading ? (
                              <LoadingSpinner size="sm" text={'Uploading...'} />
                            ) : (
                              <>
                                <Upload className="w-5 h-5 text-zinc-400 group-hover:text-primary mb-1.5 shrink-0" />
                                <span className="text-2xs font-black text-zinc-500 uppercase tracking-wider block">
                                  {'Add Photo'}
                                </span>
                                <span className="text-2xs text-zinc-400 mt-0.5">
                                  {uploadedImages.length}/5 uploaded
                                </span>
                              </>
                            )}
                          </label>
                        )}
                      </div>

                      {uploadError && (
                        <p className="text-2xs text-rose-600 font-semibold mt-1">
                          ⚠️ {uploadError}
                        </p>
                      )}

                      {/* Display image requirement status */}
                      <div className="p-3.5 rounded-xl border flex items-center gap-2.5 mt-2 transition-colors duration-200 bg-zinc-50 border-zinc-200">
                        {uploadedImages.length > 0 ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-xs font-semibold text-emerald-800">
                              {`Verification photo attached (${uploadedImages.length} images added)`}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-xs font-semibold text-primary">
                              {'Uploading at least one invoice/product photo is mandatory to submit return request.'}
                            </span>
                          </>
                        )}
                      </div>

                    </div>

                  </div>

                  {/* Refund Estimate Breakdown Box */}
                  {(() => {
                    const currentReason = returnReason.includes('Other') ? customReasonText : returnReason;
                    const isMindChange = currentReason.toLowerCase().includes('mind') || currentReason.toLowerCase().includes('changed');
                    
                    const selectedItemsSubtotal = Object.keys(selectedItems)
                      .filter((k) => selectedItems[k]?.selected)
                      .reduce((sum, key) => {
                        const [productId, idxStr] = key.split('__');
                        const idx = parseInt(idxStr, 10);
                        const orderItem = matchedOrder.items[idx];
                        const selection = selectedItems[key];
                        if (!orderItem) return sum;
                        return sum + (getItemUnitPrice(orderItem) * selection.quantity);
                      }, 0);

                    if (selectedItemsSubtotal === 0) return null;

                    const potentialFee = getPotentialShippingFee(matchedOrder);
                    const deduction = isMindChange ? potentialFee : 0;
                    const netRefund = Math.max(0, selectedItemsSubtotal - deduction);

                    return (
                      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
                        <span className="text-2xs font-extrabold uppercase tracking-widest text-zinc-400 block">
                          {'REFUND ESTIMATE BREAKDOWN'}
                        </span>
                        <div className="space-y-2 text-xs text-zinc-700">
                          <div className="flex items-center justify-between font-bold text-zinc-800">
                            <span>{'Returned Products Value Subtotal:'}</span>
                            <span className="font-mono text-zinc-900 text-sm">{formatBDT(selectedItemsSubtotal)}</span>
                          </div>

                          {isMindChange ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 font-medium">
                              <span className="flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{'Return Courier Shipping Charge:'}</span>
                              </span>
                              <span className="font-mono font-bold text-amber-900">{`- ${formatBDT(deduction)}`}</span>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl border border-zinc-200 bg-white space-y-1.5">
                              <div className="flex items-center justify-between text-zinc-700 font-medium">
                                <span className="flex items-center gap-1.5">
                                  <Truck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                  <span>{'Return Courier Shipping Charge:'}</span>
                                </span>
                                <span className="font-mono font-bold text-zinc-900">{'৳0'}</span>
                              </div>
                              <p className="text-2xs leading-tight text-zinc-500 italic">
                                {'Pending Review: if our team finds no problem with the product, the delivery charge will be deducted.'}
                              </p>
                            </div>
                          )}

                          <div className="pt-2 border-t border-zinc-200 flex items-center justify-between font-extrabold text-zinc-950 text-sm sm:text-base">
                            <span>{'Net Refund You Will Receive:'}</span>
                            <span className="font-mono text-emerald-600 font-bold">{formatBDT(netRefund)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Submission actions */}
                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in duration-150">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{formError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormError(null)}
                        className="text-red-700 hover:text-red-950 font-bold text-xs cursor-pointer p-0.5 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setMatchedOrder(null)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 text-xs font-bold uppercase transition-all shrink-0 cursor-pointer text-center"
                    >
                      {'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isUploading || uploadedImages.length === 0}
                      className="w-full sm:w-auto px-6 h-11 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          <span>{'Submit Return Request'}</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: TRACK EXISTING RETURN REQUESTS (AUTOMATIC TABLE VIEW) */}
        {activeTab === 'track' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-zinc-900">
                      {'Your Product Returns History'}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {'All returned items submitted on this device are automatically listed below.'}
                    </p>
                  </div>
                </div>

                {filteredReturnRequests.length > 0 && (
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      value={trackSearchTerm}
                      onChange={(e) => setTrackSearchTerm(e.target.value)}
                      placeholder="Search Return ID or Order ID..."
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:border-primary focus:bg-white transition-all font-medium"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                )}
              </div>

              {filteredReturnRequests.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto border border-zinc-200">
                    <RotateCcw className="w-7 h-7 text-zinc-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-zinc-900">
                      {'No Return Requests Found'}
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      {'You have not submitted any product return applications yet.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('request')}
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{'Submit New Return Request'}</span>
                  </button>
                </div>
              ) : (
                <ResponsiveTableContainer showScrollCues={true}>
                  <table className="w-full text-left text-xs font-sans whitespace-nowrap border-collapse min-w-[850px]">
                    <thead className="bg-zinc-100 text-zinc-700 uppercase tracking-wider text-xs font-bold sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                      <tr>
                        <th className="px-4 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Return ID'}</th>
                        <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Order ID'}</th>
                        <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Returned Product'}</th>
                        <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Product Value'}</th>
                        <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Shipping Fee'}</th>
                        <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Net Refund'}</th>
                        <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Status'}</th>
                        <th className="px-4 py-2.5 border-b border-zinc-200 bg-zinc-100 text-right">{'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-xs sm:text-sm">
                      {filteredReturnRequests.map((req) => {
                        const details = getReturnShippingDisplay(req);
                        const firstItemName = req.items?.[0]?.name || 'Returned Product';
                        const extraCount = (req.items?.length || 1) - 1;

                        return (
                          <tr key={req.id} className="hover:bg-zinc-50/60 transition-colors">
                            <td className="py-3.5 px-4 font-mono">
                              <strong className="font-extrabold text-zinc-900 block">{req.id}</strong>
                              <span className="text-2xs text-zinc-400 font-sans block mt-0.5">
                                {new Date(req.createdAt).toLocaleDateString('en-US')}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 font-mono font-bold text-zinc-700">
                              #{req.orderId}
                            </td>

                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-2.5">
                                {req.items?.[0]?.image ? (
                                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 shrink-0 shadow-2xs">
                                    <Image
                                      src={req.items[0].image}
                                      alt={req.items[0].name}
                                      fill
                                      sizes="40px"
                                      className="object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-xl border border-zinc-200 bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-400">
                                    <Package className="w-5 h-5" />
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-zinc-900 block truncate max-w-[180px]" title={firstItemName}>
                                    {firstItemName}
                                    {extraCount > 0 && <span className="text-primary font-mono ml-1">+{extraCount} more</span>}
                                  </span>
                                  <span className="text-2xs text-zinc-400 block mt-0.5 font-medium">
                                    Reason: {req.reason}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Product Value */}
                            <td className="py-3.5 px-3 font-mono font-bold text-zinc-900">
                              {formatBDT(details.subtotal)}
                            </td>

                            {/* Shipping Fee */}
                            <td className="py-3.5 px-3 font-mono">
                              {details.deduction > 0 ? (
                                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                                  -{formatBDT(details.deduction)}
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 inline-block">
                                  ৳0
                                </span>
                              )}
                            </td>

                            {/* Net Refund */}
                            <td className="py-3.5 px-3 font-mono font-extrabold text-emerald-600 text-sm">
                              {formatBDT(details.netRefund)}
                            </td>

                            <td className="py-3.5 px-3">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase tracking-wider ${
                                req.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.status === 'Rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : req.status === 'Approved'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {req.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setMatchedReturn(req)}
                                className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-900 hover:text-white text-zinc-800 shadow-3xs cursor-pointer transition-all inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{'View Status'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </ResponsiveTableContainer>
              )}
            </div>

            {/* Audit & Details Modal Popup when user clicks 'View Status' on any return row */}
            {matchedReturn && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
                <div className="bg-white rounded-3xl w-full max-w-2xl border border-zinc-200 shadow-2xl max-h-[92dvh] overflow-y-auto flex flex-col animate-scale-up">
                  {/* Modal Header */}
                  <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-primary" />
                      <div>
                        <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest block">
                          {'RETURN REQUEST AUDIT & MILESTONES'}
                        </span>
                        <h4 className="text-sm sm:text-base font-extrabold font-mono text-zinc-950 flex items-center gap-1.5">
                          {matchedReturn.id}
                          <span className="text-xs text-zinc-400 font-sans">({matchedReturn.status})</span>
                        </h4>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMatchedReturn(null)}
                      className="w-8 h-8 rounded-full hover:bg-zinc-200/80 text-zinc-500 hover:text-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Body - Full status, milestones, photos, payment details */}
                  <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Status Banner */}
                    <div className={`rounded-2xl p-4 border ${
                      matchedReturn.status === 'Completed'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : matchedReturn.status === 'Rejected'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : matchedReturn.status === 'Approved'
                        ? 'bg-sky-50 border-sky-200 text-sky-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/50">
                        <span className="text-xs font-bold uppercase tracking-wider">{'Current Progress:'}</span>
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-white shadow-3xs">
                          {matchedReturn.status}
                        </span>
                      </div>
                      <p className="text-xs mt-2 leading-relaxed font-medium">
                        {matchedReturn.status === 'Pending' && 'Your request is pending review by our support team. We will contact you shortly.'}
                        {matchedReturn.status === 'Approved' && 'Great news! Your return has been authorized. Courier pickup has been scheduled.'}
                        {matchedReturn.status === 'Completed' && 'Return completed and refund money disbursed successfully.'}
                        {matchedReturn.status === 'Rejected' && 'Return request was declined as per warranty terms.'}
                      </p>
                      {matchedReturn.adminNotes && (
                        <div className="mt-3 pt-2 border-t border-zinc-200/60 text-xs">
                          <strong className="block text-2xs uppercase tracking-wider font-extrabold opacity-70">
                            {'Disbursement Note:'}
                          </strong>
                          <span>{matchedReturn.adminNotes}</span>
                        </div>
                      )}
                    </div>

                    {/* Returned Items List */}
                    <div className="space-y-2">
                      <span className="text-2xs font-extrabold uppercase text-zinc-400 tracking-wider block">
                        {'RETURNED PRODUCTS:'}
                      </span>
                      <div className="border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-100 bg-zinc-50/50 px-4">
                        {matchedReturn.items?.map((item, idx) => (
                          <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-zinc-200 bg-white shrink-0 shadow-2xs">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    sizes="44px"
                                    className="object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              ) : (
                                <div className="w-11 h-11 rounded-xl border border-zinc-200 bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-400">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-zinc-900 block truncate max-w-[240px]">
                                  {item.name}
                                </span>
                                <div className="flex items-center gap-2 text-2xs text-zinc-500 mt-0.5">
                                  {item.selectedSize && <span>Size: <strong>{item.selectedSize}</strong></span>}
                                  {item.selectedColor && (
                                    <span className="flex items-center gap-1">
                                      <span className="w-2 h-2 rounded-full inline-block border border-zinc-200" style={{ backgroundColor: item.selectedColor.hex }} />
                                      {item.selectedColor.name}
                                    </span>
                                  )}
                                  <span>Qty: <strong>{item.quantity}</strong></span>
                                  <span>Unit: <strong>{formatBDT(getItemUnitPrice(item))}</strong></span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right font-mono font-bold text-zinc-800">
                              {formatBDT(getItemLineTotal(item))}
                            </div>
                          </div>
                        ))}

                        {/* Price Breakdown */}
                        {(() => {
                          const details = getReturnShippingDisplay(matchedReturn);

                          return (
                            <div className="py-3.5 space-y-2 border-t border-zinc-200 text-xs font-sans">
                              <div className="flex items-center justify-between text-zinc-700 font-bold">
                                <span>{'1. Returned Products Price Subtotal:'}</span>
                                <span className="font-mono text-zinc-900 text-sm font-bold">{formatBDT(details.subtotal)}</span>
                              </div>

                              {details.type === 'rejected' ? null : details.type === 'applied' ? (
                                <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50 space-y-1">
                                  <div className="flex items-center justify-between text-amber-900 font-bold">
                                    <span className="flex items-center gap-1.5">
                                      <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                                      <span>{'2. Return Courier Shipping Charge:'}</span>
                                    </span>
                                    <span className="font-mono font-bold text-amber-900">{`- ${formatBDT(details.deduction)}`}</span>
                                  </div>
                                  <p className="text-2xs leading-tight text-amber-800 font-medium">
                                    {details.note}
                                  </p>
                                </div>
                              ) : details.type === 'waived' ? (
                                <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 space-y-1">
                                  <div className="flex items-center justify-between text-emerald-900 font-bold">
                                    <span className="flex items-center gap-1.5">
                                      <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                                      <span>{'2. Return Courier Shipping Charge:'}</span>
                                    </span>
                                    <span className="font-mono font-bold text-emerald-900">{'৳0'}</span>
                                  </div>
                                  <p className="text-2xs leading-tight text-emerald-700 font-medium">
                                    {details.note}
                                  </p>
                                </div>
                              ) : (
                                <div className="p-2.5 rounded-xl border border-zinc-200 bg-white space-y-1">
                                  <div className="flex items-center justify-between text-zinc-700 font-bold">
                                    <span className="flex items-center gap-1.5">
                                      <Truck className="w-4 h-4 text-zinc-400 shrink-0" />
                                      <span>{'2. Return Courier Shipping Charge:'}</span>
                                    </span>
                                    <span className="font-mono font-bold text-zinc-900">{'৳0'}</span>
                                  </div>
                                  <p className="text-2xs leading-tight text-zinc-500 italic font-medium">
                                    {details.note}
                                  </p>
                                </div>
                              )}

                              <div className="pt-2 border-t border-zinc-200 flex items-center justify-between font-black text-sm sm:text-base text-zinc-950">
                                <span>{'3. Net Refund You Will Receive:'}</span>
                                <span className="font-mono text-emerald-600 font-black text-base sm:text-lg">{formatBDT(details.netRefund)}</span>
                              </div>

                              {matchedReturn.status === 'Rejected' && (
                                <p className="text-xs text-rose-600 font-medium pt-1">
                                  {'রিটার্ন বাতিল করা হয়েছে, কোনো রিফান্ড নেই'}
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Evidence photos preview with Lightbox zoom */}
                    {matchedReturn.images && matchedReturn.images.length > 0 && (
                      <div className="space-y-2 bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                        <span className="text-2xs font-extrabold uppercase text-zinc-400 tracking-wider block">
                          {'EVIDENCE PHOTOS (CLICK TO ZOOM):'}
                        </span>
                        <div className="flex flex-wrap gap-2.5">
                          {matchedReturn.images.map((url, index) => (
                            <button
                              type="button"
                              key={index}
                              onClick={() => setPreviewImage(url)}
                              className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 bg-white hover:opacity-90 transition-opacity cursor-pointer group shadow-2xs"
                              title="Click to view full screen"
                            >
                              <Image
                                src={url}
                                alt="Return evidence upload"
                                fill
                                sizes="80px"
                                className="object-cover group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <ZoomIn className="w-5 h-5 drop-shadow-sm" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Refund Wallet details */}
                    <div className="bg-zinc-50/80 border border-zinc-200 rounded-2xl p-4 space-y-1 text-xs">
                      <span className="text-2xs font-extrabold text-zinc-400 uppercase tracking-widest block">
                        {'REFUND PAYMENT ACCOUNT:'}
                      </span>
                      <strong className="text-zinc-900 font-mono font-bold block">{matchedReturn.paymentDetails}</strong>
                      <span className="text-2xs text-zinc-500 block">Method: {matchedReturn.paymentMethod}</span>
                    </div>

                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Lightbox Full Screen Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90dvh] w-full flex flex-col items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-amber-400 text-xs font-bold flex items-center gap-1 cursor-pointer bg-white/10 hover:bg-white/20 rounded-full px-3.5 py-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
            <div className="relative w-full h-[75dvh] max-h-[750px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-zinc-950 flex items-center justify-center">
              <Image
                src={previewImage}
                alt="Evidence Full Preview"
                fill
                className="object-contain"
                unoptimized
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ReturnsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60dvh] flex flex-col items-center justify-center p-8">
        <LoadingSpinner size="lg" text="Loading returns data..." subtext="Please wait a moment" />
      </div>
    }>
      <ReturnsContent />
    </Suspense>
  );
}
