import React from 'react';
import { CategoryItem } from '@/types';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

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
        <Input
          label="Product Name *"
          type="text"
          required
          value={prodName}
          onChange={(e) => setProdName(e.target.value)}
          placeholder="e.g. Royal Indigo Premium Silk Panjabi"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            label="SKU Code (auto if empty)"
            type="text"
            value={prodSku}
            onChange={(e) => setProdSku(e.target.value)}
            placeholder="MGM-PJ-ROYAL"
          />
        </div>
        <div>
          <Select
            label="Marketplace Category *"
            value={prodCategory}
            onChange={(e) => setProdCategory(e.target.value)}
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
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Select
            label="Subcategory (optional)"
            value={prodSubcategory}
            onChange={(e) => setProdSubcategory(e.target.value)}
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
          </Select>
        </div>
      </div>
      <div>
        <Input
          label="Brand"
          type="text"
          value={prodBrand || ''}
          onChange={(e) => setProdBrand?.(e.target.value)}
          placeholder="e.g. Samsung"
        />
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-300 mb-1.5">
              Product Description (Rich Text Editor)
            </label>
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
