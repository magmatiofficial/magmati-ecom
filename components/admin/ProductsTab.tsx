'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '@/types';
import { useProductStore } from '@/store/useProductStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { toast } from '@/store/useToastStore';
import { exportProductsToCSV, exportProductsToJSON } from '@/lib/dataTransferUtils';
import { ProductImportModal } from '@/components/admin/modals/ProductImportModal';
import { seedProductsToFirestore } from '@/hooks/useProductSync';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { ProductsTabHeader } from './products-tab/ProductsTabHeader';
import { ProductsBulkActionsBar } from './products-tab/ProductsBulkActionsBar';
import { ProductsTable } from './products-tab/ProductsTable';

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
  deleteProduct: (productId: string) => Promise<boolean>;
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
  const { updateProduct, quickAdjustStock, bulkAddProducts } = useProductStore();
  const { categories } = useCategoryStore();

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [activeBulkTab, setActiveBulkTab] = useState<'payments' | 'badges' | 'pricing' | null>(null);

  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSyncingCatalog, setIsSyncingCatalog] = useState(false);

  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [syncResult, setSyncResult] = useState<{ added: number; skipped: number } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Infinite Scroll state for Admin Products Table
  const ADMIN_BATCH_SIZE = 15;
  const [visibleCount, setVisibleCount] = useState<number>(ADMIN_BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleImportSuccess = async (importedProducts: Product[]): Promise<boolean> => {
    const result = await bulkAddProducts(importedProducts);
    if (result.failed) {
      toast.error('Failed to import products to database.');
      return false;
    }
    if (result.added > 0) {
      toast.success(
        result.skipped > 0
          ? `Imported ${result.added} products (${result.skipped} existing skipped).`
          : `Imported ${result.added} products successfully!`
      );
    } else {
      toast.info(
        result.skipped > 0
          ? `No new products imported (${result.skipped} already exist).`
          : 'No valid products to import.'
      );
    }
    setIsImportModalOpen(false);
    return true;
  };

  const handleConfirmSync = async () => {
    setIsSyncingCatalog(true);
    setSyncResult(null);
    setSyncError(null);
    try {
      const result = await seedProductsToFirestore();
      setSyncResult(result);
      toast.success(`Catalog sync complete: Added ${result.added} new products, skipped ${result.skipped} existing.`);
    } catch (err: any) {
      console.error('Firestore catalog sync failed:', err);
      const errorMsg = err?.message || 'Failed to sync catalog to database.';
      setSyncError(errorMsg);
      toast.error(`Sync error: ${errorMsg}`);
    } finally {
      setIsSyncingCatalog(false);
      setShowSyncConfirm(false);
    }
  };

  const handleResetCatalog = async () => {
    await resetToDefault();
    toast.success('Catalog successfully reset to default factory products!');
  };

  const openResetCatalogConfirm = () => {
    setConfirmDialog({
      open: true,
      title: 'Reset product catalog',
      message: 'Are you sure you want to reset the entire product catalog back to the default list? All current products will be replaced by the default factory list.',
      confirmLabel: 'Reset',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          await handleResetCatalog();
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } finally {
          setIsConfirmLoading(false);
        }
      }
    });
  };

  const openSingleDeleteConfirm = (product: Product) => {
    setConfirmDialog({
      open: true,
      title: `Delete Product: ${product.name}`,
      message: `Are you sure you want to permanently delete "${product.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          const ok = await deleteProduct(product.id);
          if (ok) {
            toast.success(`Product "${product.name}" deleted successfully`);
            setConfirmDialog(prev => ({ ...prev, open: false }));
          } else {
            toast.error(`Could not delete "${product.name}". Please try again.`);
          }
        } catch (err: any) {
          toast.error('Failed to delete product');
        } finally {
          setIsConfirmLoading(false);
        }
      }
    });
  };

  const [bulkPaymentMethods, setBulkPaymentMethods] = useState<('cod' | 'bkash' | 'nagad' | 'card')[]>(['cod', 'bkash', 'nagad', 'card']);
  const [bulkPaymentsEdited, setBulkPaymentsEdited] = useState(false);
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
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Dropdown click-outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeBulkTab && !(event.target as HTMLElement).closest('.bulk-dropdown-container')) {
        setActiveBulkTab(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeBulkTab]);

  const handleBulkUpdate = async () => {
    if (selectedProductIds.length === 0 || isBulkUpdating) return;

    const hasAnyChange =
      bulkPaymentsEdited ||
      bulkBadges.isFlashDeal !== null ||
      bulkBadges.isBestDeal !== null ||
      bulkBadges.isNew !== null ||
      bulkBadges.isBrandMall !== null ||
      bulkBadges.isTrending !== null ||
      bulkStockVal.trim() !== '' ||
      bulkDiscountVal.trim() !== '';

    if (!hasAnyChange) {
      toast.info('Nothing to update. Choose a payment method, badge, stock or discount first.');
      return;
    }

    setIsBulkUpdating(true);

    try {
      const results = await Promise.all(
        selectedProductIds.map(async (id) => {
          const prod = products.find((p) => p.id === id);
          if (!prod) return { id, ok: false };

          const updatedFields: Partial<Product> = {};

          if (bulkPaymentsEdited) {
            updatedFields.allowedPaymentMethods = bulkPaymentMethods;
          }

          if (bulkBadges.isFlashDeal !== null) updatedFields.isFlashDeal = bulkBadges.isFlashDeal;
          if (bulkBadges.isBestDeal !== null) updatedFields.isBestDeal = bulkBadges.isBestDeal;
          if (bulkBadges.isNew !== null) updatedFields.isNew = bulkBadges.isNew;
          if (bulkBadges.isBrandMall !== null) updatedFields.isBrandMall = bulkBadges.isBrandMall;
          if (bulkBadges.isTrending !== null) updatedFields.isTrending = bulkBadges.isTrending;

          if (bulkStockVal.trim() !== '') {
            const stockNum = parseInt(bulkStockVal, 10);
            if (!isNaN(stockNum)) {
              updatedFields.stockQuantity = stockNum;
              updatedFields.inStock = stockNum > 0;
            }
          }

          if (bulkDiscountVal.trim() !== '') {
            const discountNum = parseFloat(bulkDiscountVal);
            if (!isNaN(discountNum) && discountNum >= 0 && discountNum <= 100) {
              const basePrice = prod.originalPrice || prod.price;
              const discounted = Math.round(basePrice * (1 - discountNum / 100));
              updatedFields.originalPrice = basePrice;
              updatedFields.price = discounted;
            }
          }

          if (Object.keys(updatedFields).length === 0) {
            return { id, ok: true };
          }

          const ok = await updateProduct(id, updatedFields);
          return { id, ok };
        })
      );

      const failedIds = results.filter((r) => !r.ok).map((r) => r.id);
      const okCount = results.length - failedIds.length;

      if (failedIds.length === 0) {
        toast.success(`${okCount} product${okCount === 1 ? '' : 's'} updated successfully.`);
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
        setBulkPaymentsEdited(false);
        setBulkPaymentMethods(['cod', 'bkash', 'nagad', 'card']);
      } else if (okCount > 0) {
        toast.warning(`${okCount} updated, ${failedIds.length} failed. The failed products are still selected, try again.`);
        setSelectedProductIds(failedIds);
      } else {
        toast.error('Bulk update failed. Nothing was saved. Check your connection and admin access, then try again.');
      }
    } catch (error) {
      console.error('Bulk update failed:', error);
      toast.error('Bulk update failed. Nothing was saved. Check your connection and admin access, then try again.');
    } finally {
      setIsBulkUpdating(false);
    }
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
      {/* Header and Controls */}
      <ProductsTabHeader
        adminProductSearch={adminProductSearch}
        setAdminProductSearch={setAdminProductSearch}
        adminProductCat={adminProductCat}
        setAdminProductCat={setAdminProductCat}
        lowStockOnly={lowStockOnly}
        setLowStockOnly={setLowStockOnly}
        categories={categories}
        openAddProductModal={openAddProductModal}
        setIsImportModalOpen={setIsImportModalOpen}
        exportProductsToCSV={() => exportProductsToCSV(products)}
        exportProductsToJSON={() => exportProductsToJSON(products)}
        setShowSyncConfirm={setShowSyncConfirm}
        isSyncingCatalog={isSyncingCatalog}
      />

      {syncError && (
        <InlineAlert type="error" onClose={() => setSyncError(null)}>
          Sync failed: {syncError}
        </InlineAlert>
      )}

      {/* Bulk Actions Bar */}
      <ProductsBulkActionsBar
        selectedProductIds={selectedProductIds}
        isBulkUpdating={isBulkUpdating}
        onClearSelection={() => {
          setSelectedProductIds([]);
          setActiveBulkTab(null);
        }}
        activeBulkTab={activeBulkTab}
        setActiveBulkTab={setActiveBulkTab}
        bulkPaymentMethods={bulkPaymentMethods}
        setBulkPaymentMethods={setBulkPaymentMethods}
        bulkPaymentsEdited={bulkPaymentsEdited}
        setBulkPaymentsEdited={setBulkPaymentsEdited}
        bulkBadges={bulkBadges}
        setBulkBadges={setBulkBadges}
        bulkStockVal={bulkStockVal}
        setBulkStockVal={setBulkStockVal}
        bulkDiscountVal={bulkDiscountVal}
        setBulkDiscountVal={setBulkDiscountVal}
        handleBulkUpdate={handleBulkUpdate}
      />

      {/* Products Table & Infinite Scroll */}
      <ProductsTable
        products={products}
        displayedProducts={displayedAdminProducts}
        selectedProductIds={selectedProductIds}
        setSelectedProductIds={setSelectedProductIds}
        openEditProductModal={openEditProductModal}
        duplicateProduct={duplicateProduct}
        openSingleDeleteConfirm={openSingleDeleteConfirm}
        quickAdjustStock={quickAdjustStock}
        siteSettings={siteSettings}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
        sentinelRef={sentinelRef}
      />

      {/* Import Modal */}
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        loading={isConfirmLoading}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
};
