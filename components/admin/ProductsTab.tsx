'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Search, Plus, Copy, Edit, Trash, Lock, Layers, Download, Upload, CheckCircle2, Loader2, ChevronDown, Database } from 'lucide-react';
import { Product } from '@/types';
import { useProductStore } from '@/store/useProductStore';
import { ResponsiveTableContainer } from '@/components/ui/ResponsiveTableContainer';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { Button } from '@/components/ui/Button';
import { exportProductsToCSV, exportProductsToJSON } from '@/lib/dataTransferUtils';
import { ProductImportModal } from '@/components/admin/modals/ProductImportModal';
import { seedProductsToFirestore } from '@/hooks/useProductSync';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/utils';

interface ProductsTabProps {
  products: Product[];
  adminProductSearch: string;
  setAdminProductSearch: (val: string) => void;
  adminProductCat: string;
  setAdminProductCat: (val: string) => void;
  lowStockOnly: boolean;
  setLowStockOnly: (val: boolean) => void;
  siteSettings: {
    lowStockThreshold: number;
  };
  resetToDefault: () => void;
  openAddProductModal: () => void;
  openEditProductModal: (product: Product) => void;
  duplicateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  adminProductSearch,
  setAdminProductSearch,
  adminProductCat,
  setAdminProductCat,
  lowStockOnly,
  setLowStockOnly,
  siteSettings,
  resetToDefault,
  openAddProductModal,
  openEditProductModal,
  duplicateProduct,
  deleteProduct,
}) => {
  const { updateProduct, quickAdjustStock, bulkAddProducts, replaceProducts } = useProductStore();

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [activeBulkTab, setActiveBulkTab] = useState<'payments' | 'badges' | 'pricing' | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showCatalogResetConfirm, setShowCatalogResetConfirm] = useState(false);
  const [isSyncingCatalog, setIsSyncingCatalog] = useState(false);
  const [productToast, setProductToast] = useState('');
  
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [syncResult, setSyncResult] = useState<{ added: number; skipped: number } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Infinite Scroll state for Admin Products Table
  const ADMIN_BATCH_SIZE = 15;
  const [visibleCount, setVisibleCount] = useState<number>(ADMIN_BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleSyncCatalogToDatabase = () => {
    setShowSyncConfirm(true);
  };

  const handleConfirmSync = async () => {
    setIsSyncingCatalog(true);
    setSyncResult(null);
    setSyncError(null);
    try {
      const result = await seedProductsToFirestore();
      setSyncResult(result);
      setProductToast(`Catalog sync complete: Added ${result.added} new products, skipped ${result.skipped} existing.`);
      setTimeout(() => setProductToast(''), 5000);
    } catch (err: any) {
      console.error('Firestore catalog sync failed:', err);
      const errorMsg = err?.message || 'Failed to sync catalog to database.';
      setSyncError(errorMsg);
      setProductToast(`Sync error: ${errorMsg}`);
      setTimeout(() => setProductToast(''), 6000);
    } finally {
      setIsSyncingCatalog(false);
      setShowSyncConfirm(false);
    }
  };

  const handleResetCatalog = () => {
    resetToDefault();
    setShowCatalogResetConfirm(false);
    setProductToast(
      'Catalog successfully reset to default factory products!'
    );
    setTimeout(() => setProductToast(''), 4500);
  };

  const handleImportSuccess = (importedProducts: Product[], mode: 'append' | 'replace') => {
    if (mode === 'append') {
      bulkAddProducts(importedProducts);
    } else {
      replaceProducts(importedProducts);
    }
  };

  const [bulkPaymentMethods, setBulkPaymentMethods] = useState<('cod' | 'bkash' | 'nagad' | 'card')[]>(['cod', 'bkash', 'nagad', 'card']);
  const [bulkBadges, setBulkBadges] = useState<{
    isFlashDeal: boolean | null;
    isBestDeal: boolean | null;
    isNew: boolean | null;
    isBrandMall: boolean | null;
    isTrending: boolean | null;
  }>({
    isFlashDeal: null,
    isBestDeal: null,
    isNew: null,
    isBrandMall: null,
    isTrending: null,
  });

  const [bulkStockVal, setBulkStockVal] = useState<string>('');
  const [bulkDiscountVal, setBulkDiscountVal] = useState<string>('');

  // Dropdown click-outside handler
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeBulkTab && !(event.target as HTMLElement).closest('.bulk-dropdown-container')) {
        setActiveBulkTab(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeBulkTab]);

  const handleBulkUpdate = () => {
    if (selectedProductIds.length === 0) return;
    
    selectedProductIds.forEach((id) => {
      const prod = products.find((p) => p.id === id);
      if (!prod) return;

      const updatedFields: Partial<Product> = {};

      // 1. Payment Methods
      updatedFields.allowedPaymentMethods = bulkPaymentMethods;

      // 2. Badges (Tri-state)
      if (bulkBadges.isFlashDeal !== null) updatedFields.isFlashDeal = bulkBadges.isFlashDeal;
      if (bulkBadges.isBestDeal !== null) updatedFields.isBestDeal = bulkBadges.isBestDeal;
      if (bulkBadges.isNew !== null) updatedFields.isNew = bulkBadges.isNew;
      if (bulkBadges.isBrandMall !== null) updatedFields.isBrandMall = bulkBadges.isBrandMall;
      if (bulkBadges.isTrending !== null) updatedFields.isTrending = bulkBadges.isTrending;

      // 3. Stock Adjustment
      if (bulkStockVal.trim() !== '') {
        const stockNum = parseInt(bulkStockVal, 10);
        if (!isNaN(stockNum)) {
          updatedFields.stockQuantity = stockNum;
          updatedFields.inStock = stockNum > 0;
        }
      }

      // 4. Discount / Price Adjustment
      if (bulkDiscountVal.trim() !== '') {
        const discountNum = parseFloat(bulkDiscountVal);
        if (!isNaN(discountNum) && discountNum >= 0 && discountNum <= 100) {
          const basePrice = prod.originalPrice || prod.price;
          const discounted = Math.round(basePrice * (1 - discountNum / 100));
          updatedFields.originalPrice = basePrice;
          updatedFields.price = discounted;
        }
      }

      updateProduct(id, updatedFields);
    });

    const msg = `Successfully bulk updated payment methods, badges, and inventory metrics for ${selectedProductIds.length} products!`;
    
    setProductToast(msg);
    setTimeout(() => setProductToast(''), 5000);
    setSelectedProductIds([]);
    setBulkStockVal('');
    setBulkDiscountVal('');
    setActiveBulkTab(null);
    setBulkBadges({
      isFlashDeal: null,
      isBestDeal: null,
      isNew: null,
      isBrandMall: null,
      isTrending: null,
    });
  };

  const filteredAdminProducts = products.filter((p) => {
    const searchLower = adminProductSearch.toLowerCase().trim();
    const matchesSearch = !searchLower ||
      p.name.toLowerCase().includes(searchLower) ||
      (p.sku && p.sku.toLowerCase().includes(searchLower));

    const matchesCat = adminProductCat === 'All' || p.category === adminProductCat;

    const threshold = p.lowStockThreshold ?? siteSettings.lowStockThreshold;
    const matchesLowStock = !lowStockOnly || (p.stockQuantity ?? 10) <= threshold;

    return matchesSearch && matchesCat && matchesLowStock;
  });

  // Reset infinite scroll batch when filters change
  useEffect(() => {
    setVisibleCount(ADMIN_BATCH_SIZE);
    setIsLoadingMore(false);
  }, [adminProductSearch, adminProductCat, lowStockOnly]);

  const displayedAdminProducts = filteredAdminProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAdminProducts.length;

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || visibleCount >= filteredAdminProducts.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + ADMIN_BATCH_SIZE, filteredAdminProducts.length));
      setIsLoadingMore(false);
    }, 120);
  }, [isLoadingMore, visibleCount, filteredAdminProducts.length]);

  // IntersectionObserver for auto-scroll loading inside table
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, handleLoadMore]);

  return (
    <div className="space-y-2">
      {/* Search & Action bar - Compact */}
      <div className="bg-white rounded-xl border border-zinc-200 p-2 sm:px-3 sm:py-2 flex flex-col lg:flex-row gap-2 lg:items-center justify-between shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto flex-1">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={adminProductSearch}
              onChange={(e) => setAdminProductSearch(e.target.value)}
              placeholder="Search SKU or Product name..."
              className="w-full h-8 pl-8 pr-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="w-full sm:w-auto min-w-[160px]">
            <CustomDropdown
              value={adminProductCat}
              onChange={(val) => setAdminProductCat(val)}
              searchable={false}
              options={[
                { value: 'All', label: 'All Categories' },
                { value: 'Electronics & Gadgets', label: 'Electronics' },
                { value: "Men's Fashion", label: "Men's Fashion" },
                { value: "Women's Fashion", label: "Women's Fashion" },
                { value: 'Kids & Baby Care', label: 'Kids & Baby' },
                { value: 'Home & Kitchen Appliances', label: 'Home & Kitchen' },
                { value: 'Beauty & Personal Care', label: 'Beauty & Personal Care' },
                { value: 'Footwear & Leather', label: 'Footwear' },
              ]}
              triggerClassName="h-8 px-2.5 text-xs bg-zinc-50 border-zinc-200"
              dropdownClassName="min-w-[180px]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`h-8 px-2.5 sm:px-3 rounded-lg border text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              lowStockOnly 
                ? 'bg-amber-500 text-white border-amber-600 shadow-inner' 
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-2xs'
            }`}
          >
            <span>Low Stock</span>
            <span className={`px-1.5 py-0.2 rounded-full text-2xs ${lowStockOnly ? 'bg-white/20' : 'bg-zinc-100 text-zinc-600'}`}>
              {products.filter(p => (p.stockQuantity ?? 10) <= (p.lowStockThreshold ?? siteSettings.lowStockThreshold)).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => exportProductsToCSV(products)}
            className="h-8 px-2 sm:px-2.5 rounded-lg border border-zinc-200 bg-white text-xs font-bold hover:bg-zinc-50 transition-colors shadow-2xs text-zinc-700 flex items-center gap-1 cursor-pointer"
            title="Export Products as CSV (Excel format)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            type="button"
            onClick={() => exportProductsToJSON(products)}
            className="h-8 px-2 sm:px-2.5 rounded-lg border border-zinc-200 bg-white text-xs font-bold hover:bg-zinc-50 transition-colors shadow-2xs text-zinc-700 flex items-center gap-1 cursor-pointer"
            title="Export Products as JSON"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="h-8 px-2.5 sm:px-3 rounded-lg border border-zinc-200 bg-white text-xs font-bold hover:bg-zinc-50 transition-colors shadow-2xs text-zinc-700 flex items-center gap-1 cursor-pointer"
            title="Import Products from CSV or JSON"
          >
            <Upload className="w-3.5 h-3.5 text-purple-600" />
            <span>{'Import'}</span>
          </button>

          {!showCatalogResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowCatalogResetConfirm(true)}
              className="h-8 px-2.5 sm:px-3 rounded-lg border border-zinc-200 bg-white text-xs font-bold hover:bg-zinc-50 transition-colors shadow-2xs text-zinc-700 cursor-pointer"
              title="Reset dynamic catalog back to default static products list"
            >
              {'Reset'}
            </button>
          ) : (
            <div className="flex items-center gap-1 p-0.5 bg-amber-50 border border-amber-300 rounded-lg animate-in fade-in">
              <button
                type="button"
                onClick={handleResetCatalog}
                className="h-7 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold transition-colors cursor-pointer"
              >
                {'Confirm'}
              </button>
              <button
                type="button"
                onClick={() => setShowCatalogResetConfirm(false)}
                className="h-7 px-1.5 bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200 rounded text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSyncCatalogToDatabase}
            isLoading={isSyncingCatalog}
            leftIcon={<Database className="w-3.5 h-3.5 text-indigo-600" />}
            className="h-8 text-xs font-bold border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 shadow-2xs cursor-pointer"
            title="Sync master static products to Firestore (never overwrites existing items)"
          >
            <span className="hidden sm:inline">Sync catalog to database</span>
            <span className="sm:hidden">Sync catalog</span>
          </Button>

          <button
            type="button"
            onClick={openAddProductModal}
            className="h-8 px-2.5 sm:px-3.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Persistent Sync Result Line */}
      {(syncResult || syncError) && (
        <div className={cn(
          "p-3 border rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in duration-150",
          syncError 
            ? "bg-red-50 border-red-200 text-red-900" 
            : "bg-indigo-50 border-indigo-200 text-indigo-900"
        )}>
          <div className="flex items-center gap-2">
            <Database className={cn("w-4 h-4 shrink-0", syncError ? "text-red-600" : "text-indigo-600")} />
            <span>
              {syncError 
                ? `Sync failed: ${syncError}` 
                : `Last sync: Added ${syncResult?.added} new products, skipped ${syncResult?.skipped} existing.`
              }
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSyncResult(null);
              setSyncError(null);
            }}
            className={cn(
              "font-bold text-xs cursor-pointer p-0.5 transition-colors",
              syncError ? "text-red-700 hover:text-red-950" : "text-indigo-700 hover:text-indigo-950"
            )}
          >
            ✕
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {productToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{productToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setProductToast('')}
            className="text-emerald-700 hover:text-emerald-950 font-bold text-xs cursor-pointer p-0.5"
            aria-label="Dismiss toast"
          >
            ✕
          </button>
        </div>
      )}

      {/* Table-Top Compact Bulk Action Bar */}
      {selectedProductIds.length > 0 && (
        <div className="bg-white border border-zinc-200 text-zinc-800 rounded-lg py-1.5 px-3 mb-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs animate-in fade-in duration-150">
          
          {/* Selected Info */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-xs font-black rounded font-mono">
              {selectedProductIds.length}
            </span>
            <span className="text-xs font-bold text-zinc-600">
              {'Selected'}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedProductIds([]);
                setActiveBulkTab(null);
              }}
              className="text-2xs text-zinc-400 hover:text-zinc-600 underline font-semibold cursor-pointer transition-colors"
            >
              {'Clear'}
            </button>
          </div>

          {/* Action Row containing dropdowns */}
          <div className="flex flex-wrap items-center gap-1.5 relative z-20">
            
            {/* Popover 1: Payments */}
            <div className="relative bulk-dropdown-container">
              <button
                type="button"
                onClick={() => setActiveBulkTab(activeBulkTab === 'payments' ? null : 'payments')}
                className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all border cursor-pointer ${
                  activeBulkTab === 'payments'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs font-black'
                    : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
                }`}
              >
                <span>🚚</span>
                <span>{'Payments'}</span>
                <span className="text-2xs opacity-60">▼</span>
              </button>

              {activeBulkTab === 'payments' && (
                <div className="absolute top-full mt-1.5 left-0 z-30 w-60 bg-white border border-zinc-200 p-2.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-1 duration-150 text-zinc-800">
                  <div className="absolute bottom-full left-4 border-6 border-transparent border-b-white"></div>
                  <div className="text-2xs font-extrabold text-zinc-500 uppercase tracking-wider mb-1.5">
                    {'Allowed Payments'}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { id: 'cod', label: 'COD', icon: '🚚' },
                      { id: 'bkash', label: 'bKash', icon: '📱' },
                      { id: 'nagad', label: 'Nagad', icon: '📱' },
                      { id: 'card', label: 'Card', icon: '💳' },
                    ].map((pm) => {
                      const isSelected = bulkPaymentMethods.includes(pm.id as any);
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (bulkPaymentMethods.length <= 1) {
                                setProductToast('At least one payment method must remain selected!');
                                setTimeout(() => setProductToast(''), 5000);
                                return;
                              }
                              setBulkPaymentMethods(bulkPaymentMethods.filter((m) => m !== pm.id));
                            } else {
                              setBulkPaymentMethods([...bulkPaymentMethods, pm.id as any]);
                            }
                          }}
                          className={`px-1.5 py-1 rounded text-2xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          <span>{pm.icon}</span>
                          <span>{pm.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Popover 2: Badges */}
            <div className="relative bulk-dropdown-container">
              <button
                type="button"
                onClick={() => setActiveBulkTab(activeBulkTab === 'badges' ? null : 'badges')}
                className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all border cursor-pointer ${
                  activeBulkTab === 'badges'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs font-black'
                    : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
                }`}
              >
                <span>🏷️</span>
                <span>{'Homepage Badges'}</span>
                <span className="text-2xs opacity-60">▼</span>
              </button>

              {activeBulkTab === 'badges' && (
                <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 z-30 w-64 bg-white border border-zinc-200 p-2.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-1 duration-150 text-zinc-800 cursor-default">
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-6 border-transparent border-b-white"></div>
                  <div className="text-2xs font-extrabold text-zinc-500 uppercase tracking-wider mb-1.5">
                    {'Badges Controller'}
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { key: 'isFlashDeal', label: 'Flash Deal ⚡' },
                      { key: 'isBestDeal', label: 'Budget Deal 💰' },
                      { key: 'isNew', label: 'New Arrival ✨' },
                      { key: 'isBrandMall', label: 'Brand Mall 🏢' },
                      { key: 'isTrending', label: 'Trending 🔥' },
                    ].map((badge) => {
                      const val = bulkBadges[badge.key as keyof typeof bulkBadges];
                      return (
                        <div key={badge.key} className="flex items-center justify-between border-b border-zinc-100 pb-1 last:border-0 last:pb-0">
                          <span className="text-2xs font-bold text-zinc-700 truncate mr-2">{badge.label}</span>
                          <div className="flex gap-0.5 shrink-0">
                            {[
                              { val: null, label: 'Skip', bgActive: 'bg-zinc-400 text-white text-2xs' },
                              { val: true, label: 'ON', bgActive: 'bg-emerald-600 text-white font-extrabold text-2xs' },
                              { val: false, label: 'OFF', bgActive: 'bg-rose-600 text-white font-extrabold text-2xs' },
                            ].map((btn) => {
                              const isActive = val === btn.val;
                              return (
                                <button
                                  key={String(btn.val)}
                                  type="button"
                                  onClick={() => setBulkBadges({ ...bulkBadges, [badge.key]: btn.val })}
                                  className={`px-1 py-0.5 rounded text-2xs transition-all cursor-pointer border ${
                                    isActive 
                                      ? `${btn.bgActive} border-transparent shadow-xs` 
                                      : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                                  }`}
                                >
                                  {btn.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Popover 3: Pricing & Stock */}
            <div className="relative bulk-dropdown-container">
              <button
                type="button"
                onClick={() => setActiveBulkTab(activeBulkTab === 'pricing' ? null : 'pricing')}
                className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all border cursor-pointer ${
                  activeBulkTab === 'pricing'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs font-black'
                    : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
                }`}
              >
                <span>📦</span>
                <span>{'Stock & Price'}</span>
                <span className="text-2xs opacity-60">▼</span>
              </button>

              {activeBulkTab === 'pricing' && (
                <div className="absolute top-full mt-1.5 right-0 z-30 w-60 bg-white border border-zinc-200 p-2.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-1 duration-150 text-zinc-800 space-y-2">
                  <div className="absolute bottom-full right-4 border-6 border-transparent border-b-white"></div>
                  <div className="text-2xs font-extrabold text-zinc-500 uppercase tracking-wider">
                    {'Inventory & Price Adjust'}
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xs font-semibold text-zinc-500 block">{'Set stock quantity:'}</span>
                    <input
                      type="number"
                      value={bulkStockVal}
                      onChange={(e) => setBulkStockVal(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full h-7 px-2 text-2xs bg-zinc-50 border border-zinc-200 rounded-md text-zinc-800 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xs font-semibold text-zinc-500 block">{'Set discount %:'}</span>
                    <input
                      type="number"
                      value={bulkDiscountVal}
                      onChange={(e) => setBulkDiscountVal(e.target.value)}
                      placeholder="e.g. 15 for 15% off"
                      className="w-full h-7 px-2 text-2xs bg-zinc-50 border border-zinc-200 rounded-md text-zinc-800 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleBulkUpdate}
              className="px-2.5 h-6.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-colors cursor-pointer flex items-center gap-1 uppercase tracking-wider shadow-xs"
            >
              <span>💾</span>
              <span>{'Save'}</span>
            </button>

          </div>

        </div>
      )}

      {/* Inventory Table with Fit-To-Screen Responsive Height */}
      <ResponsiveTableContainer showScrollCues={true}>
        <table className="w-full text-left text-xs font-sans whitespace-nowrap border-collapse min-w-[1020px]">
          <thead className="bg-zinc-100 text-zinc-600 uppercase tracking-wider text-xs font-bold sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <tr>
              <th className="px-2.5 py-2 border-b border-r border-zinc-200 bg-zinc-100 w-9 text-center">
                <input
                  type="checkbox"
                  checked={filteredAdminProducts.length > 0 && selectedProductIds.length === filteredAdminProducts.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProductIds(filteredAdminProducts.map(p => p.id));
                    } else {
                      setSelectedProductIds([]);
                    }
                  }}
                  className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
                />
              </th>
              <th className="px-2.5 py-2 border-b border-r border-zinc-200 bg-zinc-100 w-12 text-center">Visual</th>
              <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100 min-w-[200px]">Product Details</th>
              <th className="px-2.5 py-2 border-b border-r border-zinc-200 bg-zinc-100">Category</th>
              <th className="px-2.5 py-2 border-b border-r border-zinc-200 bg-zinc-100">SKU / Code</th>
              <th className="px-2.5 py-2 border-b border-r border-zinc-200 bg-zinc-100 text-center">Sections / Badges</th>
              <th className="px-2.5 py-2 border-b border-r border-zinc-200 bg-zinc-100 text-center">Payment Methods</th>
              <th className="px-2.5 py-2 border-b border-r border-zinc-200 bg-zinc-100 text-right">Price (BDT)</th>
              <th className="px-2.5 py-2 border-b border-r border-zinc-200 bg-zinc-100 text-center">Stock Status</th>
              <th className="px-2.5 py-2 border-b border-zinc-200 bg-zinc-100 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {displayedAdminProducts.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 border-b border-r border-zinc-200 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                  No products found matching the criteria.
                </td>
              </tr>
            ) : (
              displayedAdminProducts.map((p) => (
                <tr key={p.id} className={`hover:bg-amber-50/40 transition-colors group ${selectedProductIds.includes(p.id) ? 'bg-amber-50/20' : ''}`}>
                  <td className="px-2.5 py-1.5 border-b border-r border-zinc-200 text-center">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProductIds([...selectedProductIds, p.id]);
                        } else {
                          setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                        }
                      }}
                      className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-2 py-1.5 border-b border-r border-zinc-200 text-center">
                    <div className="relative w-8.5 h-10 rounded-md overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0 mx-auto">
                      <Image
                        src={p.images[0] || 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800&auto=format&fit=crop'}
                        alt={p.name || "Product catalog thumbnail"}
                        fill
                        sizes="40px"
                        referrerPolicy="no-referrer"
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-1.5 border-b border-r border-zinc-200 max-w-xs whitespace-normal">
                    <div className="font-bold text-xs text-zinc-800 line-clamp-2 group-hover:text-primary transition-colors leading-snug">{p.name}</div>
                  </td>
                  <td className="px-2.5 py-1.5 border-b border-r border-zinc-200 text-zinc-600 font-medium whitespace-nowrap">
                    <span className="bg-zinc-50 text-zinc-700 px-1.5 py-0.5 rounded text-xs font-medium border border-zinc-200">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-2.5 py-1.5 border-b border-r border-zinc-200 text-zinc-500 font-mono text-xs">
                    {p.sku || 'N/A'}
                  </td>

                  {/* Dedicated Featured Sections & Deal Badges Column */}
                  <td className="px-2.5 py-1.5 border-b border-r border-zinc-200 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-1 max-w-[170px] mx-auto">
                      {p.isFlashDeal && (
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-2xs font-bold shadow-2xs">
                          ⚡ Flash
                        </span>
                      )}
                      {p.isBestDeal && (
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-2xs font-bold shadow-2xs">
                          💰 Budget
                        </span>
                      )}
                      {p.isNew && (
                        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded text-2xs font-bold shadow-2xs">
                          ✨ New
                        </span>
                      )}
                      {p.isBrandMall && (
                        <span className="px-1.5 py-0.5 bg-sky-50 text-sky-800 border border-sky-200 rounded text-2xs font-bold shadow-2xs">
                          🏢 Mall
                        </span>
                      )}
                      {p.isTrending && (
                        <span className="px-1.5 py-0.5 bg-orange-50 text-orange-800 border border-orange-200 rounded text-2xs font-bold shadow-2xs">
                          🔥 Trend
                        </span>
                      )}
                      {!p.isFlashDeal && !p.isBestDeal && !p.isNew && !p.isBrandMall && !p.isTrending && (
                        <span className="text-2xs text-zinc-400 italic">Standard</span>
                      )}
                    </div>
                  </td>

                  {/* Dedicated Allowed Payment Methods Column */}
                  <td className="px-2.5 py-1.5 border-b border-r border-zinc-200 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-1 max-w-[150px] mx-auto">
                      {(!p.allowedPaymentMethods || p.allowedPaymentMethods.includes('cod')) && (
                        <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-700 border border-zinc-200 rounded text-2xs font-semibold" title="Cash on Delivery">COD</span>
                      )}
                      {(!p.allowedPaymentMethods || p.allowedPaymentMethods.includes('bkash')) && (
                        <span className="px-1.5 py-0.5 bg-pink-50 text-pink-700 border border-pink-200 rounded text-2xs font-semibold" title="bKash">bKash</span>
                      )}
                      {(!p.allowedPaymentMethods || p.allowedPaymentMethods.includes('nagad')) && (
                        <span className="px-1.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded text-2xs font-semibold" title="Nagad">Nagad</span>
                      )}
                      {(!p.allowedPaymentMethods || p.allowedPaymentMethods.includes('card')) && (
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-2xs font-semibold" title="Card">Card</span>
                      )}
                    </div>
                  </td>

                  <td className="px-2.5 py-1.5 border-b border-r border-zinc-200 font-bold text-right text-zinc-900 whitespace-nowrap">
                    <div className="text-xs">৳{(p.price ?? 0).toLocaleString()}</div>
                    {p.originalPrice && (
                      <div className="text-2xs text-zinc-400 line-through">৳{(p.originalPrice ?? 0).toLocaleString()}</div>
                    )}
                  </td>
                  <td className="px-2.5 py-1.5 border-b border-r border-zinc-200 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {(p.stockQuantity ?? 10) === 0 ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-100">
                          OUT OF STOCK
                        </span>
                      ) : (p.stockQuantity ?? 10) <= (p.lowStockThreshold ?? siteSettings.lowStockThreshold) ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                          LOW ({p.stockQuantity ?? 10})
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                          IN STOCK ({p.stockQuantity ?? 10})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2.5 py-1.5 border-b border-r border-zinc-200 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => duplicateProduct(p)}
                        className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-2xs font-bold hover:bg-amber-100 transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                        title="Duplicate / Clone Product"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>Clone</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditProductModal(p)}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-2xs font-bold hover:bg-blue-100 transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit className="w-2.5 h-2.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteProduct(p.id);
                          setProductToast(
                            `Product "${p.name}" deleted`
                          );
                          setTimeout(() => setProductToast(''), 3000);
                        }}
                        className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded text-2xs font-bold hover:bg-red-100 transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash className="w-2.5 h-2.5" />
                        <span>Del</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ResponsiveTableContainer>

      {/* Infinite Scroll Sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="h-6 w-full pointer-events-none" aria-hidden="true" />
      )}

      {/* Infinite Scroll Progress & Load More Indicator */}
      <div className="py-2.5 px-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 text-zinc-600 font-medium">
          <span>
            {'Showing:'}{' '}
            <strong className="text-zinc-900 font-bold">{displayedAdminProducts.length}</strong> / {filteredAdminProducts.length} {'products'}
          </span>
          {hasMore && (
            <div className="w-16 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (displayedAdminProducts.length / filteredAdminProducts.length) * 100)}%` }}
              />
            </div>
          )}
        </div>

        {isLoadingMore && (
          <div className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>{'Loading more products on scroll...'}</span>
          </div>
        )}

        {hasMore && !isLoadingMore && (
          <button
            type="button"
            onClick={handleLoadMore}
            className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800 shadow-2xs cursor-pointer transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5 text-primary" />
            <span>{'Load More'}</span>
          </button>
        )}

        {!hasMore && filteredAdminProducts.length > 0 && (
          <div className="inline-flex items-center gap-1 text-2xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{'All products loaded'}</span>
          </div>
        )}
      </div>

      {/* Product Import Modal */}
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        
      />

      {/* Sync Catalog Confirm Dialog */}
      <ConfirmDialog
        open={showSyncConfirm}
        title="Sync Catalog to Database"
        message="Are you sure you want to sync the static master catalog to Firestore? Existing products in your database will not be overwritten."
        confirmLabel="Sync Catalog"
        cancelLabel="Cancel"
        loading={isSyncingCatalog}
        onConfirm={handleConfirmSync}
        onCancel={() => setShowSyncConfirm(false)}
      />
    </div>
  );
};
