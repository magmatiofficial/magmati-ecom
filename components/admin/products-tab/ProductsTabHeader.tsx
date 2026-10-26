import React from 'react';
import { Search, Plus, Download, Upload, Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

export interface ProductsTabHeaderProps {
  adminProductSearch: string;
  setAdminProductSearch: (val: string) => void;
  adminProductCat: string;
  setAdminProductCat: (val: string) => void;
  lowStockOnly: boolean;
  setLowStockOnly: (val: boolean) => void;
  categories: Array<{ id: string; name: string }>;
  openAddProductModal: () => void;
  setIsImportModalOpen: (val: boolean) => void;
  exportProductsToCSV: () => void;
  exportProductsToJSON: () => void;
  setShowSyncConfirm: (val: boolean) => void;
  isSyncingCatalog: boolean;
}

export const ProductsTabHeader: React.FC<ProductsTabHeaderProps> = ({
  adminProductSearch,
  setAdminProductSearch,
  adminProductCat,
  setAdminProductCat,
  lowStockOnly,
  setLowStockOnly,
  categories,
  openAddProductModal,
  setIsImportModalOpen,
  exportProductsToCSV,
  exportProductsToJSON,
  setShowSyncConfirm,
  isSyncingCatalog,
}) => {
  return (
    <div className="flex flex-col gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-zinc-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 font-sans">Product Catalog Management</h2>
          <p className="text-xs text-zinc-500">Manage stock, pricing, multi-media, and marketplace categories.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={openAddProductModal} className="h-10 px-4 rounded-xl text-xs font-bold gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
          <Button onClick={() => setIsImportModalOpen(true)} variant="outline" className="h-10 px-4 rounded-xl text-xs font-bold gap-2">
            <Upload className="w-4 h-4" /> Import CSV/JSON
          </Button>
          <Button onClick={exportProductsToCSV} variant="outline" className="h-10 px-3 rounded-xl text-xs font-bold gap-1.5" title="Export CSV">
            <Download className="w-4 h-4" /> CSV
          </Button>
          <Button onClick={exportProductsToJSON} variant="outline" className="h-10 px-3 rounded-xl text-xs font-bold gap-1.5" title="Export JSON">
            <Download className="w-4 h-4" /> JSON
          </Button>
          <Button onClick={() => setShowSyncConfirm(true)} disabled={isSyncingCatalog} variant="outline" className="h-10 px-3 rounded-xl text-xs font-bold gap-1.5 text-primary border-primary/30">
            {isSyncingCatalog ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            Sync DB
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-zinc-100">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={adminProductSearch}
            onChange={(e) => setAdminProductSearch(e.target.value)}
            placeholder="Search by product name, SKU, or brand..."
            className="w-full h-10 pl-10 pr-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-hidden focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CustomDropdown
            value={adminProductCat}
            onChange={setAdminProductCat}
            options={[
              { label: 'All Categories', value: 'All' },
              ...categories.map((c) => ({ label: c.name, value: c.name })),
            ]}
            className="h-10 text-xs w-44"
          />
          <button
            type="button"
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`h-10 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              lowStockOnly
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            Low Stock Only
          </button>
        </div>
      </div>
    </div>
  );
};
