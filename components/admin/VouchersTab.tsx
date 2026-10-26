'use client';

import React, { useState } from 'react';
import { Ticket, Plus, RotateCcw, Loader2, Download } from 'lucide-react';
import { Voucher, useVoucherStore } from '@/store/useVoucherStore';
import { VoucherTicketCard } from '@/components/ui/VoucherTicketCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/store/useToastStore';

interface VouchersTabProps {
  vouchers: Voucher[];
  openAddVoucherModal: () => void;
  openEditVoucherModal: (voucher: Voucher) => void;
  toggleVoucherStatus: (id: string) => void | Promise<void>;
  deleteVoucher: (id: string) => void | Promise<void>;
}

export const VouchersTab: React.FC<VouchersTabProps> = ({
  vouchers = [],
  openAddVoucherModal,
  openEditVoucherModal,
  toggleVoucherStatus,
  deleteVoucher,
}) => {
  const { resetVouchersToDefault, maxVouchersPerOrder, setMaxVouchersPerOrder, importDefaultVouchers } = useVoucherStore();
  
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isUpdatingLimit, setIsUpdatingLimit] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Shared Confirmation Dialog State
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

  const handleImportDefaults = async () => {
    setIsImporting(true);
    try {
      const res = await importDefaultVouchers();
      toast.success(`${res.added} new imported, ${res.skipped} already existed`);
    } catch (err) {
      toast.error('Failed to import default vouchers');
    } finally {
      setIsImporting(false);
    }
  };

  const handleResetVouchers = async () => {
    setIsConfirmLoading(true);
    try {
      await resetVouchersToDefault();
      setConfirmDialog(prev => ({ ...prev, open: false }));
      toast.success('All vouchers successfully reset to defaults!');
    } catch (err) {
      toast.error('Failed to reset vouchers');
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const openResetConfirm = () => {
    setConfirmDialog({
      open: true,
      title: 'Reset Vouchers to Defaults',
      message: 'Are you sure you want to reset all vouchers to the default factory settings? This will delete all custom vouchers you have created.',
      confirmLabel: 'Restore',
      cancelLabel: 'Cancel',
      onConfirm: handleResetVouchers,
    });
  };

  const handleDelete = (id: string) => {
    const target = vouchers.find((v) => v.id === id);
    setConfirmDialog({
      open: true,
      title: `Delete Voucher: ${target?.code || id}`,
      message: `Are you sure you want to permanently delete the voucher code "${target?.code || id}"?`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          await deleteVoucher(id);
          toast.success(`Voucher "${target?.code || id}" deleted successfully`);
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } catch (err) {
          toast.error('Failed to delete voucher');
        } finally {
          setIsConfirmLoading(false);
        }
      }
    });
  };

  const handleToggleStatus = async (id: string) => {
    if (togglingId) return;
    setTogglingId(id);
    try {
      await toggleVoucherStatus(id);
      const target = vouchers.find((v) => v.id === id);
      const nextState = target ? !target.isActive : true;
      toast.success(`Voucher "${target?.code || id}" is now ${nextState ? 'Active' : 'Inactive'}`);
    } catch (err) {
      toast.error('Failed to update voucher status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleUpdateLimit = async (newVal: number) => {
    setIsUpdatingLimit(true);
    try {
      await setMaxVouchersPerOrder(newVal);
      toast.success(`Stacking limit set to ${newVal}`);
    } catch (err) {
      toast.error('Failed to update stacking limit');
    } finally {
      setIsUpdatingLimit(false);
    }
  };

  return (
    <div className="space-y-6">
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
            <button
              type="button"
              disabled={isImporting || isConfirmLoading}
              onClick={handleImportDefaults}
              className="px-3.5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Import default promo codes into Firestore"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>{'Importing...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{'Import Defaults'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isImporting || isConfirmLoading}
              onClick={openResetConfirm}
              className="px-3.5 py-2.5 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reset vouchers to factory default promo codes"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              <span>{'Reset Defaults'}</span>
            </button>

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
              disabled={maxVouchersPerOrder <= 1 || isUpdatingLimit}
              onClick={() => handleUpdateLimit(maxVouchersPerOrder - 1)}
              className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-700 font-bold hover:bg-zinc-100 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="w-10 text-center font-mono font-black text-xs text-zinc-900 bg-white border border-zinc-200 py-1.5 rounded-lg flex items-center justify-center">
              {isUpdatingLimit ? <Loader2 className="w-3 h-3 animate-spin text-zinc-500" /> : maxVouchersPerOrder}
            </span>
            <button
              type="button"
              disabled={maxVouchersPerOrder >= 5 || isUpdatingLimit}
              onClick={() => handleUpdateLimit(maxVouchersPerOrder + 1)}
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
          <p className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
            {'All Configured Store Vouchers'}
          </p>
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
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              notchBgClass="bg-white"
            />
          ))}
        </div>
      </div>

      {/* Shared Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
        confirmLabel={confirmDialog.confirmLabel || 'Delete'}
        cancelLabel={confirmDialog.cancelLabel || 'Cancel'}
        loading={isConfirmLoading}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
};
