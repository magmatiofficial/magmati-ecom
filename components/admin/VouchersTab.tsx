'use client';

import React, { useState } from 'react';
import { Ticket, Plus, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Voucher, useVoucherStore } from '@/store/useVoucherStore';
import { VoucherTicketCard } from '@/components/ui/VoucherTicketCard';

interface VouchersTabProps {
  vouchers: Voucher[];
  
  openAddVoucherModal: () => void;
  openEditVoucherModal: (voucher: Voucher) => void;
  toggleVoucherStatus: (id: string) => void;
  deleteVoucher: (id: string) => void;
}

export const VouchersTab: React.FC<VouchersTabProps> = ({
  vouchers = [],
    openAddVoucherModal,
  openEditVoucherModal,
  toggleVoucherStatus,
  deleteVoucher,
}) => {
  const { resetVouchersToDefault, maxVouchersPerOrder, setMaxVouchersPerOrder } = useVoucherStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  

  const handleResetVouchers = () => {
    resetVouchersToDefault();
    setShowResetConfirm(false);
    setToastMsg(
      'All vouchers successfully reset to defaults!'
    );
    setTimeout(() => setToastMsg(''), 4500);
  };

  const handleDelete = (id: string) => {
    const target = vouchers.find((v) => v.id === id);
    deleteVoucher(id);
    setToastMsg(`Voucher "${target?.code || id}" deleted`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast message */}
      {toastMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg('')}
            className="text-emerald-700 hover:text-emerald-950 font-bold text-xs cursor-pointer p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Stats Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
          <div>
            <h3 className="font-sans text-base font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              {'Vouchers & Coupons Control Panel'}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-3.5 py-2.5 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Reset vouchers to factory default promo codes"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
                <span>{'Reset Defaults'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 p-1 bg-amber-50 border border-amber-300 rounded-xl animate-in fade-in">
                <button
                  type="button"
                  onClick={handleResetVouchers}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{'Confirm Reset'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2.5 py-1.5 bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={openAddVoucherModal}
              className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {'+ Create Voucher'}
            </button>
          </div>
        </div>

        {/* Global Multi-Voucher Stacking Configuration */}
        <div className="mt-5 p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="font-bold text-xs text-emerald-950 block">
              {'Max Stackable Vouchers Per Order'}
            </span>
            <span className="text-xs text-emerald-700 block">
              {'Determine how many active vouchers a user can combine at checkout.'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              disabled={maxVouchersPerOrder <= 1}
              onClick={() => {
                setMaxVouchersPerOrder(maxVouchersPerOrder - 1);
                setToastMsg('Stacking limit decreased');
                setTimeout(() => setToastMsg(''), 3000);
              }}
              className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-700 font-bold hover:bg-zinc-100 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="w-10 text-center font-mono font-black text-xs text-zinc-900 bg-white border border-zinc-200 py-1.5 rounded-lg">
              {maxVouchersPerOrder}
            </span>
            <button
              type="button"
              disabled={maxVouchersPerOrder >= 5}
              onClick={() => {
                setMaxVouchersPerOrder(maxVouchersPerOrder + 1);
                setToastMsg('Stacking limit increased');
                setTimeout(() => setToastMsg(''), 3000);
              }}
              className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-700 font-bold hover:bg-zinc-100 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>

        {/* Vouchers Key Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5">
          <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/80">
            <span className="text-2xs uppercase font-bold text-zinc-500 block">
              {'Total Vouchers'}
            </span>
            <span className="text-xl font-mono font-bold text-zinc-900 mt-1 block">{vouchers.length}</span>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80">
            <span className="text-2xs uppercase font-bold text-emerald-700 block">
              {'Active Vouchers'}
            </span>
            <span className="text-xl font-mono font-bold text-emerald-800 mt-1 block">
              {vouchers.filter((v) => v.isActive).length}
            </span>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80">
            <span className="text-2xs uppercase font-bold text-amber-700 block">
              {'Total User Claims'}
            </span>
            <span className="text-xl font-mono font-bold text-amber-800 mt-1 block">
              {vouchers.reduce((sum, v) => sum + (v.claimedByUsers?.length || 0), 0)}
            </span>
          </div>

          <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200/80">
            <span className="text-2xs uppercase font-bold text-blue-700 block">
              {'Free Shipping'}
            </span>
            <span className="text-xl font-mono font-bold text-blue-800 mt-1 block">
              {vouchers.filter((v) => v.discountType === 'free_shipping').length}
            </span>
          </div>
        </div>
      </div>

      {/* Vouchers List Table / Card Grid */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100">
          <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
            {'All Configured Store Vouchers'}
          </h4>
          <span className="text-xs text-zinc-500 font-mono">
            {vouchers.length} {'coupons'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vouchers.map((voucher) => (
            <VoucherTicketCard
              key={voucher.id}
              voucher={voucher}
              mode="admin"
              
              onEdit={openEditVoucherModal}
              onToggleStatus={toggleVoucherStatus}
              onDelete={handleDelete}
              notchBgClass="bg-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
