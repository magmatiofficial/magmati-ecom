'use client';

import React, { useState } from 'react';
import { Database, Download, RotateCcw, CheckCircle2 } from 'lucide-react';
import { exportFullStoreBackup } from '@/lib/dataTransferUtils';
import { useProductStore } from '@/store/useProductStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useVoucherStore } from '@/store/useVoucherStore';

interface BackupResetSettingsProps {
  siteSettings: {
    resetSettings: () => void;
    addSection: (fields: any) => void;
  };
  resetMessage: string;
  setResetMessage: (val: string) => void;
  showResetConfirm: boolean;
  setShowResetConfirm: (val: boolean) => void;
}

export const BackupResetSettings: React.FC<BackupResetSettingsProps> = ({
  siteSettings,
  resetMessage,
  setResetMessage,
  showResetConfirm,
  setShowResetConfirm,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSecId, setNewSecId] = useState('');
  const [newSecName, setNewSecName] = useState('');

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
            onClick={() => {
              const products = useProductStore.getState().products;
              const orders = useOrderStore.getState().orders;
              const categories = useCategoryStore.getState().categories;
              const vouchers = useVoucherStore.getState().vouchers;
              exportFullStoreBackup({
                products,
                orders,
                categories,
                siteSettings,
                vouchers,
              });
            }}
            className="px-4 py-2.5 bg-surface-dark hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>{'Download Backup (.json)'}</span>
          </button>
        </div>
      </div>

      {/* Reset Defaults Block */}
      <div className="p-5 rounded-2xl bg-red-50/60 border border-red-200 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h5 className="font-bold text-red-900 text-xs sm:text-sm">
              {'Factory Defaults Reset'}
            </h5>
            <p className="text-2xs text-red-700/80">
              {'Reset all layout, shipping, banners, and store configurations to factory initial presets.'}
            </p>
          </div>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{'Reset Defaults'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 p-1.5 bg-white border border-red-200 rounded-xl">
              <span className="text-xs font-bold text-red-800 px-2">Confirm reset?</span>
              <button
                type="button"
                onClick={() => {
                  siteSettings.resetSettings();
                  setShowResetConfirm(false);
                  setResetMessage('All site settings & layouts successfully reset to factory defaults!');
                  setTimeout(() => setResetMessage(''), 5000);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 bg-surface-subtle hover:bg-zinc-200 text-text-muted rounded-lg text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reset Feedback Notification */}
      {resetMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resetMessage}</span>
          </div>
          <button type="button" onClick={() => setResetMessage('')} className="text-emerald-700 hover:text-emerald-950 font-bold text-xs cursor-pointer">✕</button>
        </div>
      )}

      {/* Add Custom Section Modal Triggered from parent or local store custom add */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-text-main">
              {'Create Custom Section'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-text-muted block mb-1">Section ID (e.g. custom_promo)</label>
                <input
                  type="text"
                  value={newSecId}
                  onChange={(e) => setNewSecId(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  placeholder="e.g. promo_banner"
                  className="w-full h-10 px-3 bg-white border border-border-color rounded-xl text-xs font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-muted block mb-1">Section Name</label>
                <input
                  type="text"
                  value={newSecName}
                  onChange={(e) => setNewSecName(e.target.value)}
                  placeholder="e.g. Special Promo Banner"
                  className="w-full h-10 px-3 bg-white border border-border-color rounded-xl text-xs font-medium"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!newSecId || !newSecName) return;
                  siteSettings.addSection({
                    id: newSecId,
                    name: newSecName,
                    enabled: true,
                    preset: 'custom_grid',
                  });
                  setNewSecId('');
                  setNewSecName('');
                  setShowAddModal(false);
                }}
                className="flex-1 h-10 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover shadow-md cursor-pointer"
              >
                {'Create Section'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 h-10 bg-surface-subtle text-text-muted rounded-xl text-xs font-bold hover:bg-zinc-200 cursor-pointer"
              >
                {'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
