import React from 'react';
import Image from 'next/image';
import { Copy, Edit, Trash } from 'lucide-react';
import { Product } from '@/types';
import { ResponsiveTableContainer } from '@/components/ui/ResponsiveTableContainer';
import { TH, TD, TR } from '@/components/ui/Table';
import { hasDiscount } from '@/lib/pricing';
import { Button } from '@/components/ui/Button';

export interface ProductsTableProps {
  products: Product[];
  displayedProducts: Product[];
  selectedProductIds: string[];
  setSelectedProductIds: React.Dispatch<React.SetStateAction<string[]>>;
  openEditProductModal: (product: Product) => void;
  duplicateProduct: (product: Product) => void;
  openSingleDeleteConfirm: (product: Product) => void;
  quickAdjustStock: (productId: string, delta: number) => void;
  siteSettings: { lowStockThreshold: number };
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  displayedProducts,
  selectedProductIds,
  setSelectedProductIds,
  openEditProductModal,
  duplicateProduct,
  openSingleDeleteConfirm,
  quickAdjustStock,
  siteSettings,
  hasMore,
  isLoadingMore,
  onLoadMore,
  sentinelRef,
}) => {
  const allSelected = displayedProducts.length > 0 && displayedProducts.every((p) => selectedProductIds.includes(p.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(displayedProducts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((item) => item !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col">
      <ResponsiveTableContainer>
        <div className="min-w-[850px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="px-2.5 py-2 text-center w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-zinc-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    aria-label="Select all products"
                  />
                </th>
                <th className="px-2.5 py-2 text-left">Product</th>
                <th className="px-2.5 py-2 text-left">Category</th>
                <th className="px-2.5 py-2 text-left">Price</th>
                <th className="px-2.5 py-2 text-left">Stock</th>
                <th className="px-2.5 py-2 text-left">Badges</th>
                <th className="px-2.5 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-400 text-xs">
                    No products found matching your search or filters.
                  </td>
                </tr>
              ) : (
                displayedProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  const original = product.originalPrice || product.price;
                  const current = product.price;
                  const discounted = hasDiscount(product);
                  const threshold = product.lowStockThreshold ?? siteSettings.lowStockThreshold;
                  const stock = product.stockQuantity ?? 10;
                  const isLowStock = stock <= threshold;

                  return (
                    <TR key={product.id} selected={isSelected}>
                      <TD className="text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(product.id)}
                          className="rounded border-zinc-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          aria-label={`Select ${product.name}`}
                        />
                      </TD>
                      <TD>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-100 relative overflow-hidden shrink-0 border border-zinc-200">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-bold">
                                📦
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-900 truncate max-w-[240px] text-xs">
                              {product.name}
                            </p>
                            <p className="text-2xs text-zinc-400 font-mono">
                              SKU: {product.sku || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </TD>
                      <TD>
                        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-md text-2xs font-semibold">
                          {product.category || 'General'}
                        </span>
                      </TD>
                      <TD>
                        <div className="font-mono">
                          <span className="font-bold text-zinc-900 text-xs">৳{current.toLocaleString()}</span>
                          {discounted && (
                            <span className="text-2xs text-zinc-400 line-through ml-1.5">
                              ৳{original.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </TD>
                      <TD>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-2xs font-bold ${
                            isLowStock
                              ? 'bg-amber-100 text-amber-700 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {stock} in stock
                          </span>
                          <div className="flex items-center gap-0.5 bg-zinc-100 rounded p-0.5">
                            <button
                              type="button"
                              onClick={() => quickAdjustStock(product.id, -1)}
                              className="w-4 h-4 flex items-center justify-center text-[10px] text-zinc-600 hover:bg-white rounded cursor-pointer font-bold"
                              title="Decrease Stock"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => quickAdjustStock(product.id, 1)}
                              className="w-4 h-4 flex items-center justify-center text-[10px] text-zinc-600 hover:bg-white rounded cursor-pointer font-bold"
                              title="Increase Stock"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </TD>
                      <TD>
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {product.isFlashDeal && (
                            <span className="px-1.5 py-0.2 bg-red-50 text-red-600 border border-red-200 text-3xs font-black rounded">
                              Flash
                            </span>
                          )}
                          {product.isBestDeal && (
                            <span className="px-1.5 py-0.2 bg-amber-50 text-amber-600 border border-amber-200 text-3xs font-black rounded">
                              Best Deal
                            </span>
                          )}
                          {product.isNew && (
                            <span className="px-1.5 py-0.2 bg-blue-50 text-blue-600 border border-blue-200 text-3xs font-black rounded">
                              New
                            </span>
                          )}
                          {product.isBrandMall && (
                            <span className="px-1.5 py-0.2 bg-purple-50 text-purple-600 border border-purple-200 text-3xs font-black rounded">
                              Mall
                            </span>
                          )}
                          {product.isTrending && (
                            <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-600 border border-emerald-200 text-3xs font-black rounded">
                              Trending
                            </span>
                          )}
                        </div>
                      </TD>
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditProductModal(product)}
                            className="h-7 w-7 p-0 rounded-lg text-zinc-600 hover:text-primary hover:bg-primary/10"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateProduct(product)}
                            className="h-7 w-7 p-0 rounded-lg text-zinc-600 hover:text-blue-600 hover:bg-blue-50"
                            title="Duplicate Product"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openSingleDeleteConfirm(product)}
                            className="h-7 w-7 p-0 rounded-lg text-zinc-600 hover:text-red-600 hover:bg-red-50"
                            title="Delete Product"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </ResponsiveTableContainer>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="py-4 text-center">
        {isLoadingMore && (
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Loading more products...
          </div>
        )}
        {!hasMore && displayedProducts.length > 0 && (
          <p className="text-3xs text-zinc-400 font-medium">All {displayedProducts.length} products loaded</p>
        )}
      </div>
    </div>
  );
};
