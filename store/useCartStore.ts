'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductColor } from '@/types';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { getStockLimit, isInStock } from '@/lib/stock';

export interface CartLine {
  productId: string;
  selectedSize: string;
  colorName: string;
  colorHex: string;
  quantity: number;
  selected: boolean;
  claimedB1G1: boolean;
  isComboItem: boolean;
  comboId?: string;
  promoLabel?: string;
}

interface CartState {
  items: CartItem[];
  ownerEmail: string;
  removedFreeKeys: string[];
  isCartOpen: boolean;
  cartError: string | null;
  setOwner: (email?: string | null) => void;
  setCartError: (err: string | null) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, size?: string, color?: ProductColor, quantity?: number, openDrawer?: boolean, isB1G1Claim?: boolean) => void;
  removeItem: (productId: string, size: string, colorHex: string) => void;
  updateQuantity: (productId: string, size: string, colorHex: string, quantity: number) => void;
  toggleItemSelection: (productId: string, size: string, colorHex: string) => void;
  selectAllItems: (selected: boolean) => void;
  clearCart: () => void;
  clearSelectedItems: () => void;
  getSelectedItems: () => CartItem[];
  getTotalItems: () => number;
  getSelectedItemsCount: () => number;
  getTotalPrice: () => number;
  getSelectedTotalPrice: () => number;
  addComboBundle: (combo: any) => void;
  getLines: () => CartLine[];
  hydrateFromLines: (lines: CartLine[], removedFreeKeys: string[], products: Product[]) => void;
  guestLines: CartLine[];
  restoreGuestCart: (products: Product[]) => void;
}

const allocateComboPrices = (comboProducts: { product: Product; quantity: number }[], comboPrice: number): number[] => {
  const originalSum = comboProducts.reduce((sum, pair) => sum + pair.product.price, 0);
  const allocatedPrices = comboProducts.map((pair, idx) => {
    if (originalSum <= 0) return comboPrice;
    if (idx === comboProducts.length - 1) return 0; // Placeholder
    return Math.round((pair.product.price / originalSum) * comboPrice);
  });
  
  const sumOfAllocated = allocatedPrices.slice(0, -1).reduce((sum, p) => sum + p, 0);
  allocatedPrices[allocatedPrices.length - 1] = comboPrice - sumOfAllocated;
  
  return allocatedPrices;
};

const syncPromotions = (items: CartItem[], removedFreeKeys: string[] = []): CartItem[] => {
  const cleanItems = items.filter((item) => !item.isFreeItem);
  let offers: any[] = [];
  try {
    const { useSiteSettingsStore } = require('./useSiteSettingsStore');
    offers = useSiteSettingsStore.getState().b1g1Offers || [];
  } catch (e) {}

  const activeOffers = offers.filter((o) => o.enabled);
  const freeItemsToAdd: CartItem[] = [];

  activeOffers.forEach((offer) => {
    const qualifyingItem = cleanItems.find(
      (item) => item.product.id === offer.buyProductId && !item.isFreeItem && !item.isComboItem && item.claimedB1G1 === true
    );

    if (qualifyingItem) {
      const buyQty = offer.buyQuantity || 1;
      const getQty = offer.getQuantity || 1;
      const freeQuantityMultiplier = Math.floor(qualifyingItem.quantity / buyQty);
      const totalFreeQuantity = freeQuantityMultiplier * getQty;

      const freeKey = `${offer.getProductId}-${qualifyingItem.product.id}`;
      const isExplicitlyRemoved = removedFreeKeys.includes(freeKey);

      if (totalFreeQuantity > 0 && !isExplicitlyRemoved) {
        try {
          const { useProductStore } = require('./useProductStore');
          const products = useProductStore.getState().products || [];
          const freeProduct = products.find((p: any) => p.id === offer.getProductId);

          if (freeProduct && isInStock(freeProduct, totalFreeQuantity)) {
            freeItemsToAdd.push({
              product: freeProduct,
              selectedSize: freeProduct.sizes?.[0] || 'Standard',
              selectedColor: freeProduct.colors?.[0] || { name: 'Standard', hex: '#000000' },
              quantity: totalFreeQuantity,
              selected: qualifyingItem.selected !== false,
              customPrice: 0,
              isFreeItem: true,
              promoLabel: offer.title,
              qualifyingProductId: qualifyingItem.product.id,
            });
          }
        } catch (e) {
          console.error('Error loading free product details during cart sync:', e);
        }
      }
    }
  });

  return [...cleanItems, ...freeItemsToAdd];
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      ownerEmail: 'guest',
      guestLines: [],
      removedFreeKeys: [],
      isCartOpen: false,
      cartError: null,
      setOwner: (email?: string | null) => {
        const key = email && email.trim() ? email.toLowerCase().trim() : 'guest';
        const currentOwner = get().ownerEmail;
        if (key === currentOwner) return;

        if (currentOwner === 'guest' && key !== 'guest') {
          set({ ownerEmail: key, guestLines: [] });
        } else {
          set({ ownerEmail: key, items: [], removedFreeKeys: [], guestLines: [], cartError: null });
        }
      },
      setCartError: (err) => set({ cartError: err }),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      addItem: (product, size, color, quantity = 1, openDrawer = false, isB1G1Claim = false) => {
        if (!product || !product.id) return;
        const selectedSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard');
        const selectedColor = color || (product.colors && product.colors.length > 0 ? product.colors[0] : { name: 'Standard', hex: '#000000' });

        try {
          useAnalyticsStore.getState().logAction('ADD_TO_CART', { productId: product.id, name: product.name, quantity });
        } catch {}

        set((state) => {
          const nextRemovedKeys = state.removedFreeKeys.filter((k) => !k.endsWith(`-${product.id}`));
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.selectedSize === selectedSize &&
              (item.selectedColor?.hex || '') === (selectedColor?.hex || '') &&
              !item.isFreeItem &&
              !item.isComboItem
          );

          let updatedItems = [...state.items];
          if (existingIndex > -1) {
            updatedItems[existingIndex].quantity += quantity;
            updatedItems[existingIndex].selected = true;
            if (isB1G1Claim) {
              updatedItems[existingIndex].claimedB1G1 = true;
            }
          } else {
            updatedItems.push({
              product,
              selectedSize,
              selectedColor,
              quantity,
              selected: true,
              claimedB1G1: isB1G1Claim,
            });
          }

          const synced = syncPromotions(updatedItems, nextRemovedKeys);
          return openDrawer 
            ? { items: synced, removedFreeKeys: nextRemovedKeys, isCartOpen: true } 
            : { items: synced, removedFreeKeys: nextRemovedKeys };
        });
      },
      removeItem: (productId, size, colorHex) => {
        useAnalyticsStore.getState().logAction('REMOVE_FROM_CART', { productId });
        set((state) => {
          const removedItem = state.items.find(
            (item) =>
              item.product.id === productId &&
              item.selectedSize === size &&
              item.selectedColor.hex === colorHex
          );

          let nextRemovedKeys = [...state.removedFreeKeys];
          if (removedItem?.isFreeItem && removedItem.qualifyingProductId) {
            const freeKey = `${productId}-${removedItem.qualifyingProductId}`;
            if (!nextRemovedKeys.includes(freeKey)) nextRemovedKeys.push(freeKey);
          } else if (removedItem && !removedItem.isFreeItem) {
            nextRemovedKeys = nextRemovedKeys.filter((k) => !k.endsWith(`-${productId}`));
          }

          const comboIdToRemove = removedItem?.isComboItem ? removedItem.comboId : undefined;
          const filtered = comboIdToRemove
            ? state.items.filter((item) => !(item.isComboItem && item.comboId === comboIdToRemove))
            : state.items.filter(
                (item) => !(item.product.id === productId && item.selectedSize === size && item.selectedColor.hex === colorHex)
              );
          return { items: syncPromotions(filtered, nextRemovedKeys), removedFreeKeys: nextRemovedKeys };
        });
      },
      updateQuantity: (productId, size, colorHex, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, colorHex);
          return;
        }
        set((state) => {
          const updated = state.items.map((item) =>
            item.product.id === productId && item.selectedSize === size && item.selectedColor.hex === colorHex
              ? { ...item, quantity }
              : item
          );
          return { items: syncPromotions(updated, state.removedFreeKeys) };
        });
      },
      toggleItemSelection: (productId, size, colorHex) => {
        set((state) => {
          const target = state.items.find(
            (item) =>
              item.product.id === productId &&
              item.selectedSize === size &&
              item.selectedColor.hex === colorHex
          );
          if (!target) return { items: state.items };
          const nextSelected = target.selected === false;
          const comboIdToToggle = target.isComboItem ? target.comboId : undefined;
          const updated = state.items.map((item) => {
            const isTarget = item === target;
            const isSameCombo = Boolean(comboIdToToggle) && item.isComboItem === true && item.comboId === comboIdToToggle;
            return isTarget || isSameCombo ? { ...item, selected: nextSelected } : item;
          });
          return { items: syncPromotions(updated, state.removedFreeKeys) };
        });
      },
      selectAllItems: (selected) => {
        set((state) => {
          const updated = state.items.map((item) => ({ ...item, selected }));
          return { items: syncPromotions(updated, state.removedFreeKeys) };
        });
      },
      clearCart: () => set({ items: [], removedFreeKeys: [] }),
      clearSelectedItems: () => {
        set((state) => {
          const filtered = state.items.filter((item) => item.selected === false);
          return { items: syncPromotions(filtered, state.removedFreeKeys) };
        });
      },
      getSelectedItems: () => get().items.filter((item) => item.selected !== false),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getSelectedItemsCount: () => get().items.filter((item) => item.selected !== false).reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((total, item) => {
          const price = typeof item.customPrice === 'number' ? item.customPrice : item.product.price;
          return total + price * item.quantity;
        }, 0),
      getSelectedTotalPrice: () => get().items.filter((item) => item.selected !== false).reduce((total, item) => {
            const price = typeof item.customPrice === 'number' ? item.customPrice : item.product.price;
            return total + price * item.quantity;
          }, 0),
      addComboBundle: (combo) => {
        try {
          const { useProductStore } = require('./useProductStore');
          const allProducts = useProductStore.getState().products || [];
          
          const comboProducts = combo.items.map((item: any) => {
            const prod = allProducts.find((p: any) => p.id === item.productId);
            return { product: prod, quantity: item.quantity };
          }).filter((pair: any) => !!pair.product);

          if (comboProducts.length === 0) return;

          const outOfStock = comboProducts.find((pair: any) => !isInStock(pair.product, pair.quantity));
          if (outOfStock) {
            const limit = getStockLimit(outOfStock.product) ?? 0;
            set({ cartError: `"${outOfStock.product.name}" is not available for the "${combo.title}" combo (${limit} in stock, ${outOfStock.quantity} needed).` });
            return;
          }

          const comboPrice = combo.comboPrice;
          set((state) => {
            let updatedItems = [...state.items];
            const allocatedPrices = allocateComboPrices(comboProducts, comboPrice);
            comboProducts.forEach((pair: any, idx: number) => {
              const existingIndex = updatedItems.findIndex(
                (item) => item.product.id === pair.product.id && item.isComboItem && item.comboId === combo.id
              );

              if (existingIndex > -1) {
                updatedItems[existingIndex].quantity += pair.quantity;
                updatedItems[existingIndex].selected = true;
              } else {
                updatedItems.push({
                  product: pair.product,
                  selectedSize: pair.product.sizes?.[0] || 'Standard',
                  selectedColor: pair.product.colors?.[0] || { name: 'Standard', hex: '#000000' },
                  quantity: pair.quantity,
                  selected: true,
                  customPrice: allocatedPrices[idx],
                  isComboItem: true,
                  comboId: combo.id,
                  promoLabel: combo.title,
                });
              }
            });
            return { items: syncPromotions(updatedItems), isCartOpen: true };
          });
        } catch (e) {
          console.error('Error adding combo bundle to cart:', e);
        }
      },
      getLines: () => get().items.filter(item => !item.isFreeItem).map(item => ({
          productId: item.product.id,
          selectedSize: item.selectedSize,
          colorName: item.selectedColor?.name || 'Standard',
          colorHex: item.selectedColor?.hex || '#000000',
          quantity: item.quantity,
          selected: item.selected !== false,
          claimedB1G1: Boolean(item.claimedB1G1),
          isComboItem: Boolean(item.isComboItem),
          comboId: item.comboId,
          promoLabel: item.promoLabel
        })),
      hydrateFromLines: (lines, removedFreeKeys, products) => {
        try {
          const { useSiteSettingsStore } = require('./useSiteSettingsStore');
          const combos = useSiteSettingsStore.getState().combos || [];
          const mergedItems: CartItem[] = [];
          
          for (const line of lines) {
            if (typeof line !== 'object' || !line.productId) continue;
            
            const product = products.find(p => p.id === line.productId);
            if (!product) continue;
            
            const quantity = Math.max(1, Math.min(99, Math.floor(Number(line.quantity) || 1)));
            const selectedSize = line.selectedSize || 'Standard';
            const selectedColor = product.colors?.find(c => c.hex === line.colorHex) || { name: line.colorName, hex: line.colorHex };
            
            const newItem: CartItem = {
              product,
              selectedSize,
              selectedColor,
              quantity,
              selected: line.selected,
              claimedB1G1: line.claimedB1G1,
              isComboItem: line.isComboItem,
              comboId: line.comboId,
              promoLabel: line.promoLabel
            };

            if (line.isComboItem && line.comboId) {
              const combo = combos.find((c: any) => c.id === line.comboId && c.enabled);
              if (!combo || !combo.items.every((ci: any) => products.some(p => p.id === ci.productId))) continue;
              
              const comboProducts = combo.items.map((item: any) => ({
                product: products.find(p => p.id === item.productId)!,
                quantity: item.quantity
              }));
              const prices = allocateComboPrices(comboProducts, combo.comboPrice);
              const idx = combo.items.findIndex((ci: any) => ci.productId === line.productId);
              newItem.customPrice = prices[idx];
              newItem.promoLabel = combo.title;
            }

            const key = `${product.id}|${selectedSize}|${selectedColor.hex}|${line.isComboItem ? line.comboId : ''}`;
            const existing = mergedItems.find(i => `${i.product.id}|${i.selectedSize}|${i.selectedColor.hex}|${i.isComboItem ? i.comboId : ''}` === key);
            
            if (existing) {
              existing.quantity = Math.max(existing.quantity, newItem.quantity);
            } else {
              mergedItems.push(newItem);
            }
          }
          const currentItems = get().items.filter(i => !i.isFreeItem);
          for (const item of currentItems) {
            const key = `${item.product.id}|${item.selectedSize}|${item.selectedColor.hex}|${item.isComboItem ? item.comboId : ''}`;
            const existing = mergedItems.find(i => `${i.product.id}|${i.selectedSize}|${i.selectedColor.hex}|${i.isComboItem ? i.comboId : ''}` === key);
            if (existing) {
              existing.quantity = Math.max(existing.quantity, item.quantity);
            } else {
              mergedItems.push(item);
            }
          }
          const mergedRemovedKeys = [...new Set([...get().removedFreeKeys, ...removedFreeKeys.filter(k => typeof k === 'string')])];
          const syncedItems = syncPromotions(mergedItems, mergedRemovedKeys);
          set({ items: syncedItems, removedFreeKeys: mergedRemovedKeys });
        } catch (e) {
          console.error('Error hydrating cart from lines:', e);
        }
      },
      restoreGuestCart: (products: Product[]) => {
        const state = get();
        if (state.ownerEmail === 'guest' && state.guestLines.length > 0) {
          state.hydrateFromLines(state.guestLines, state.removedFreeKeys, products);
        }
      },
    }),
    {
      name: 'magmati-cart-storage-v3',
      partialize: (s) => ({
        guestLines: s.ownerEmail === 'guest' ? s.guestLines : [],
        removedFreeKeys: s.ownerEmail === 'guest' ? s.removedFreeKeys : []
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('magmati-cart-storage-v2');
    localStorage.removeItem('magmati-wishlist-storage-v2');
  } catch (e) {}

  useCartStore.subscribe((state) => {
    if (state.ownerEmail === 'guest') {
      const newLines = state.getLines();
      if (JSON.stringify(newLines) !== JSON.stringify(state.guestLines)) {
        useCartStore.setState({ guestLines: newLines });
      }
    }
  });
}
