import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ProductsBulkActionsBarProps {
  selectedProductIds: string[];
  isBulkUpdating: boolean;
  onClearSelection: () => void;
  activeBulkTab: 'payments' | 'badges' | 'pricing' | null;
  setActiveBulkTab: (tab: 'payments' | 'badges' | 'pricing' | null) => void;
  bulkPaymentMethods: ('cod' | 'bkash' | 'nagad' | 'card')[];
  setBulkPaymentMethods: React.Dispatch<React.SetStateAction<('cod' | 'bkash' | 'nagad' | 'card')[]>>;
  bulkPaymentsEdited: boolean;
  setBulkPaymentsEdited: (edited: boolean) => void;
  bulkBadges: {
    isFlashDeal: boolean | null;
    isBestDeal: boolean | null;
    isNew: boolean | null;
    isBrandMall: boolean | null;
    isTrending: boolean | null;
  };
  setBulkBadges: React.Dispatch<React.SetStateAction<{
    isFlashDeal: boolean | null;
    isBestDeal: boolean | null;
    isNew: boolean | null;
    isBrandMall: boolean | null;
    isTrending: boolean | null;
  }>>;
  bulkStockVal: string;
  setBulkStockVal: (val: string) => void;
  bulkDiscountVal: string;
  setBulkDiscountVal: (val: string) => void;
  handleBulkUpdate: () => void;
}

export const ProductsBulkActionsBar: React.FC<ProductsBulkActionsBarProps> = ({
  selectedProductIds,
  isBulkUpdating,
  onClearSelection,
  activeBulkTab,
  setActiveBulkTab,
  bulkPaymentMethods,
  setBulkPaymentMethods,
  bulkPaymentsEdited,
  setBulkPaymentsEdited,
  bulkBadges,
  setBulkBadges,
  bulkStockVal,
  setBulkStockVal,
  bulkDiscountVal,
  setBulkDiscountVal,
  handleBulkUpdate,
}) => {
  if (selectedProductIds.length === 0) return null;

  return (
    <div className="bg-white border border-zinc-200 text-zinc-800 rounded-lg py-1.5 px-3 mb-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-xs font-black rounded font-mono">
          {selectedProductIds.length}
        </span>
        <span className="text-xs font-bold text-zinc-600">Selected</span>
        <button
          type="button"
          disabled={isBulkUpdating}
          onClick={onClearSelection}
          className="text-2xs text-zinc-400 hover:text-zinc-600 underline font-semibold cursor-pointer"
        >
          Clear
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 relative z-20">
        <button
          type="button"
          disabled={isBulkUpdating}
          onClick={() => setActiveBulkTab(activeBulkTab === 'payments' ? null : 'payments')}
          className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all border cursor-pointer ${
            activeBulkTab === 'payments'
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs font-black'
              : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
          }`}
        >
          <span>🚚</span>
          <span>Payments</span>
        </button>

        <button
          type="button"
          disabled={isBulkUpdating}
          onClick={() => setActiveBulkTab(activeBulkTab === 'badges' ? null : 'badges')}
          className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all border cursor-pointer ${
            activeBulkTab === 'badges'
              ? 'bg-purple-600 border-purple-500 text-white shadow-xs font-black'
              : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
          }`}
        >
          <span>⭐</span>
          <span>Badges</span>
        </button>

        <button
          type="button"
          disabled={isBulkUpdating}
          onClick={() => setActiveBulkTab(activeBulkTab === 'pricing' ? null : 'pricing')}
          className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all border cursor-pointer ${
            activeBulkTab === 'pricing'
              ? 'bg-blue-600 border-blue-500 text-white shadow-xs font-black'
              : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
          }`}
        >
          <span>🏷️</span>
          <span>Stock & Discount</span>
        </button>

        <Button
          type="button"
          size="sm"
          disabled={isBulkUpdating}
          onClick={handleBulkUpdate}
          className="h-7 px-3 text-xs font-bold bg-primary hover:bg-primary-hover text-white rounded-md ml-auto"
        >
          {isBulkUpdating && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
          Apply to Selected ({selectedProductIds.length})
        </Button>
      </div>
    </div>
  );
};
