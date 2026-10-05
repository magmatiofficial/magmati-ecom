'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { 
  RotateCcw, 
  Search, 
  Package, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Clock, 
  Eye, 
  Trash, 
  CheckCircle2, 
  Check, 
  Copy, 
  FileText, 
  XCircle,
  HelpCircle,
  Phone,
  Mail,
  ZoomIn,
  Truck,
  Settings,
  Sliders,
  Shield,
  Save,
  RefreshCw
} from 'lucide-react';
import { useReturnStore, ReturnRequest } from '@/store/useReturnStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { formatBDT } from '@/lib/formatCurrency';
import { getItemUnitPrice, getItemLineTotal } from '@/lib/itemPrice';
import { getReturnShippingFee } from '@/lib/returnPolicy';
import { ResponsiveTableContainer } from '@/components/ui/ResponsiveTableContainer';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { cn } from '@/lib/utils';

interface ReturnsTabProps {
  language?: string;
}

export function ReturnsTab({ language }: ReturnsTabProps) {
  const { returnRequests, updateReturnStatus, resolveShippingReview, deleteReturnRequest, syncWithFirestore } = useReturnStore();
  const { orders } = useOrderStore();
  const siteSettings = useSiteSettingsStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ReturnRequest['status']>('All');
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    setStatusMessage({ text, type });
    messageTimeoutRef.current = setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  // Sync state with firestore on mount
  useEffect(() => {
    const unsub = syncWithFirestore();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [syncWithFirestore]);

  // Sync modal notes when opening a different return request
  useEffect(() => {
    if (selectedRequest) {
      setAdminNotes(selectedRequest.adminNotes || '');
    } else {
      setAdminNotes('');
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      setStatusMessage(null);
    }
    setIsConfirmingDelete(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRequest?.id]);

  // Derived filtered requests
  const filteredRequests = useMemo(() => {
    return returnRequests.filter((r) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        r.id.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.paymentDetails.toLowerCase().includes(q);
      
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [returnRequests, searchTerm, statusFilter]);

  const handleCopyDetails = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleStatusUpdate = async (status: ReturnRequest['status']) => {
    if (!selectedRequest) return;
    try {
      await updateReturnStatus(selectedRequest.id, status, adminNotes.trim());
      
      // Update local modal state by fetching the refreshed request from the store
      const updated = useReturnStore.getState().returnRequests.find((r) => r.id === selectedRequest.id);
      if (updated) {
        setSelectedRequest(updated);
      } else {
        setSelectedRequest((prev) => prev ? { 
          ...prev, 
          status, 
          adminNotes: adminNotes.trim() 
        } : null);
      }

      let msg = `✔ স্ট্যাটাস ${status} করা হয়েছে`;
      if (status === 'Completed') {
        msg = '✔ রিফান্ড সম্পন্ন (Completed)';
      } else if (status === 'Approved') {
        msg = '✔ Approved করা হয়েছে';
      } else if (status === 'Rejected') {
        msg = '✔ Rejected করা হয়েছে';
      }
      showMessage(msg, 'success');
    } catch (err) {
      console.error('Failed to update status:', err);
      showMessage('✖ আপডেট হয়নি, আবার চেষ্টা করুন', 'error');
    }
  };

  const getShippingDetails = (req: ReturnRequest) => {
    const subtotal = req.items?.reduce((sum, item) => sum + getItemLineTotal(item), 0) || 0;
    
    if (req.status === 'Rejected') {
      return { subtotal, fee: 0, isDeducted: false, netRefund: 0 };
    }

    let fee = 0;
    if (req.shippingReview === 'waived' || req.shippingReview === 'pending') {
      fee = 0;
    } else if (req.shippingReview === 'applied') {
      fee = (typeof req.shippingDeduction === 'number' && req.shippingDeduction > 0)
        ? req.shippingDeduction 
        : (req.potentialShippingDeduction || 0);

      if (fee === 0) {
        const matchedOrderObj = orders.find(o =>
          o.id.toUpperCase() === req.orderId.toUpperCase() ||
          o.id.replace(/^mgm-?/i, '') === req.orderId.replace(/^mgm-?/i, '')
        );
        if (matchedOrderObj) fee = getReturnShippingFee(matchedOrderObj);
      }
    } else if (typeof req.shippingDeduction === 'number' && req.shippingDeduction > 0) {
      // Fallback for legacy or undefined review status
      fee = req.shippingDeduction;
    }

    const netRefund = Math.max(0, subtotal - fee);
    return { subtotal, fee, isDeducted: true, netRefund };
  };

  const calculateTotalRefund = (req: ReturnRequest) => {
    return getShippingDetails(req).netRefund;
  };

  return (
    <div className="space-y-3 font-sans animate-fade-in">
      
      {/* Header, Search & Status Filters Strip in one cohesive control card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200/90 shadow-2xs space-y-4">
        {/* Top Row: Title + Total Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-950">
                {'Returns & Refund Operations Queue'}
              </h2>
              <p className="text-2xs sm:text-xs text-zinc-500">
                {'Manage customer return requests, audit evidence photos, and disburse refunds.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{'Total Requests:'} <strong>{returnRequests.length}</strong></span>
            </span>
          </div>
        </div>

        {/* Bottom Row: Search & Status Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-100">
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={'Search by Return ID, Order ID, Customer, Wallet...'}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:border-primary focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {(['All', 'Pending', 'Approved', 'Completed', 'Rejected'] as const).map((status) => {
              const isActive = statusFilter === status;
              const count = status === 'All'
                ? returnRequests.length
                : returnRequests.filter(r => r.status === status).length;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                  }`}
                >
                  <span>{status}</span>
                  <span className={`text-2xs font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-zinc-200/80 text-zinc-700'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto border border-zinc-200">
              <RotateCcw className="w-6 h-6" />
            </div>
            <p className="text-xs font-medium text-zinc-500 max-w-xs mx-auto">
              {'No product return request records match your selection.'}
            </p>
          </div>
        ) : (
          <ResponsiveTableContainer showScrollCues={true}>
            <table className="w-full text-left text-xs font-sans whitespace-nowrap border-collapse min-w-[850px]">
              <thead className="bg-zinc-100 text-zinc-700 uppercase tracking-wider text-xs font-bold sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <tr>
                  <th className="px-3.5 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Return ID'}</th>
                  <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Order ID'}</th>
                  <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Customer & Wallet'}</th>
                  <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Returned Product & Reason'}</th>
                  <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100 text-center">{'Evidence Photos'}</th>
                  <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Net Refund'}</th>
                  <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">{'Status'}</th>
                  <th className="px-3.5 py-2.5 border-b border-zinc-200 bg-zinc-100 text-right">{'Control / Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs sm:text-sm">
                {filteredRequests.map((req) => {
                  const refundValue = calculateTotalRefund(req);
                  const deduction = req.shippingDeduction || 0;
                  const firstItemName = req.items?.[0]?.name || 'Returned Item';
                  const extraCount = (req.items?.length || 1) - 1;

                  return (
                    <tr key={req.id} className="hover:bg-zinc-50/60 transition-colors">
                      {/* Return ID & Date */}
                      <td className="py-3.5 px-3.5 font-mono">
                        <span className="font-extrabold text-zinc-900 block">{req.id}</span>
                        <span className="text-2xs text-zinc-400 font-sans block mt-0.5">
                          {new Date(req.createdAt).toLocaleDateString('en-US')}
                        </span>
                      </td>

                      {/* Order ID */}
                      <td className="py-3.5 px-3 font-mono font-bold text-zinc-700">
                        #{req.orderId}
                      </td>

                      {/* Customer Name, Phone & Wallet Details */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-zinc-900 block truncate max-w-[150px]">
                          {req.customerName}
                        </span>
                        <span className="text-2xs text-zinc-500 font-mono block mt-0.5">
                          {req.phone}
                        </span>
                        <span className="text-2xs text-primary font-mono font-bold block mt-0.5 truncate max-w-[160px]" title={req.paymentDetails}>
                          {req.paymentMethod}: {req.paymentDetails.replace(/^.*?Personal:\s*/i, '').replace(/^Bank:\s*/i, '')}
                        </span>
                      </td>

                      {/* Returned Product & Reason */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          {req.items?.[0]?.image ? (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(req.items[0].image!)}
                              className="relative w-10 h-10 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 shrink-0 hover:opacity-80 transition-opacity cursor-pointer shadow-2xs group"
                              title="Click to view full image"
                            >
                              <Image
                                src={req.items[0].image}
                                alt={req.items[0].name ? `${req.items[0].name} return item thumbnail` : "Returned item thumbnail"}
                                fill
                                sizes="40px"
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <ZoomIn className="w-3.5 h-3.5" />
                              </div>
                            </button>
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
                            <span className="text-2xs font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-zinc-200">
                              {req.reason}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Evidence Photo Thumbnails Column */}
                      <td className="py-3.5 px-3 text-center">
                        {req.images && req.images.length > 0 ? (
                          <div className="flex items-center justify-center gap-1.5">
                            {req.images.slice(0, 2).map((imgUrl, imgIdx) => (
                              <button
                                type="button"
                                key={imgIdx}
                                onClick={() => setPreviewImage(imgUrl)}
                                className="relative w-9 h-9 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 hover:opacity-80 transition-opacity cursor-pointer group shrink-0"
                                title="Click to expand photo"
                              >
                                <Image
                                  src={imgUrl}
                                  alt="Customer return evidence photo thumbnail"
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                  <ZoomIn className="w-3.5 h-3.5" />
                                </div>
                              </button>
                            ))}
                            {req.images.length > 2 && (
                              <button
                                type="button"
                                onClick={() => setSelectedRequest(req)}
                                className="text-2xs font-bold text-zinc-500 bg-zinc-100 hover:bg-zinc-200 px-1.5 py-2 rounded-lg border border-zinc-200 cursor-pointer"
                              >
                                +{req.images.length - 2}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-2xs text-zinc-400 italic">No Photo</span>
                        )}
                      </td>

                      {/* Net Refund Value */}
                      <td className="py-3.5 px-3 font-mono">
                        {(() => {
                          if (req.status === 'Rejected') {
                            return (
                              <span className="font-extrabold text-zinc-400 block text-sm">
                                {formatBDT(0)}
                              </span>
                            );
                          }
                          const { fee, netRefund } = getShippingDetails(req);
                          return (
                            <>
                              <span className="font-extrabold text-emerald-600 block text-sm">{formatBDT(netRefund)}</span>
                              {fee > 0 && (
                                <span className="text-2xs text-amber-700 font-sans font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                                  -{formatBDT(fee)} courier
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </td>

                      {/* Status Selector Dropdown / Badge */}
                      <td className="py-3.5 px-3 min-w-[130px]">
                        <CustomDropdown
                          value={req.status}
                          disabled={req.status === 'Completed'}
                          onChange={(val) => updateReturnStatus(req.id, val as ReturnRequest['status'])}
                          options={[
                            { value: 'Pending', label: 'Pending' },
                            { value: 'Approved', label: 'Approved' },
                            { value: 'Completed', label: 'Completed' },
                            { value: 'Rejected', label: 'Rejected' },
                          ]}
                          triggerClassName={cn(
                            'h-7 text-2xs font-extrabold uppercase px-2 rounded-full border border-zinc-200',
                            req.status === 'Completed' ? 'bg-emerald-50 text-emerald-800' :
                            req.status === 'Rejected' ? 'bg-rose-50 text-rose-800' :
                            req.status === 'Approved' ? 'bg-sky-50 text-sky-800' :
                            'bg-amber-50 text-amber-800'
                          )}
                          dropdownClassName="text-left lowercase first-letter:uppercase"
                        />
                      </td>

                      {/* Control / Action Quick Controls */}
                      <td className="py-3.5 px-3.5 text-right">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedRequest(req)}
                            className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-900 hover:text-white text-zinc-800 shadow-3xs cursor-pointer transition-all inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                            title="Audit Full Request Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Audit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ResponsiveTableContainer>
        )}
      </div>

      {/* Audit & Management Modal Popup */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-zinc-200 shadow-2xl max-h-[92dvh] overflow-y-auto flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest block">
                    {'AUDIT RETURN REQUEST'}
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold font-mono text-zinc-950 flex items-center gap-1.5">
                    {selectedRequest.id}
                    <span className="text-xs text-zinc-400">({selectedRequest.status})</span>
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="w-8 h-8 rounded-full hover:bg-zinc-200/80 text-zinc-500 hover:text-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              
              {/* Linked Order & Customer Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 border border-zinc-200/90 rounded-2xl p-4">
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
                  {selectedRequest.items?.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(item.image!)}
                            className="relative w-11 h-11 rounded-xl overflow-hidden border border-zinc-200 bg-white shrink-0 hover:opacity-80 transition-opacity cursor-pointer shadow-2xs group"
                            title="Click to view full image"
                          >
                            <Image
                              src={item.image}
                              alt={item.name ? `${item.name} return product photo` : "Returned item condition photo"}
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
                  
                  {/* Total summary row */}
                  {(() => {
                    const { subtotal, fee, netRefund } = getShippingDetails(selectedRequest);

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
                                {selectedRequest.reason.toLowerCase().includes('mind') || selectedRequest.reason.toLowerCase().includes('changed') ? ' (Mind Change)' : ''}
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
                                  onClick={async () => {
                                    try {
                                      await resolveShippingReview(selectedRequest.id, 'waived');
                                      showMessage('✔ সিদ্ধান্ত সংরক্ষিত হয়েছে', 'success');
                                      const updated = useReturnStore.getState().returnRequests.find(r => r.id === selectedRequest.id);
                                      if (updated) setSelectedRequest(updated);
                                    } catch (err) {
                                      console.error('Failed to resolve shipping review:', err);
                                      showMessage('✖ আপডেট হয়নি, আবার চেষ্টা করুন', 'error');
                                    }
                                  }}
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
                                  onClick={async () => {
                                    try {
                                      await resolveShippingReview(selectedRequest.id, 'applied');
                                      showMessage('✔ সিদ্ধান্ত সংরক্ষিত হয়েছে', 'success');
                                      const updated = useReturnStore.getState().returnRequests.find(r => r.id === selectedRequest.id);
                                      if (updated) setSelectedRequest(updated);
                                    } catch (err) {
                                      console.error('Failed to resolve shipping review:', err);
                                      showMessage('✖ আপডেট হয়নি, আবার চেষ্টা করুন', 'error');
                                    }
                                  }}
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
                <label className="text-2xs font-black text-zinc-400 uppercase tracking-widest block">
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
              
              {/* Fixed-height message strip above footer buttons that is ALWAYS rendered */}
              <div className="min-h-[36px] flex items-center justify-center w-full">
                <div
                  className={cn(
                    "text-xs font-bold px-3 py-1.5 rounded-lg border transition-all duration-300 flex items-center gap-1.5 shadow-3xs",
                    statusMessage
                      ? (statusMessage.type === 'error'
                          ? "bg-rose-50 text-rose-700 border-rose-200 opacity-100 scale-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 opacity-100 scale-100")
                      : "opacity-0 pointer-events-none scale-95 select-none"
                  )}
                >
                  {statusMessage?.text || ' '}
                </div>
              </div>

              {isConfirmingDelete ? (
                <div className="w-full bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 animate-fade-in">
                  <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    {'এই রিটার্ন রেকর্ডটি স্থায়ীভাবে মুছে ফেলবেন?'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteReturnRequest(selectedRequest.id);
                        setIsConfirmingDelete(false);
                        setSelectedRequest(null);
                      }}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-3xs cursor-pointer"
                    >
                      {'হ্যাঁ, মুছুন'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-3 py-1 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      {'বাতিল'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-1.5 w-full">
                  {/* Left Action: Delete Request */}
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="px-2 h-8 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-2xs font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    title="Delete Return Record"
                  >
                    <Trash className="w-3 h-3 text-rose-600" />
                    <span className="hidden sm:inline">{'Delete'}</span>
                  </button>

                  {/* Right Group: Compact Workflow Status Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* 1. Reject */}
                    <button
                      type="button"
                      disabled={selectedRequest.status === 'Completed'}
                      onClick={() => handleStatusUpdate('Rejected')}
                      title={selectedRequest.status === 'Completed' ? 'রিফান্ড সম্পন্ন, বদলানো যাবে না' : undefined}
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

                    {/* 2. Approve Pickup */}
                    <button
                      type="button"
                      disabled={selectedRequest.status === 'Completed'}
                      onClick={() => handleStatusUpdate('Approved')}
                      title={selectedRequest.status === 'Completed' ? 'রিফান্ড সম্পন্ন, বদলানো যাবে না' : undefined}
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

                    {/* 3. Complete & Refund */}
                    <button
                      type="button"
                      disabled={selectedRequest.status === 'Completed'}
                      onClick={() => handleStatusUpdate('Completed')}
                      title={selectedRequest.status === 'Completed' ? 'রিফান্ড সম্পন্ন, বদলানো যাবে না' : undefined}
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
              )}

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

    </div>
  );
}
