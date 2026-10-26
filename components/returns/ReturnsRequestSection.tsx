'use client';

import React from 'react';
import Image from 'next/image';
import { Package, Phone, Upload, Check, AlertCircle } from 'lucide-react';
import type { Order } from '@/store/useOrderStore';
import { formatBDT } from '@/lib/formatCurrency';
import { ReturnImageUploader } from '@/components/returns/ReturnImageUploader';

interface ReturnsRequestSectionProps {
  orderIdInput: string;
  setOrderIdInput: (val: string) => void;
  phoneInput: string;
  setPhoneInput: (val: string) => void;
  isLookingUp: boolean;
  onLookupOrder: (e: React.FormEvent) => void;
  lookupError: string | null;
  matchedOrder: Order | null;
  selectedReturnItems: Record<string, { quantity: number; reason: string; comment: string }>;
  onToggleSelectItem: (skuOrId: string, maxQty: number) => void;
  onUpdateItemQuantity: (skuOrId: string, qty: number, maxQty: number) => void;
  onUpdateItemReason: (skuOrId: string, reason: string) => void;
  onUpdateItemComment: (skuOrId: string, comment: string) => void;
  returnImages: string[];
  setReturnImages: React.Dispatch<React.SetStateAction<string[]>>;
  returnBankName: string;
  setReturnBankName: (val: string) => void;
  returnAccountNo: string;
  setReturnAccountNo: (val: string) => void;
  returnAccountName: string;
  setReturnAccountName: (val: string) => void;
  returnBkashNo: string;
  setReturnBkashNo: (val: string) => void;
  returnMethod: 'bKash' | 'Bank' | 'StoreCredit';
  setReturnMethod: (val: 'bKash' | 'Bank' | 'StoreCredit') => void;
  isSubmittingReturn: boolean;
  onSubmitReturn: (e: React.FormEvent) => void;
  isUploadingImage?: boolean;
  uploadError?: string | null;
  handleMultipleImagesUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveUploadedImage?: (idx: number) => void;
}

export const ReturnsRequestSection: React.FC<ReturnsRequestSectionProps> = ({
  orderIdInput,
  setOrderIdInput,
  phoneInput,
  setPhoneInput,
  isLookingUp,
  onLookupOrder,
  lookupError,
  matchedOrder,
  selectedReturnItems,
  onToggleSelectItem,
  onUpdateItemQuantity,
  onUpdateItemReason,
  onUpdateItemComment,
  returnImages,
  setReturnImages,
  returnBankName,
  setReturnBankName,
  returnAccountNo,
  setReturnAccountNo,
  returnAccountName,
  setReturnAccountName,
  returnBkashNo,
  setReturnBkashNo,
  returnMethod,
  setReturnMethod,
  isSubmittingReturn,
  onSubmitReturn,
  isUploadingImage = false,
  uploadError = null,
  handleMultipleImagesUpload = () => {},
  handleRemoveUploadedImage = (idx) => setReturnImages((prev) => prev.filter((_, i) => i !== idx)),
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Lookup Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Lookup Your Delivered Order</h2>
          <p className="text-sm text-gray-500">Enter your Order ID and phone number used during checkout to initiate a return or exchange.</p>
        </div>

        <form onSubmit={onLookupOrder} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Order ID</label>
            <div className="relative">
              <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="e.g. ORD-12345"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="e.g. 01712345678"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isLookingUp}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm shadow-sm transition disabled:opacity-50"
            >
              {isLookingUp ? 'Searching Order...' : 'Find Order'}
            </button>
          </div>
        </form>

        {lookupError && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{lookupError}</span>
          </div>
        )}
      </div>

      {matchedOrder && (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-bold text-gray-900">Select Items to Return</h3>
            <p className="text-sm text-gray-500">Order ID: {matchedOrder.id} • Delivered</p>
          </div>

          <div className="space-y-4">
            {matchedOrder.items.map((item: any, idx: number) => {
              const itemId = item.id || item.sku || String(idx);
              const isSelected = !!selectedReturnItems[itemId];
              const maxQty = item.quantity || 1;

              return (
                <div key={itemId} className={`p-4 rounded-xl border transition ${isSelected ? 'border-rose-600 bg-rose-50/20' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectItem(itemId, maxQty)}
                      className="mt-1.5 w-4 h-4 text-rose-600 rounded border-gray-300 focus:ring-rose-500"
                    />
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.name || 'Product'} fill className="object-cover" />
                      ) : (
                        <Package className="w-6 h-6 m-auto text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{item.name || 'Product item'}</h4>
                      <p className="text-xs text-gray-500">Price: {formatBDT(item.price || item.unitPrice || 0)} x {item.quantity}</p>

                      {isSelected && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Return Reason</label>
                            <select
                              value={selectedReturnItems[itemId]?.reason || 'Defective / Damaged'}
                              onChange={(e) => onUpdateItemReason(itemId, e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="Defective / Damaged">Defective / Damaged</option>
                              <option value="Wrong Size / Fit">Wrong Size / Fit</option>
                              <option value="Not as Described">Not as Described</option>
                              <option value="Changed Mind">Changed Mind</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Quantity (Max: {maxQty})</label>
                            <input
                              type="number"
                              min={1}
                              max={maxQty}
                              value={selectedReturnItems[itemId]?.quantity || 1}
                              onChange={(e) => onUpdateItemQuantity(itemId, parseInt(e.target.value) || 1, maxQty)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Image Uploader */}
          <div className="pt-4 border-t">
            <ReturnImageUploader
              uploadedImages={returnImages}
              isUploading={isUploadingImage}
              uploadError={uploadError}
              handleMultipleImagesUpload={handleMultipleImagesUpload}
              handleRemoveUploadedImage={handleRemoveUploadedImage}
            />
          </div>

          {/* Refund Method & Details */}
          <div className="pt-4 border-t space-y-4">
            <h4 className="font-bold text-gray-900 text-sm">Select Refund Payout Method</h4>
            <div className="grid grid-cols-3 gap-3">
              {(['bKash', 'Bank', 'StoreCredit'] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setReturnMethod(m)}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition ${
                    returnMethod === m ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  {m === 'bKash' ? 'bKash Mobile Wallet' : m === 'Bank' ? 'Bank Account' : 'Store Credit'}
                </button>
              ))}
            </div>

            {returnMethod === 'bKash' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">bKash Account Number</label>
                <input
                  type="text"
                  placeholder="01712345678"
                  value={returnBkashNo}
                  onChange={(e) => setReturnBkashNo(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                />
              </div>
            )}

            {returnMethod === 'Bank' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={returnBankName}
                  onChange={(e) => setReturnBankName(e.target.value)}
                  className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="Account Number"
                  value={returnAccountNo}
                  onChange={(e) => setReturnAccountNo(e.target.value)}
                  className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="Account Holder Name"
                  value={returnAccountName}
                  onChange={(e) => setReturnAccountName(e.target.value)}
                  className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                />
              </div>
            )}
          </div>

          <div className="pt-6 border-t flex justify-end">
            <button
              type="button"
              onClick={onSubmitReturn}
              disabled={isSubmittingReturn}
              className="px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-md transition disabled:opacity-50"
            >
              {isSubmittingReturn ? 'Submitting Return Request...' : 'Submit Return Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
