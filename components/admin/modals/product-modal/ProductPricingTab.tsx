import React from 'react';
import { NumberField } from '@/components/ui/NumberField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export interface ProductPricingTabProps {
  prodRegularPrice: number;
  setProdRegularPrice: (v: number) => void;
  prodSpecialPrice?: number;
  setProdSpecialPrice?: (v: number | undefined) => void;
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
  isActive: boolean;
}

export const ProductPricingTab: React.FC<ProductPricingTabProps> = ({
  prodRegularPrice,
  setProdRegularPrice,
  prodSpecialPrice,
  setProdSpecialPrice,
  prodCostPrice,
  setProdCostPrice,
  prodTaxStatus,
  setProdTaxStatus,
  prodTaxClass,
  setProdTaxClass,
  prodWholesalePrice,
  setProdWholesalePrice,
  prodWholesaleMinQty,
  setProdWholesaleMinQty,
  prodPricePerUnitLabel,
  setProdPricePerUnitLabel,
  isActive,
}) => {
  if (!isActive) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-300 mb-1.5">
          Regular Price (BDT ৳) *
        </label>
        <NumberField
          required
          value={prodRegularPrice}
          onValueChange={(v) => setProdRegularPrice(v ?? Number.NaN)}
          placeholder="e.g. 4850"
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-300 mb-1.5">
          Special Price (BDT ৳) - optional
        </label>
        <NumberField
          value={prodSpecialPrice}
          onValueChange={setProdSpecialPrice || (() => {})}
          placeholder="Leave empty to sell at Regular Price"
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-300 mb-1.5">
          Cost Price (BDT ৳)
        </label>
        <NumberField
          value={prodCostPrice}
          onValueChange={setProdCostPrice || (() => {})}
          placeholder="e.g. 3500"
        />
      </div>
      <div>
        <Select
          label="Tax Status"
          value={prodTaxStatus || 'taxable'}
          onChange={(e) => {
            const next = e.currentTarget.value as 'taxable' | 'non_taxable' | 'shipping_only';
            setProdTaxStatus?.(next);
          }}
        >
          <option value="taxable">Taxable</option>
          <option value="non_taxable">Non-taxable</option>
          <option value="shipping_only">Shipping only</option>
        </Select>
      </div>
      <div>
        <Input
          label="Tax Class"
          type="text"
          value={prodTaxClass || ''}
          onChange={(e) => setProdTaxClass?.(e.target.value)}
          placeholder="e.g. Standard"
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-300 mb-1.5">
          Wholesale Price (BDT ৳)
        </label>
        <NumberField
          value={prodWholesalePrice}
          onValueChange={setProdWholesalePrice || (() => {})}
          placeholder="e.g. 4000"
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-300 mb-1.5">
          Wholesale Min Qty
        </label>
        <NumberField
          value={prodWholesaleMinQty}
          onValueChange={setProdWholesaleMinQty || (() => {})}
          placeholder="e.g. 10"
        />
      </div>
      <div>
        <Input
          label="Price per unit label"
          type="text"
          value={prodPricePerUnitLabel || ''}
          onChange={(e) => setProdPricePerUnitLabel?.(e.target.value)}
          placeholder="e.g. per piece"
        />
      </div>
    </div>
  );
};
