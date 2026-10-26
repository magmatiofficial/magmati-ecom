'use client';

import React, { useState } from 'react';
import { Database, Download, RotateCcw, CheckCircle2, Loader2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { exportFullStoreBackup } from '@/lib/dataTransferUtils';
import { useProductStore } from '@/store/useProductStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useVoucherStore } from '@/store/useVoucherStore';
import { fetchAllAdminOrders } from '@/lib/orders/fetchAllAdminOrders';
import { toast } from '@/store/useToastStore';

interface BackupResetSettingsProps {
  siteSettings: {
    resetSettings: () => void;
  };
}

export const BackupResetSettings: React.FC<BackupResetSettingsProps> = ({
  siteSettings,
}) => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
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


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 flex-wrap gap-2">
        <div>
          <h4 className="font-bold text-text-main text-sm flex items-center gap-2">
            <Database className="w-4.5 h-4.5 text-primary" />
            <span>{'Full Store Backup & Maintenance'}</span>
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            {'Download complete JSON snapshots of your store or restore initial default presets.'}
          </p>
        </div>
      </div>

      <div className="p-5 bg-gradient-to-br from-zinc-50 to-zinc-100/80 rounded-2xl border border-border-color space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-surface-dark text-white flex items-center justify-center shadow-xs">
              <Database className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h5 className="font-bold text-text-main text-sm">
                {'Export All-in-One Store Backup (.json)'}
              </h5>
              <p className="text-xs text-text-muted">
                {'Instant snapshot with all products, orders, categories, vouchers, and settings.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isBackingUp}
            onClick={async () => {
              setIsBackingUp(true);
              try {
                await new Promise((res) => setTimeout(res, 400));
                const ordersResult = await fetchAllAdminOrders();
                if (!ordersResult.ok) {
                  toast.error(ordersResult.error);
                  return;
                }
                const products = useProductStore.getState().products;
                const orders = ordersResult.orders;
                const categories = useCategoryStore.getState().categories;
                const vouchers = useVoucherStore.getState().vouchers;
                exportFullStoreBackup({
                  products,
                  orders,
                  categories,
                  siteSettings,
                  vouchers,
                });
              } finally {
                setIsBackingUp(false);
              }
            }}
            className="px-4 py-2.5 bg-surface-dark hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isBackingUp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Preparing Backup...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-amber-400" />
                <span>{'Download Backup (.json)'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Shared Reset Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        loading={isResetting}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
};
