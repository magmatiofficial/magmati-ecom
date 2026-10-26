/**
 * @file components/admin/ReturnsTab.tsx
 * @description Admin panel tab for managing product return requests with server-paged data loading, aggregation counts, and secure server mutation helpers.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  RotateCcw,
  Search,
  Package,
  X,
  Eye,
  Trash,
  CheckCircle2,
  Check,
  Copy,
  XCircle,
  Phone,
  Mail,
  ZoomIn,
  Truck
} from 'lucide-react';
import type { ReturnRequest } from '@/store/useReturnStore';
import { useAdminReturnsPage } from '@/hooks/useAdminReturnsPage';
import { updateReturnStatusApi, resolveReturnShippingApi, deleteReturnApi } from '@/lib/returns/returnApi';
import { useAdminReturnChangeStore } from '@/store/useAdminReturnChangeStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { toast } from '@/store/useToastStore';
import { formatBDT } from '@/lib/formatCurrency';
import { getItemUnitPrice, getItemLineTotal } from '@/lib/itemPrice';
import { getReturnItemName, getReturnItemImage } from '@/lib/returns/returnItemDisplay';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { cn } from '@/lib/utils';
import { getReturnShippingDetails } from './returns/returnCalc';
import { ReturnsTabHeader } from './returns-tab/ReturnsTabHeader';
import { ReturnsTable } from './returns-tab/ReturnsTable';

interface ReturnsTabProps {
  language?: string;
}

export function ReturnsTab({ language }: ReturnsTabProps) {
  const siteSettings = useSiteSettingsStore();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [shippingReviewFilter, setShippingReviewFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const {
    returns: rawReturns,
    counts,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    refresh,
    refreshCounts,
    patchReturn,
    removeReturn,
  } = useAdminReturnsPage({
    status: statusFilter,
    search: searchQuery,
  });

  const returns = rawReturns.filter((r) => {
    if (shippingReviewFilter !== 'All' && r.shippingReview !== shippingReviewFilter) {
      return false;
    }
    return true;
  });

  const lastReturnChange = useAdminReturnChangeStore((s) => s.lastChange);
  const publishReturnChange = useAdminReturnChangeStore((s) => s.publishReturnChange);
  const handledNonceRef = React.useRef<number>(lastReturnChange?.nonce ?? 0);

  useEffect(() => {
    if (lastReturnChange && lastReturnChange.nonce !== handledNonceRef.current) {
      handledNonceRef.current = lastReturnChange.nonce;
      void refreshCounts();
    }
  }, [lastReturnChange, refreshCounts]);

  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    if (selectedRequest) {
      setAdminNotes(selectedRequest.adminNotes || '');
    }
  }, [selectedRequest]);

  const handleStatusUpdate = async (req: ReturnRequest, newStatus: any, notes: string) => {
    setIsConfirmLoading(true);
    try {
      const result = await updateReturnStatusApi(req.id, newStatus, notes);

      if (!result.ok) {
        toast.error(result.error || 'Failed to update return request status');
        return;
      }

      patchReturn(req.id, { status: newStatus, adminNotes: notes });
      void refreshCounts();
      publishReturnChange(req.id);
      toast.success(`Return request status updated to ${newStatus}`);
      setSelectedRequest((prev) => (prev ? { ...prev, status: newStatus, adminNotes: notes } : null));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status');
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const handleResolveShipping = async (req: ReturnRequest, review: 'waived' | 'applied') => {
    setIsConfirmLoading(true);
    try {
      const result = await resolveReturnShippingApi(req.id, review);
      if (!result.ok) {
        toast.error(result.error || 'Failed to resolve shipping fee');
        return;
      }

      patchReturn(req.id, { shippingReview: review });
      void refreshCounts();
      publishReturnChange(req.id);
      toast.success(review === 'waived' ? 'Return shipping fee waived for customer' : 'Return shipping fee applied');
      setSelectedRequest((prev) => (prev ? { ...prev, shippingReview: review } : null));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resolve shipping');
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const handleCopyDetails = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    toast.success('Copied to clipboard');
  };

  const openDeleteConfirm = (req: ReturnRequest) => {
    setConfirmDialog({
      open: true,
      title: `Delete Return Request #${req.id}`,
      message: `Are you sure you want to permanently delete this return request for Order #${req.orderId}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          const result = await deleteReturnApi(req.id);
          if (!result.ok) {
            toast.error(result.error || 'Failed to delete return request');
            return;
          }
          removeReturn(req.id);
          void refreshCounts();
          publishReturnChange(req.id);
          toast.success('Return request deleted');
          setConfirmDialog((prev) => ({ ...prev, open: false }));
          if (selectedRequest?.id === req.id) {
            setSelectedRequest(null);
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to delete return request');
        } finally {
          setIsConfirmLoading(false);
        }
      },
    });
  };

  return (
    <div className="space-y-4 font-sans">
      <ReturnsTabHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        shippingReviewFilter={shippingReviewFilter}
        setShippingReviewFilter={setShippingReviewFilter}
        counts={{
          all: counts?.total || 0,
          pending: counts?.status?.Pending || 0,
          approved: counts?.status?.Approved || 0,
          completed: counts?.status?.Completed || 0,
          rejected: counts?.status?.Rejected || 0,
        }}
        onRefresh={() => {
          void refresh();
          void refreshCounts();
          toast.success('Returns data refreshed successfully!');
        }}
        isLoading={isLoading}
      />

      {error && (
        <InlineAlert type="error">
          Failed to load returns: {error}
        </InlineAlert>
      )}

      <ReturnsTable
        returns={returns}
        onSelectReturn={(req) => setSelectedRequest(req)}
        onDeleteReturn={openDeleteConfirm}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
      />

      {/* Return Inspection & Processing Modal Drawer */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[120] p-3 sm:p-4 font-sans animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl h-[85dvh] sm:h-[90dvh] flex flex-col border border-zinc-200 shadow-2xl p-4 sm:p-6 md:p-8 gap-4 relative animate-scale-up my-auto">
            <button
              type="button"
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="shrink-0 pr-10">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg text-2xs font-bold uppercase tracking-wider bg-primary/10 text-primary font-mono">
                  Return #{selectedRequest.id.slice(0, 8)}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-2xs font-black ${
                  selectedRequest.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedRequest.status === 'Approved'
                    ? 'bg-blue-100 text-blue-800'
                    : selectedRequest.status === 'Pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedRequest.status}
                </span>
              </div>
              <h3 className="font-sans text-lg sm:text-xl font-bold text-zinc-900 mt-1">
                Return Inspection & Refund Processing
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Review return reason, inspection photos, and decide refund / shipping deduction.
              </p>
            </div>

            <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1 pt-2 space-y-4 text-xs font-sans">

              {/* Order & Customer Information Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                <div className="space-y-1.5">
                  <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest block">
                    {'LINKED ORDER ID:'}
                  </span>
                  <p className="font-extrabold font-mono text-zinc-900 text-sm">
                    #{selectedRequest.orderId}
                  </p>
                  <p className="text-zinc-500">
                    {'Submitted: '}
                    <strong>{new Date(selectedRequest.createdAt).toLocaleDateString('en-US')}</strong>
                  </p>
                </div>

                <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-zinc-200 pt-2 sm:pt-0 sm:pl-4">
                  <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest block">
                    {'CUSTOMER INFO:'}
                  </span>
                  <p className="font-bold text-zinc-900">{selectedRequest.customerName}</p>
                  <p className="text-zinc-500">Phone: <strong>{selectedRequest.phone}</strong></p>
                  <p className="text-zinc-500">Email: <strong>{selectedRequest.email}</strong></p>

                  <div className="flex items-center gap-2 mt-2 pt-1">
                    <a
                      href={`tel:${selectedRequest.phone}`}
                      className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-2xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{'Call Customer'}</span>
                    </a>
                    <a
                      href={`mailto:${selectedRequest.email}`}
                      className="px-2.5 py-1.5 bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 rounded-lg text-2xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Mail className="w-3 h-3 text-sky-600" />
                      <span>{'Send Email'}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <span className="text-2xs font-bold text-zinc-400 uppercase tracking-wider block">
                  {'Returned Products:'}
                </span>

                <div className="border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-100 bg-zinc-50/50 px-4">
                  {selectedRequest.items?.map((item, idx) => {
                    const itemName = getReturnItemName(item) || 'Returned Item';
                    const itemImage = getReturnItemImage(item);

                    return (
                      <div key={idx} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {itemImage ? (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(itemImage)}
                              className="relative w-11 h-11 rounded-xl overflow-hidden border border-zinc-200 bg-white shrink-0 hover:opacity-80 transition-opacity cursor-pointer shadow-2xs group"
                              title="Click to view full image"
                            >
                              <Image
                                src={itemImage}
                                alt={itemName}
                                fill
                                sizes="44px"
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <ZoomIn className="w-3.5 h-3.5" />
                              </div>
                            </button>
                          ) : (
                            <div className="w-11 h-11 rounded-xl border border-zinc-200 bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-zinc-900 block truncate max-w-[240px]">
                              {itemName}
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
                    );
                  })}

                  {/* Total summary row */}
                  {(() => {
                    const { subtotal, fee, netRefund } = getReturnShippingDetails(selectedRequest);

                    return (
                      <div className="py-3.5 space-y-2.5 border-t border-zinc-200 text-xs font-sans">
                        <div className="flex items-center justify-between font-bold text-zinc-700">
                          <span>{'1. Products Value Subtotal:'}</span>
                          <span className="font-mono text-zinc-900 text-sm font-bold">{formatBDT(subtotal)}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 font-bold">
                          <span className="flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>{'2. Return Courier Shipping Charge:'}</span>
                            {selectedRequest.shippingReview === 'pending' && (
                              <span className="text-2xs text-amber-600 uppercase tracking-tight ml-1 font-black animate-pulse">
                                {'Pending Review'}
                              </span>
                            )}
                            {selectedRequest.shippingReview === 'waived' && (
                              <span className="text-2xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg ml-1">
                                {'শিপিং মওকুফ'}
                              </span>
                            )}
                            {selectedRequest.shippingReview === 'applied' && (
                              <span className="text-2xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg ml-1">
                                {'শিপিং কাটা হয়েছে'}
                              </span>
                            )}
                          </span>
                          <span className="font-mono font-extrabold text-amber-900 text-sm">{`- ${formatBDT(fee)}`}</span>
                        </div>

                        {(selectedRequest.status === 'Completed' || selectedRequest.status === 'Rejected') ? (
                          <div className="pt-1">
                            <p className="text-zinc-500 text-xs italic font-semibold">
                              {selectedRequest.status === 'Rejected'
                                ? 'রিটার্ন বাতিল, কোনো রিফান্ড নেই'
                                : 'রিফান্ড সম্পন্ন হওয়ায় সিদ্ধান্ত বদলানো যাবে না'}
                            </p>
                          </div>
                        ) : (
                          (selectedRequest.shippingReview === 'pending' ||
                           selectedRequest.shippingReview === 'waived' ||
                           selectedRequest.shippingReview === 'applied' ||
                           !selectedRequest.shippingReview) && (
                            <div className="flex flex-col gap-2 pt-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleResolveShipping(selectedRequest, 'waived')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-xl text-2xs font-bold transition-all shadow-3xs cursor-pointer flex items-center gap-1",
                                    selectedRequest.shippingReview === 'waived'
                                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                      : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                                  )}
                                >
                                  {selectedRequest.shippingReview === 'waived' && <Check className="w-3 h-3 shrink-0" />}
                                  <span>{'সমস্যা পাওয়া গেছে — শিপিং আমরা বহন করব'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResolveShipping(selectedRequest, 'applied')}
                                  className={cn(
                                    "px-3 py-1.5 rounded-xl text-2xs font-bold transition-all shadow-3xs cursor-pointer flex items-center gap-1",
                                    selectedRequest.shippingReview === 'applied'
                                      ? "bg-rose-600 text-white hover:bg-rose-700"
                                      : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50"
                                  )}
                                >
                                  {selectedRequest.shippingReview === 'applied' && <Check className="w-3 h-3 shrink-0" />}
                                  <span>{'সমস্যা নেই — শিপিং কাটুন'}</span>
                                </button>
                              </div>
                            </div>
                          )
                        )}

                        <div className="pt-2 border-t border-zinc-200 flex items-center justify-between font-black text-zinc-950 text-sm sm:text-base">
                          <span className="flex items-center gap-1">
                            <span>{'3. Net Refund Disburseable:'}</span>
                            <span className="text-2xs text-zinc-400 font-normal">({formatBDT(subtotal)} - {formatBDT(fee)})</span>
                          </span>
                          <span className="font-mono text-emerald-600 font-black text-lg">{formatBDT(netRefund)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Reason and Explanations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 bg-zinc-50/60 border border-zinc-150 p-3.5 rounded-xl">
                  <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest block">
                    {'RETURN REASON:'}
                  </span>
                  <p className="font-bold text-zinc-900">{selectedRequest.reason}</p>
                  {selectedRequest.detailedReason && (
                    <p className="text-2xs text-zinc-500 italic mt-1 bg-white p-2 border border-zinc-200 rounded leading-relaxed">
                      &ldquo;{selectedRequest.detailedReason}&rdquo;
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 bg-zinc-50/60 border border-zinc-150 p-3.5 rounded-xl">
                  <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest block">
                    {'REFUND WALLET ACCOUNT:'}
                  </span>
                  <p className="font-bold text-zinc-900 flex items-center gap-1">
                    <span className="uppercase text-2xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {selectedRequest.paymentMethod}
                    </span>
                  </p>
                  <p className="font-mono text-zinc-700 mt-1 font-bold break-all bg-white p-2 border border-zinc-200 rounded leading-relaxed flex items-center justify-between">
                    <span>{selectedRequest.paymentDetails}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyDetails(selectedRequest.paymentDetails)}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer shrink-0 ml-1"
                      title="Copy wallet details"
                    >
                      {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </p>
                </div>
              </div>

              {/* Customer Uploaded Evidence Images Preview in Admin */}
              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div className="space-y-2 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 animate-fade-in">
                  <span className="text-2xs font-extrabold uppercase text-zinc-400 tracking-wider block">
                    {'CUSTOMER ATTACHED EVIDENCE PHOTOS (CLICK TO VIEW FULL):'}
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedRequest.images.map((url, index) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => setPreviewImage(url)}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 bg-white hover:opacity-90 transition-opacity cursor-pointer group shadow-3xs"
                        title="Click to view full screen"
                      >
                        <Image
                          src={url}
                          alt="Customer return inspection evidence photo"
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

              {/* Admin Note inputs */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest block">
                  {'ADMIN RESPONSE / DISBURSEMENT NOTE (VISIBLE TO CUSTOMER):'}
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={
                    'E.g., bKash TxID 81298194, pickup arranged for tomorrow, or reason for rejection...'
                  }
                  className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 placeholder-zinc-400 focus:outline-hidden focus:border-primary focus:bg-white text-zinc-900 leading-relaxed font-semibold resize-none"
                />
              </div>

            </div>

            {/* Compact Ultra-Responsive Modal Actions Footer Toolbar */}
            <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex flex-col gap-2 sticky bottom-0 z-10 font-sans">
              <div className="flex items-center justify-between gap-1.5 w-full">
                <button
                  type="button"
                  onClick={() => openDeleteConfirm(selectedRequest)}
                  className="px-2 h-8 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-2xs font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  title="Delete Return Record"
                >
                  <Trash className="w-3 h-3 text-rose-600" />
                  <span className="hidden sm:inline">{'Delete'}</span>
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={selectedRequest.status === 'Completed'}
                    onClick={() => handleStatusUpdate(selectedRequest, 'Rejected', adminNotes.trim())}
                    className={cn(
                      "px-2.5 h-8 rounded-lg text-2xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all",
                      selectedRequest.status === 'Completed'
                        ? "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed opacity-50"
                        : "bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 cursor-pointer"
                    )}
                  >
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>{'Reject'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedRequest.status === 'Completed'}
                    onClick={() => handleStatusUpdate(selectedRequest, 'Approved', adminNotes.trim())}
                    className={cn(
                      "px-2.5 h-8 rounded-lg text-2xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all",
                      selectedRequest.status === 'Completed'
                        ? "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed opacity-50"
                        : "bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 cursor-pointer"
                    )}
                  >
                    <Check className="w-3 h-3 text-sky-600" />
                    <span>{'Approve'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedRequest.status === 'Completed'}
                    onClick={() => handleStatusUpdate(selectedRequest, 'Completed', adminNotes.trim())}
                    className={cn(
                      "px-3 h-8 rounded-lg text-2xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-3xs",
                      selectedRequest.status === 'Completed'
                        ? "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed opacity-50"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    )}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{'Refund'}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

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
                alt="Full resolution return evidence inspection preview"
                fill
                className="object-contain"
                unoptimized
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Shared Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        loading={isConfirmLoading}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />

    </div>
  );
}
