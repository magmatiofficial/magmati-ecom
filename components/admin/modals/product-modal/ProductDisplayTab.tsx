import React from 'react';

export interface ProductDisplayTabProps {
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
  bestDealSections?: Array<{ id: string; titleEn: string }>;
  prodBestDealSectionId?: string;
  setProdBestDealSectionId?: (v: string) => void;
  isActive: boolean;
}

export const ProductDisplayTab: React.FC<ProductDisplayTabProps> = ({
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
  bestDealSections = [],
  prodBestDealSectionId = '',
  setProdBestDealSectionId,
  isActive,
}) => {
  if (!isActive) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-2xl cursor-pointer">
          <span className="font-bold text-zinc-800 text-xs">Featured in Flash Deals</span>
          <input
            type="checkbox"
            checked={prodIsFlashDeal}
            onChange={(e) => setProdIsFlashDeal(e.target.checked)}
            className="w-4 h-4 text-primary rounded"
          />
        </label>
        <label className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-2xl cursor-pointer">
          <span className="font-bold text-zinc-800 text-xs">Featured in Best Deals</span>
          <input
            type="checkbox"
            checked={prodIsBestDeal}
            onChange={(e) => setProdIsBestDeal(e.target.checked)}
            className="w-4 h-4 text-primary rounded"
          />
        </label>
        <label className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-2xl cursor-pointer">
          <span className="font-bold text-zinc-800 text-xs">Mark as New Arrival</span>
          <input
            type="checkbox"
            checked={prodIsNew}
            onChange={(e) => setProdIsNew(e.target.checked)}
            className="w-4 h-4 text-primary rounded"
          />
        </label>
        <label className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-2xl cursor-pointer">
          <span className="font-bold text-zinc-800 text-xs">Brand Mall Exclusive</span>
          <input
            type="checkbox"
            checked={prodIsBrandMall}
            onChange={(e) => setProdIsBrandMall(e.target.checked)}
            className="w-4 h-4 text-primary rounded"
          />
        </label>
        <label className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-2xl cursor-pointer">
          <span className="font-bold text-zinc-800 text-xs">Trending Product</span>
          <input
            type="checkbox"
            checked={prodIsTrending}
            onChange={(e) => setProdIsTrending(e.target.checked)}
            className="w-4 h-4 text-primary rounded"
          />
        </label>
      </div>

      {prodIsBestDeal && bestDealSections.length > 0 && (
        <div>
          <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Assign to Best Deal Section</label>
          <select
            value={prodBestDealSectionId}
            onChange={(e) => setProdBestDealSectionId?.(e.target.value)}
            className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white focus:outline-hidden"
          >
            <option value="">Default Best Deals Section</option>
            {bestDealSections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.titleEn}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="border-t border-zinc-200 pt-3">
        <span className="font-bold text-zinc-900 block text-xs mb-3">Custom Badge Toggles</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <label className="flex items-center gap-2 p-2 bg-zinc-50 rounded-xl cursor-pointer text-[11px]">
            <input
              type="checkbox"
              checked={prodShowDiscountBadge}
              onChange={(e) => setProdShowDiscountBadge(e.target.checked)}
            />
            Discount %
          </label>
          <label className="flex items-center gap-2 p-2 bg-zinc-50 rounded-xl cursor-pointer text-[11px]">
            <input
              type="checkbox"
              checked={prodShowFlashBadge}
              onChange={(e) => setProdShowFlashBadge(e.target.checked)}
            />
            Flash Deal
          </label>
          <label className="flex items-center gap-2 p-2 bg-zinc-50 rounded-xl cursor-pointer text-[11px]">
            <input
              type="checkbox"
              checked={prodShowTrendingBadge}
              onChange={(e) => setProdShowTrendingBadge(e.target.checked)}
            />
            Trending
          </label>
          <label className="flex items-group gap-2 p-2 bg-zinc-50 rounded-xl cursor-pointer text-[11px]">
            <input
              type="checkbox"
              checked={prodShowMallBadge}
              onChange={(e) => setProdShowMallBadge(e.target.checked)}
            />
            Brand Mall
          </label>
          <label className="flex items-center gap-2 p-2 bg-zinc-50 rounded-xl cursor-pointer text-[11px]">
            <input
              type="checkbox"
              checked={prodShowHotDealBadge}
              onChange={(e) => setProdShowHotDealBadge(e.target.checked)}
            />
            Hot Deal
          </label>
          <label className="flex items-center gap-2 p-2 bg-zinc-50 rounded-xl cursor-pointer text-[11px]">
            <input
              type="checkbox"
              checked={prodShowNewBadge}
              onChange={(e) => setProdShowNewBadge(e.target.checked)}
            />
            New Arrival
          </label>
        </div>
      </div>
    </div>
  );
};
