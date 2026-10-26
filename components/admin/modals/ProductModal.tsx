'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Loader2
} from 'lucide-react';
import { Product, ProductMediaItem, ProductMediaType, ProductColor } from '@/types';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useBestDealsStore } from '@/store/useBestDealsStore';
import { ProductGeneralTab } from './product-modal/ProductGeneralTab';
import { ProductPricingTab } from './product-modal/ProductPricingTab';
import { ProductInventoryTab } from './product-modal/ProductInventoryTab';
import { ProductMediaTab } from './product-modal/ProductMediaTab';
import { ProductDisplayTab } from './product-modal/ProductDisplayTab';

export interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;

  prodName: string;
  setProdName: (v: string) => void;

  prodSku: string;
  setProdSku: (v: string) => void;
  prodCategory: string;
  setProdCategory: (v: string) => void;
  prodSubcategory: string;
  setProdSubcategory: (v: string) => void;
  prodRegularPrice: number;
  setProdRegularPrice: (v: number) => void;
  prodSpecialPrice?: number;
  setProdSpecialPrice: (v: number | undefined) => void;
  prodImages: string[];
  setProdImages: (v: string[]) => void;
  prodMedia?: ProductMediaItem[];
  setProdMedia?: React.Dispatch<React.SetStateAction<ProductMediaItem[]>>;
  prodPreviewGifUrl?: string;
  setProdPreviewGifUrl?: (v: string) => void;
  prodVideoUrl?: string;
  setProdVideoUrl?: (v: string) => void;
  prodMainImageIndex?: number;
  setProdMainImageIndex?: (v: number) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string) => void, folder?: string) => void;
  handleMediaUpload?: (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string, type: ProductMediaType) => void, folder?: string) => void;
  prodDescription: string;
  setProdDescription: (v: string) => void;

  prodInStock: boolean;
  setProdInStock: (v: boolean) => void;
  prodStockQuantity: number;
  setProdStockQuantity: (v: number) => void;
  prodLowStockThreshold?: number;
  setProdLowStockThreshold: (v: number | undefined) => void;
  siteSettings?: { lowStockThreshold?: number };
  prodIsFlashDeal: boolean;
  setProdIsFlashDeal: (v: boolean) => void;
  prodIsBestDeal: boolean;
  setProdIsBestDeal: (v: boolean) => void;
  prodIsNew: boolean;
  setProdIsNew: (v: boolean) => void;
  prodIsBrandMall: boolean;
  setProdIsBrandMall: (v: boolean) => void;
  prodIsTrending: boolean;
  setProdIsTrending: (v: boolean) => void;
  prodShowDiscountBadge: boolean;
  setProdShowDiscountBadge: (v: boolean) => void;
  prodShowFlashBadge: boolean;
  setProdShowFlashBadge: (v: boolean) => void;
  prodShowTrendingBadge: boolean;
  setProdShowTrendingBadge: (v: boolean) => void;
  prodShowMallBadge: boolean;
  setProdShowMallBadge: (v: boolean) => void;
  prodShowHotDealBadge: boolean;
  setProdShowHotDealBadge: (v: boolean) => void;
  prodShowNewBadge: boolean;
  setProdShowNewBadge: (v: boolean) => void;
  prodAllowedPaymentMethods?: any;
  setProdAllowedPaymentMethods?: any;
  allowedPaymentMethods?: ('cod' | 'bkash' | 'nagad' | 'card')[];
  setAllowedPaymentMethods?: (v: ('cod' | 'bkash' | 'nagad' | 'card')[]) => void;
  prodBestDealSectionId?: string;
  setProdBestDealSectionId?: (v: string) => void;
  prodBrand?: string;
  setProdBrand?: (v: string) => void;
  prodSizes?: string | string[];
  setProdSizes?: (v: any) => void;
  prodColors?: ProductColor[];
  setProdColors?: (v: ProductColor[]) => void;
  prodCostPrice?: number;
  setProdCostPrice?: (v: number | undefined) => void;
  prodTaxStatus?: 'taxable' | 'non_taxable' | 'shipping_only';
  setProdTaxStatus?: (v: 'taxable' | 'non_taxable' | 'shipping_only') => void;
  prodTaxClass?: string;
  setProdTaxClass?: (v: string) => void;
  prodWholesalePrice?: number;
  setProdWholesalePrice?: (v: number | undefined) => void;
  prodWholesaleMinQty?: number;
  setProdWholesaleMinQty?: (v: number | undefined) => void;
  prodPricePerUnitLabel?: string;
  setProdPricePerUnitLabel?: (v: string) => void;

  activeTab?: string;
  onSubmit?: (e: React.FormEvent) => void;
  handleSubmit?: (e: React.FormEvent) => void;
  isSaving?: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  editingProduct,
  prodName,
  setProdName,
  prodSku,
  setProdSku,
  prodCategory,
  setProdCategory,
  prodSubcategory,
  setProdSubcategory,
  prodRegularPrice,
  setProdRegularPrice,
  prodSpecialPrice,
  setProdSpecialPrice,
  prodMedia = [],
  setProdMedia,
  handleImageUpload,
  handleMediaUpload,
  prodDescription,
  setProdDescription,
  prodInStock,
  setProdInStock,
  prodStockQuantity,
  setProdStockQuantity,
  prodLowStockThreshold,
  setProdLowStockThreshold,
  siteSettings = { lowStockThreshold: 5 },
  prodIsFlashDeal,
  setProdIsFlashDeal,
  prodIsBestDeal,
  setProdIsBestDeal,
  prodIsNew,
  setProdIsNew,
  prodIsBrandMall,
  setProdIsBrandMall,
  prodIsTrending,
  setProdIsTrending,
  prodShowDiscountBadge,
  setProdShowDiscountBadge,
  prodShowFlashBadge,
  setProdShowFlashBadge,
  prodShowTrendingBadge,
  setProdShowTrendingBadge,
  prodShowMallBadge,
  setProdShowMallBadge,
  prodShowHotDealBadge,
  setProdShowHotDealBadge,
  prodShowNewBadge,
  setProdShowNewBadge,
  prodBestDealSectionId = '',
  setProdBestDealSectionId,
  prodBrand,
  setProdBrand,
  prodCostPrice, setProdCostPrice,
  prodTaxStatus, setProdTaxStatus,
  prodTaxClass, setProdTaxClass,
  prodWholesalePrice, setProdWholesalePrice,
  prodWholesaleMinQty, setProdWholesaleMinQty,
  prodPricePerUnitLabel, setProdPricePerUnitLabel,
  activeTab = 'general',
  onSubmit,
  handleSubmit,
  isSaving = false,
}) => {
  const { categories } = useCategoryStore();
  const { sections: bestDealSections } = useBestDealsStore();
  const [localActiveTab, setLocalActiveTab] = useState(activeTab);

  const tabs = [
    { id: 'general', label: 'General Info' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'media', label: 'Media' },
    { id: 'display', label: 'Display & Deals' },
  ];

  const currentCategory = useMemo(() => {
    return categories.find((cat) => cat.name === prodCategory);
  }, [categories, prodCategory]);

  const subcategoryOptions = useMemo(() => {
    if (!currentCategory || !Array.isArray(currentCategory.subcategories)) {
      return [];
    }
    const names = currentCategory.subcategories
      .map((item) => (typeof item === 'string' ? item : item?.name))
      .filter((name): name is string => typeof name === 'string' && name.trim().length > 0);
    return Array.from(new Set(names));
  }, [currentCategory]);

  if (!isOpen) return null;

  // Media Reordering Handlers
  const moveMediaUp = (idx: number) => {
    if (!setProdMedia || idx <= 0) return;
    setProdMedia((prev) => {
      const next = [...prev];
      const temp = next[idx - 1];
      next[idx - 1] = next[idx];
      next[idx] = temp;
      return next;
    });
  };

  const moveMediaDown = (idx: number) => {
    if (!setProdMedia || idx >= prodMedia.length - 1) return;
    setProdMedia((prev) => {
      const next = [...prev];
      const temp = next[idx + 1];
      next[idx + 1] = next[idx];
      next[idx] = temp;
      return next;
    });
  };

  const setAsCover = (idx: number) => {
    if (!setProdMedia || idx === 0) return;
    setProdMedia((prev) => {
      const next = [...prev];
      const selected = next.splice(idx, 1)[0];
      next.unshift(selected);
      return next;
    });
  };

  const removeMedia = (idx: number) => {
    if (!setProdMedia) return;
    setProdMedia((prev) => prev.filter((_, i) => i !== idx));
  };

  const addMediaRow = (type: ProductMediaType = 'image') => {
    if (!setProdMedia) return;
    setProdMedia((prev) => [
      ...prev,
      {
        id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type,
        url: '',
        title: '',
      },
    ]);
  };

  const updateMediaRow = (idx: number, patch: Partial<ProductMediaItem>) => {
    if (!setProdMedia) return;
    setProdMedia((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let detectedType: ProductMediaType = 'image';
    if (file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.webm')) {
      detectedType = 'video';
    } else if (file.type === 'image/gif' || file.name.endsWith('.gif')) {
      detectedType = 'gif';
    }

    if (handleMediaUpload) {
      handleMediaUpload(e, (url, type) => {
        updateMediaRow(idx, { url, type });
      });
    } else {
      handleImageUpload(e, (url) => {
        updateMediaRow(idx, { url, type: detectedType });
      }, 'products');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[120] p-3 sm:p-4 font-sans animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl h-[85dvh] sm:h-[90dvh] flex flex-col border border-zinc-200 shadow-2xl p-4 sm:p-6 md:p-8 gap-4 relative animate-scale-up my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="shrink-0 pr-10">
          <h3 className="font-sans text-lg sm:text-xl font-bold text-zinc-900">
            {editingProduct
              ? ('Edit Product & Multi-Media Suite')
              : ('Launch New Product & Media Gallery')}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {'Add images, animated GIFs, in-app playable videos, and adjust exact display ordering.'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="shrink-0 flex items-center gap-1 overflow-x-auto pb-2 custom-scrollbar border-b border-zinc-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setLocalActiveTab(tab.id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                localActiveTab === tab.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-subtle text-text-muted hover:bg-surface-hover border border-border-color'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit || handleSubmit} className="flex flex-col flex-1 min-h-0 text-xs font-sans" noValidate>
          <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1 pt-4 space-y-4">

            <ProductGeneralTab
              prodName={prodName}
              setProdName={setProdName}
              prodSku={prodSku}
              setProdSku={setProdSku}
              prodCategory={prodCategory}
              setProdCategory={setProdCategory}
              prodSubcategory={prodSubcategory}
              setProdSubcategory={setProdSubcategory}
              prodBrand={prodBrand}
              setProdBrand={setProdBrand}
              prodDescription={prodDescription}
              setProdDescription={setProdDescription}
              categories={categories}
              currentCategory={currentCategory}
              subcategoryOptions={subcategoryOptions}
              isActive={localActiveTab === 'general'}
            />

            <ProductPricingTab
              prodRegularPrice={prodRegularPrice}
              setProdRegularPrice={setProdRegularPrice}
              prodSpecialPrice={prodSpecialPrice}
              setProdSpecialPrice={setProdSpecialPrice}
              prodCostPrice={prodCostPrice}
              setProdCostPrice={setProdCostPrice}
              prodTaxStatus={prodTaxStatus}
              setProdTaxStatus={setProdTaxStatus}
              prodTaxClass={prodTaxClass}
              setProdTaxClass={setProdTaxClass}
              prodWholesalePrice={prodWholesalePrice}
              setProdWholesalePrice={setProdWholesalePrice}
              prodWholesaleMinQty={prodWholesaleMinQty}
              setProdWholesaleMinQty={setProdWholesaleMinQty}
              prodPricePerUnitLabel={prodPricePerUnitLabel}
              setProdPricePerUnitLabel={setProdPricePerUnitLabel}
              isActive={localActiveTab === 'pricing'}
            />

            <ProductInventoryTab
              prodInStock={prodInStock}
              setProdInStock={setProdInStock}
              prodStockQuantity={prodStockQuantity}
              setProdStockQuantity={setProdStockQuantity}
              prodLowStockThreshold={prodLowStockThreshold}
              setProdLowStockThreshold={setProdLowStockThreshold}
              siteSettings={siteSettings}
              isActive={localActiveTab === 'inventory'}
            />

            <ProductMediaTab
              prodMedia={prodMedia}
              setProdMedia={setProdMedia}
              handleImageUpload={handleImageUpload}
              handleMediaUpload={handleMediaUpload}
              moveMediaUp={moveMediaUp}
              moveMediaDown={moveMediaDown}
              setAsCover={setAsCover}
              removeMedia={removeMedia}
              addMediaRow={addMediaRow}
              updateMediaRow={updateMediaRow}
              onFileUpload={onFileUpload}
              isActive={localActiveTab === 'media'}
            />

            <ProductDisplayTab
              prodIsFlashDeal={prodIsFlashDeal}
              setProdIsFlashDeal={setProdIsFlashDeal}
              prodIsBestDeal={prodIsBestDeal}
              setProdIsBestDeal={setProdIsBestDeal}
              prodIsNew={prodIsNew}
              setProdIsNew={setProdIsNew}
              prodIsBrandMall={prodIsBrandMall}
              setProdIsBrandMall={setProdIsBrandMall}
              prodIsTrending={prodIsTrending}
              setProdIsTrending={setProdIsTrending}
              prodShowDiscountBadge={prodShowDiscountBadge}
              setProdShowDiscountBadge={setProdShowDiscountBadge}
              prodShowFlashBadge={prodShowFlashBadge}
              setProdShowFlashBadge={setProdShowFlashBadge}
              prodShowTrendingBadge={prodShowTrendingBadge}
              setProdShowTrendingBadge={setProdShowTrendingBadge}
              prodShowMallBadge={prodShowMallBadge}
              setProdShowMallBadge={setProdShowMallBadge}
              prodShowHotDealBadge={prodShowHotDealBadge}
              setProdShowHotDealBadge={setProdShowHotDealBadge}
              prodShowNewBadge={prodShowNewBadge}
              setProdShowNewBadge={setProdShowNewBadge}
              bestDealSections={bestDealSections}
              prodBestDealSectionId={prodBestDealSectionId}
              setProdBestDealSectionId={setProdBestDealSectionId}
              isActive={localActiveTab === 'display'}
            />

          </div>

          <div className="shrink-0 pt-4 border-t border-zinc-200 flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingProduct ? 'Save Changes' : 'Launch Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
