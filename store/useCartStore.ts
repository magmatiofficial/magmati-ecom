'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductColor } from '@/types';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';

interface CartState {
  items: CartItem[];
  removedFreeKeys: string[];
  isCartOpen: boolean;
  cartError: string | null;
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
}

const syncPromotions = (items: CartItem[], removedFreeKeys: string[] = []): CartItem[] => {
  // 1. Remove existing free items first so we can re-evaluate fresh
  const cleanItems = items.filter((item) => !item.isFreeItem);

  // 2. Identify active b1g1Offers from siteSettings
  let offers: any[] = [];
  try {
    const { useSiteSettingsStore } = require('./useSiteSettingsStore');
    offers = useSiteSettingsStore.getState().b1g1Offers || [];
  } catch (e) {
    // Ignore require issues during ssr / initialization
  }

  const activeOffers = offers.filter((o) => o.enabled);

  // 3. For each active offer, look for qualifying buy items in cart that have claimedB1G1 === true
  const freeItemsToAdd: CartItem[] = [];

  activeOffers.forEach((offer) => {
    // Look for qualifying buy items that are not free items themselves, not combo items, AND explicitly claimed B1G1
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
        // Resolve product details for the free item
        try {
          const { useProductStore } = require('./useProductStore');
          const products = useProductStore.getState().products || [];
          const freeProduct = products.find((p: any) => p.id === offer.getProductId);

          if (freeProduct) {
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
      removedFreeKeys: [],
      isCartOpen: false,
      cartError: null,
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
        } catch {
          // Ignore analytics failures
        }

        set((state) => {
          // Clear removed key for this product if adding fresh
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

          // Evaluate B1G1 and promo additions
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
            if (!nextRemovedKeys.includes(freeKey)) {
              nextRemovedKeys.push(freeKey);
            }
          } else if (removedItem && !removedItem.isFreeItem) {
            // If removing qualifying buy item, clear its associated removed free keys
            nextRemovedKeys = nextRemovedKeys.filter((k) => !k.endsWith(`-${productId}`));
          }

          const filtered = state.items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.selectedSize === size &&
                item.selectedColor.hex === colorHex
              )
          );
          // Sync B1G1 elements
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
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor.hex === colorHex
              ? { ...item, quantity }
              : item
          );
          // Sync B1G1 elements
          return { items: syncPromotions(updated, state.removedFreeKeys) };
        });
      },
      toggleItemSelection: (productId, size, colorHex) => {
        set((state) => {
          const updated = state.items.map((item) => {
            if (
              item.product.id === productId &&
              item.selectedSize === size &&
              item.selectedColor.hex === colorHex
            ) {
              const currentSelected = item.selected !== false;
              return { ...item, selected: !currentSelected };
            }
            return item;
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
      getSelectedItems: () => {
        return get().items.filter((item) => item.selected !== false);
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getSelectedItemsCount: () => {
        return get()
          .items.filter((item) => item.selected !== false)
          .reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = typeof item.customPrice === 'number' ? item.customPrice : item.product.price;
          return total + price * item.quantity;
        }, 0);
      },
      getSelectedTotalPrice: () => {
        return get()
          .items.filter((item) => item.selected !== false)
          .reduce((total, item) => {
            const price = typeof item.customPrice === 'number' ? item.customPrice : item.product.price;
            return total + price * item.quantity;
          }, 0);
      },
      addComboBundle: (combo) => {
        try {
          const { useProductStore } = require('./useProductStore');
          const allProducts = useProductStore.getState().products || [];
          
          // Look up all products belonging to this combo
          const comboProducts = combo.items.map((item: any) => {
            const prod = allProducts.find((p: any) => p.id === item.productId);
            return { product: prod, quantity: item.quantity };
          }).filter((pair: any) => !!pair.product);

          if (comboProducts.length === 0) return;

          // Ensure all products are in stock
          const outOfStock = comboProducts.find((pair: any) => {
            const currentStock = typeof pair.product.stockQuantity === 'number' 
              ? pair.product.stockQuantity 
              : (pair.product.inStock !== false ? 50 : 0);
            return pair.product.inStock === false || currentStock < pair.quantity;
          });

          if (outOfStock) {
            set({ cartError: `Sorry, some items in the combo "${combo.title}" are out of stock right now.` });
            return;
          }

          // Calculate proportional price allocation
          const originalSum = comboProducts.reduce((sum: number, pair: any) => sum + pair.product.price, 0);
          const comboPrice = combo.comboPrice;

          set((state) => {
            let updatedItems = [...state.items];

            comboProducts.forEach((pair: any, idx: number) => {
              // Allocate price proportionally
              let allocatedPrice = comboPrice;
              if (originalSum > 0) {
                allocatedPrice = Math.round((pair.product.price / originalSum) * comboPrice);
              }
              // For the last item, adjust the price to prevent rounding errors
              if (idx === comboProducts.length - 1) {
                const allocatedSum = comboProducts.slice(0, -1).reduce((sum: number, p: any, i: number) => {
                  const allocated = originalSum > 0 ? Math.round((p.product.price / originalSum) * comboPrice) : comboPrice;
                  return sum + allocated;
                }, 0);
                allocatedPrice = comboPrice - allocatedSum;
              }

              // Check if item is already in cart
              const existingIndex = updatedItems.findIndex(
                (item) =>
                  item.product.id === pair.product.id &&
                  item.isComboItem &&
                  item.comboId === combo.id
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
                  customPrice: allocatedPrice,
                  isComboItem: true,
                  comboId: combo.id,
                  promoLabel: combo.title,
                });
              }
            });

            // Trigger B1G1 evaluation
            return { items: syncPromotions(updatedItems), isCartOpen: true };
          });
        } catch (e) {
          console.error('Error adding combo bundle to cart:', e);
        }
      }
    }),
    {
      name: 'magmati-cart-storage',
    }
  )
);
