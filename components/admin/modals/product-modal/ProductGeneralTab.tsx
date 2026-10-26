import React from 'react';
import { CategoryItem } from '@/types';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

export interface ProductGeneralTabProps {
  prodName: string;
  setProdName: (v: string) => void;
  prodSku: string;
  setProdSku: (v: string) => void;
  prodCategory: string;
  setProdCategory: (v: string) => void;
  prodSubcategory: string;
  setProdSubcategory: (v: string) => void;
  prodBrand?: string;
  setProdBrand?: (v: string) => void;
  prodDescription: string;
  setProdDescription: (v: string) => void;
  categories: CategoryItem[];
  currentCategory?: CategoryItem;
  subcategoryOptions: string[];
  isActive: boolean;
}

export const ProductGeneralTab: React.FC<ProductGeneralTabProps> = ({
  prodName,
  setProdName,
  prodSku,
  setProdSku,
  prodCategory,
  setProdCategory,
  prodSubcategory,
  setProdSubcategory,
  prodBrand,
  setProdBrand,
  prodDescription,
  setProdDescription,
  categories,
  currentCategory,
  subcategoryOptions,
  isActive,
}) => {
  if (!isActive) return null;

  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Product Name *</label>
        <input
          type="text"
          required
          value={prodName}
          onChange={(e) => setProdName(e.target.value)}
          placeholder="e.g. Royal Indigo Premium Silk Panjabi"
          className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-eyebrow font-bold text-zinc-700 block mb-1">SKU Code (auto if empty)</label>
          <input
            type="text"
            value={prodSku}
            onChange={(e) => setProdSku(e.target.value)}
            placeholder="MGM-PJ-ROYAL"
            className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary"
          />
        </div>
        <div>
          <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Marketplace Category *</label>
          <select
            value={prodCategory}
            onChange={(e) => setProdCategory(e.target.value)}
            className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white focus:outline-hidden"
          >
            {categories.length === 0 ? (
              <option value="" disabled>
                {'No categories yet - add one in Categories tab'}
              </option>
            ) : (
              <>
                {prodCategory && !categories.some((cat) => cat.name === prodCategory) && (
                  <option key={prodCategory} value={prodCategory}>
                    {prodCategory}
                  </option>
                )}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Subcategory (optional)</label>
          <select
            value={prodSubcategory}
            onChange={(e) => setProdSubcategory(e.target.value)}
            className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white focus:outline-hidden"
          >
            {!currentCategory ? (
              <option value="" disabled>
                Select a category first
              </option>
            ) : subcategoryOptions.length === 0 ? (
              <option value="" disabled>
                No subcategories - add one in Categories tab
              </option>
            ) : (
              <>
                <option value="" disabled>
                  Select subcategory
                </option>
                {prodSubcategory && !subcategoryOptions.includes(prodSubcategory) && (
                  <option key={prodSubcategory} value={prodSubcategory}>
                    {prodSubcategory}
                  </option>
                )}
                {subcategoryOptions.map((subName) => (
                  <option key={subName} value={subName}>
                    {subName}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>
      <div>
        <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Brand</label>
        <input
          type="text"
          value={prodBrand || ''}
          onChange={(e) => setProdBrand?.(e.target.value)}
          placeholder="e.g. Samsung"
          className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary"
        />
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Product Description (Rich Text Editor)</label>
            <RichTextEditor
              value={prodDescription}
              onChange={setProdDescription}
              placeholder="Detailed description with formatting, headings, bullet points..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
