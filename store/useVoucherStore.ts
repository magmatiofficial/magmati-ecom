/**
 * @file store/useVoucherStore.ts
 * @description Centralized Voucher & Coupon Management Store with Advanced Conditions.
 * Supports:
 * - Dynamic vouchers list (Managed by Admin)
 * - User voucher collection & persistence
 * - Smart validation engine (Maximum uses per customer, spend limits, overall budget, login requirements)
 * - Auto-removal of expired vouchers after admin-configured number of days
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, auth, sanitizeForFirestore } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { revalidateStorefrontCache } from '@/lib/revalidateStorefront';

export function extractCampaignVoucher(v: Partial<Voucher>): Record<string, any> {
  const {
    claimedByUsers,
    usedByCount,
    userAccumulatedDiscounts,
    usedDiscountBudget,
    ...campaignData
  } = v;
  return sanitizeForFirestore(campaignData);
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  titleEn?: string;
  condition: string;
  conditionEn?: string;
  badge: string;
  badgeEn?: string;
  expiresAtEn?: string;
  descriptionEn?: string;
  discountType: 'fixed' | 'percentage' | 'free_shipping';
  discountValue: number; // e.g. 200 for ৳200, 10 for 10%
  minSpend: number; // e.g. 1500
  maxDiscount?: number; // for percentage, e.g. 500
  paymentMethodRequirement?: 'all' | 'bkash' | 'nagad' | 'card' | 'cod';
  applicableCategory?: string; // 'all' or category name
  requiresLogin?: boolean;
  expiresAt?: string;
  isActive: boolean;
  bgGradient?: string;
  claimedByUsers: string[]; // user emails or 'guest'
  
  // Advanced Conditions
  maxUsesPerCustomer?: number; // e.g. 1 or 2 uses max
  maxDiscountSpendPerUser?: number; // max discount in BDT a single user can get from this code
  totalDiscountBudget?: number; // overall total budget allocated for this voucher, e.g. 50000
  usedDiscountBudget?: number; // accumulated total discount given by this voucher
  autoRemoveDaysAfterExpiry?: number; // number of days after expiry to automatically hide/remove, e.g. 3
  
  usedByCount?: { [userEmailOrGuest: string]: number }; // tracks how many times each user used it
  userAccumulatedDiscounts?: { [userEmailOrGuest: string]: number }; // tracks total discount amount each user got
}

export interface VoucherValidationOptions {
  paymentMethod?: string;
  isLoggedIn?: boolean;
  userEmail?: string;
  categoryNames?: string[];
  categories?: string[];
}

export interface VoucherValidationResult {
  isValid: boolean;
  discountAmount: number;
  isFreeShipping: boolean;
  message: string;
  voucher?: Voucher;
}

interface VoucherState {
  vouchers: Voucher[];
  vouchersLoaded: boolean;
  userClaimedCodes: string[]; // List of claimed coupon codes
  claimOwner: string;
  setClaimOwner: (email?: string | null) => void;
  voucherUsageTotals: Record<string, { usedDiscountBudget: number; totalOrders: number }>;
  setVoucherUsageTotals: (totals: Record<string, { usedDiscountBudget: number; totalOrders: number }>) => void;
  myVoucherUsage: Record<string, { usedCount: number; accumulatedDiscount: number }>;
  setMyVoucherUsage: (usage: Record<string, { usedCount: number; accumulatedDiscount: number }>) => void;
  refreshMyVoucherUsage: () => Promise<void>;
  loadMyClaims: () => Promise<void>;
  setVouchersFromServer: (list: Voucher[]) => void;
  markVouchersLoaded: () => void;
  setMaxVouchersPerOrderFromServer: (val: number) => void;
  claimVoucher: (voucherIdOrCode: string, userEmail?: string) => Promise<{
    success: boolean;
    message: string;
  }>;
  isVoucherClaimed: (voucherIdOrCode: string, userEmail?: string) => boolean;
  applyAndValidateVoucher: (
    code: string,
    subtotal: number,
    deliveryFee: number,
    options?: VoucherValidationOptions
  ) => VoucherValidationResult;
  addVoucher: (voucher: Omit<Voucher, 'id' | 'claimedByUsers'>) => Promise<void>;
  updateVoucher: (id: string, data: Partial<Voucher>) => Promise<void>;
  toggleVoucherStatus: (id: string) => Promise<void>;
  deleteVoucher: (id: string) => Promise<void>;
  importDefaultVouchers: () => Promise<{ added: number; skipped: number }>;
  resetVouchersToDefault: () => Promise<void>;
  getVisibleVouchers: () => Voucher[]; // helper to get vouchers not auto-removed after expiration
  maxVouchersPerOrder: number;
  setMaxVouchersPerOrder: (val: number) => Promise<void>;
}

export { INITIAL_VOUCHERS };

const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'vouch-magma200',
    code: 'MAGMA200',
    title: '৳200 Flat Discount',
    discountType: 'fixed',
    discountValue: 200,
    minSpend: 1500,
    condition: 'On orders above ৳1,500',
    badge: 'HOT VOUCHER',
    paymentMethodRequirement: 'all',
    requiresLogin: true,
    expiresAt: '2026-12-31',
    isActive: true,
    bgGradient: 'from-primary to-primary-dark',
    claimedByUsers: [],
    maxUsesPerCustomer: 2,
    maxDiscountSpendPerUser: 400,
    totalDiscountBudget: 10000,
    usedDiscountBudget: 0,
    autoRemoveDaysAfterExpiry: 3,
    usedByCount: {},
    userAccumulatedDiscounts: {}
  },
  {
    id: 'vouch-freeship',
    code: 'FREESHIP',
    title: '100% Free Delivery',
    discountType: 'free_shipping',
    discountValue: 120,
    minSpend: 999,
    condition: 'Nationwide on orders ৳999+',
    badge: 'MOST POPULAR',
    paymentMethodRequirement: 'all',
    requiresLogin: false,
    expiresAt: '2026-12-31',
    isActive: true,
    bgGradient: 'from-amber-600 to-yellow-600',
    claimedByUsers: [],
    maxUsesPerCustomer: 5,
    totalDiscountBudget: 25000,
    usedDiscountBudget: 0,
    autoRemoveDaysAfterExpiry: 3,
    usedByCount: {},
    userAccumulatedDiscounts: {}
  },
  {
    id: 'vouch-super10',
    code: 'SUPER10',
    title: '10% Mega Cashback',
    discountType: 'percentage',
    discountValue: 10,
    minSpend: 2000,
    maxDiscount: 500,
    condition: 'Up to ৳500 on ৳2,000+ orders',
    badge: 'SPECIAL 10%',
    paymentMethodRequirement: 'all',
    requiresLogin: true,
    expiresAt: '2026-11-30',
    isActive: true,
    bgGradient: 'from-emerald-600 to-teal-700',
    claimedByUsers: [],
    maxUsesPerCustomer: 1,
    totalDiscountBudget: 15000,
    usedDiscountBudget: 0,
    autoRemoveDaysAfterExpiry: 5,
    usedByCount: {},
    userAccumulatedDiscounts: {}
  },
  {
    id: 'vouch-welcome',
    code: 'WELCOME',
    title: '৳100 New Member Gift',
    discountType: 'fixed',
    discountValue: 100,
    minSpend: 800,
    condition: 'First order above ৳800',
    badge: 'WELCOME BONUS',
    paymentMethodRequirement: 'all',
    requiresLogin: true,
    expiresAt: '2026-12-31',
    isActive: true,
    bgGradient: 'from-blue-600 to-indigo-700',
    claimedByUsers: [],
    maxUsesPerCustomer: 1,
    totalDiscountBudget: 50000,
    usedDiscountBudget: 0,
    autoRemoveDaysAfterExpiry: 1,
    usedByCount: {},
    userAccumulatedDiscounts: {}
  },
  {
    id: 'vouch-bkash10',
    code: 'BKASH10',
    title: '10% bKash Instant Savings',
    discountType: 'percentage',
    discountValue: 10,
    minSpend: 1000,
    maxDiscount: 350,
    condition: 'Up to ৳350 on ৳1,000+ with bKash',
    badge: 'BKASH SPECIAL',
    paymentMethodRequirement: 'bkash',
    requiresLogin: false,
    expiresAt: '2026-10-31',
    isActive: true,
    bgGradient: 'from-pink-600 to-rose-700',
    claimedByUsers: [],
    maxUsesPerCustomer: 3,
    totalDiscountBudget: 30000,
    usedDiscountBudget: 0,
    autoRemoveDaysAfterExpiry: 3,
    usedByCount: {},
    userAccumulatedDiscounts: {}
  },
  {
    id: 'vouch-nagad10',
    code: 'NAGAD10',
    title: '10% Nagad Extra Cashback',
    discountType: 'percentage',
    discountValue: 10,
    minSpend: 1000,
    maxDiscount: 350,
    condition: 'Up to ৳350 on ৳1,000+ with Nagad',
    badge: 'NAGAD SPECIAL',
    paymentMethodRequirement: 'nagad',
    requiresLogin: false,
    expiresAt: '2026-10-31',
    isActive: true,
    bgGradient: 'from-amber-600 to-orange-700',
    claimedByUsers: [],
    maxUsesPerCustomer: 3,
    totalDiscountBudget: 30000,
    usedDiscountBudget: 0,
    autoRemoveDaysAfterExpiry: 3,
    usedByCount: {},
    userAccumulatedDiscounts: {}
  }
];

export const useVoucherStore = create<VoucherState>()(
  persist(
    (set, get) => ({
      vouchers: [],
      vouchersLoaded: false,
      claimOwner: 'guest',
      userClaimedCodes: [],
      maxVouchersPerOrder: 1,
      voucherUsageTotals: {},

      setClaimOwner: (email?: string | null) => {
        const key = email && email.trim() ? email.toLowerCase().trim() : 'guest';
        const state = get();
        if (state.claimOwner !== key) {
          set({
            claimOwner: key,
            userClaimedCodes: [],
          });
        }
      },

      setVoucherUsageTotals: (totals) => set({ voucherUsageTotals: totals }),

      myVoucherUsage: {},

      setMyVoucherUsage: (usage) => set({ myVoucherUsage: usage }),

      refreshMyVoucherUsage: async () => {
        try {
          if (auth && typeof (auth as any).authStateReady === 'function') {
            await (auth as any).authStateReady();
          }
          if (!auth?.currentUser) {
            set({ myVoucherUsage: {} });
            return;
          }
          const token = await auth.currentUser.getIdToken();
          const res = await fetch('/api/vouchers/my-usage', {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success) {
              set({ myVoucherUsage: json.usage || {} });
            } else {
              console.warn('[VoucherStore] refreshMyVoucherUsage error:', res.status, json?.error || 'Unknown error');
            }
          } else {
            const errorText = await res.text().catch(() => '');
            console.warn('[VoucherStore] refreshMyVoucherUsage HTTP error:', res.status, errorText);
          }
        } catch (err) {
          console.warn('[VoucherStore] Failed to refresh my voucher usage:', err);
        }
      },

      loadMyClaims: async () => {
        try {
          if (auth && typeof (auth as any).authStateReady === 'function') {
            await (auth as any).authStateReady();
          }
          if (!auth?.currentUser) {
            return;
          }
          const token = await auth.currentUser.getIdToken();
          const res = await fetch('/api/vouchers/claim', {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          });
          if (res.ok) {
            const json = await res.json().catch(() => null);
            if (json?.success && Array.isArray(json.codes)) {
              set({ userClaimedCodes: json.codes });
            }
          }
        } catch (err) {
          console.warn('[VoucherStore] Failed to load voucher claims:', err);
        }
      },

      setVouchersFromServer: (serverVouchers) => {
        const currentVouchers = get().vouchers;
        const currentMap = new Map(currentVouchers.map((v) => [v.id, v]));

        const merged = serverVouchers.map((serverVoucher) => {
          const existing = currentMap.get(serverVoucher.id);
          return {
            ...serverVoucher,
            claimedByUsers: existing?.claimedByUsers || [],
            usedByCount: existing?.usedByCount || {},
            userAccumulatedDiscounts: existing?.userAccumulatedDiscounts || {},
            usedDiscountBudget: existing?.usedDiscountBudget || 0,
          };
        });

        set({ vouchers: merged, vouchersLoaded: true });
      },

      markVouchersLoaded: () => {
        set({ vouchersLoaded: true });
      },

      setMaxVouchersPerOrderFromServer: (val) => {
        set({ maxVouchersPerOrder: val });
      },

      getVisibleVouchers: () => {
        const state = get();
        const now = new Date();
        return state.vouchers.filter((v) => {
          if (!v.expiresAt) return true;
          const expiryDate = new Date(v.expiresAt);
          // Set to end of expiry day
          expiryDate.setHours(23, 59, 59, 999);
          
          const timeDiff = now.getTime() - expiryDate.getTime();
          const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const maxAutoRemoveDays = v.autoRemoveDaysAfterExpiry ?? 3;
          
          // If expired by more than configured days, auto-remove (hide)
          if (timeDiff > 0 && daysDiff >= maxAutoRemoveDays) {
            return false;
          }
          return true;
        });
      },

      claimVoucher: async (voucherIdOrCode: string, userEmail?: string) => {
        if (!userEmail || userEmail === 'guest') {
          return {
            success: false,
            message: 'Account required: Please log in or register to collect this voucher.',
          };
        }

        try {
          if (auth && typeof (auth as any).authStateReady === 'function') {
            await (auth as any).authStateReady();
          }
          if (!auth?.currentUser) {
            return {
              success: false,
              message: 'Account required: Please log in or register to collect this voucher.',
            };
          }

          const state = get();
          const codeUpper = voucherIdOrCode.trim().toUpperCase();
          const voucher = state.vouchers.find(
            (v) => v.id === voucherIdOrCode || v.code.toUpperCase() === codeUpper
          );
          const codeToSend = voucher ? voucher.code : voucherIdOrCode;

          const token = await auth.currentUser.getIdToken();
          const res = await fetch('/api/vouchers/claim', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ code: codeToSend }),
          });

          const json = await res.json().catch(() => null);
          if (!json) {
            return {
              success: false,
              message: 'Could not reach server. Please try again.',
            };
          }

          if (Array.isArray(json.codes)) {
            set({ userClaimedCodes: json.codes });
          }

          return {
            success: Boolean(json.success),
            message: json.message || (json.success ? `Voucher "${codeToSend}" successfully added to your account!` : (json.error || 'Failed to process voucher claim.')),
          };
        } catch (err) {
          console.warn('[VoucherStore] Failed to claim voucher:', err);
          return {
            success: false,
            message: 'Could not reach server. Please try again.',
          };
        }
      },

      isVoucherClaimed: (voucherIdOrCode, userEmail) => {
        const state = get();
        if (!userEmail || userEmail === 'guest') return false;
        const codeUpper = voucherIdOrCode.trim().toUpperCase();
        const voucher = state.vouchers.find(
          (v) => v.id === voucherIdOrCode || v.code.toUpperCase() === codeUpper
        );
        const codeToTest = voucher ? voucher.code.toUpperCase() : codeUpper;
        return state.userClaimedCodes.some((c) => c.toUpperCase() === codeToTest);
      },

      applyAndValidateVoucher: (code, subtotal, deliveryFee, options) => {
        const state = get();
        const cleanCode = code.trim().toUpperCase();
        const voucher = state.vouchers.find(
          (v) => v.code.toUpperCase() === cleanCode
        );

        if (!voucher) {
          return {
            isValid: false,
            discountAmount: 0,
            isFreeShipping: false,
            message: 'Invalid or expired promo code.',
          };
        }

        if (!voucher.isActive) {
          return {
            isValid: false,
            discountAmount: 0,
            isFreeShipping: false,
            message: 'This voucher is currently inactive.',
          };
        }

        // Check if actually expired
        if (voucher.expiresAt) {
          const expiryDate = new Date(voucher.expiresAt);
          expiryDate.setHours(23, 59, 59, 999);
          if (new Date() > expiryDate) {
            return {
              isValid: false,
              discountAmount: 0,
              isFreeShipping: false,
              message: 'This voucher has expired.',
            };
          }
        }

        const emailKey = options?.userEmail && options.userEmail !== 'guest' ? options.userEmail.toLowerCase() : 'guest';

        // Check overall budget limit
        if (voucher.totalDiscountBudget && (voucher.usedDiscountBudget || 0) >= voucher.totalDiscountBudget) {
          return {
            isValid: false,
            discountAmount: 0,
            isFreeShipping: false,
            message: 'Campaign budget limit reached for this voucher.',
          };
        }

        // Check maximum uses per customer
        if (voucher.maxUsesPerCustomer && emailKey !== 'guest') {
          const uses = state.myVoucherUsage[voucher.id]?.usedCount ?? 0;
          if (uses >= voucher.maxUsesPerCustomer) {
            return {
              isValid: false,
              discountAmount: 0,
              isFreeShipping: false,
              message: `You have reached the maximum use limit of (${voucher.maxUsesPerCustomer}) for this voucher.`,
              voucher
            };
          }
        }

        // Check accumulated discount spend limit per customer
        if (voucher.maxDiscountSpendPerUser && emailKey !== 'guest') {
          const spend = state.myVoucherUsage[voucher.id]?.accumulatedDiscount ?? 0;
          if (spend >= voucher.maxDiscountSpendPerUser) {
            return {
              isValid: false,
              discountAmount: 0,
              isFreeShipping: false,
              message: `You have reached the maximum accumulated discount limit of ৳${voucher.maxDiscountSpendPerUser} for this voucher.`,
              voucher
            };
          }
        }

        if (voucher.discountType === 'free_shipping' && deliveryFee <= 0) {
          return {
            isValid: false,
            discountAmount: 0,
            isFreeShipping: false,
            message: `Delivery is already free for this order, so voucher ${voucher.code} is not needed.`,
            voucher
          };
        }

        // 1. Authentication check for Account-Required Vouchers
        if (voucher.requiresLogin) {
          if (!options || !options.isLoggedIn || !options.userEmail) {
            return {
              isValid: false,
              discountAmount: 0,
              isFreeShipping: false,
              message: `Voucher "${voucher.code}" requires an account. Please sign in to apply.`,
              voucher
            };
          }
        }

        if (((voucher.maxUsesPerCustomer ?? 0) > 0 || (voucher.maxDiscountSpendPerUser ?? 0) > 0) && (!options || !options.isLoggedIn || !options.userEmail)) {
          return {
            isValid: false,
            discountAmount: 0,
            isFreeShipping: false,
            message: `Voucher "${voucher.code}" has a per-customer limit, so it requires an account. Please sign in to apply.`,
            voucher
          };
        }

        // 2. Minimum spend check
        if (subtotal < voucher.minSpend) {
          return {
            isValid: false,
            discountAmount: 0,
            isFreeShipping: false,
            message: `Minimum order of ৳${voucher.minSpend.toLocaleString('en-US')} required for code ${voucher.code}.`,
            voucher
          };
        }

        // 3. Payment method requirement check
        if (voucher.paymentMethodRequirement && voucher.paymentMethodRequirement !== 'all' && options?.paymentMethod) {
          const pm = options.paymentMethod.toLowerCase();
          if (voucher.paymentMethodRequirement === 'bkash' && !pm.includes('bkash')) {
            return {
              isValid: false,
              discountAmount: 0,
              isFreeShipping: false,
              message: `Code ${voucher.code} is valid only for bKash payment method.`,
              voucher
            };
          }
          if (voucher.paymentMethodRequirement === 'nagad' && !pm.includes('nagad')) {
            return {
              isValid: false,
              discountAmount: 0,
              isFreeShipping: false,
              message: `Code ${voucher.code} is valid only for Nagad payment method.`,
              voucher
            };
          }
          if (voucher.paymentMethodRequirement === 'cod' && !pm.includes('cash') && !pm.includes('delivery')) {
            return {
              isValid: false,
              discountAmount: 0,
              isFreeShipping: false,
              message: `Code ${voucher.code} is valid only for Cash on Delivery.`,
              voucher
            };
          }
          if (voucher.paymentMethodRequirement === 'card' && !pm.includes('card')) {
            return {
              isValid: false,
              discountAmount: 0,
              isFreeShipping: false,
              message: `Code ${voucher.code} is valid only for Card payments.`,
              voucher
            };
          }
        }

        // 4. Applicable category check
        const activeCategories = options?.categories || options?.categoryNames;
        if (voucher.applicableCategory && voucher.applicableCategory.toLowerCase() !== 'all' && activeCategories && activeCategories.length > 0) {
          const match = activeCategories.some(
            (c) => c.toLowerCase().trim() === voucher.applicableCategory!.toLowerCase().trim()
          );
          if (!match) {
            return {
              isValid: false,
              discountAmount: 0,
              isFreeShipping: false,
              message: `Code ${voucher.code} is applicable only for products in "${voucher.applicableCategory}".`,
              voucher
            };
          }
        }

        let discount = 0;
        let isFreeShip = false;

        if (voucher.discountType === 'fixed') {
          discount = Math.min(voucher.discountValue, subtotal);
        } else if (voucher.discountType === 'percentage') {
          const calculated = Math.round((subtotal * voucher.discountValue) / 100);
          discount = voucher.maxDiscount ? Math.min(calculated, voucher.maxDiscount) : calculated;
        } else if (voucher.discountType === 'free_shipping') {
          if (deliveryFee <= 0) {
            return {
              isValid: false,
              discountAmount: 0,
              isFreeShipping: false,
              message: `Delivery is already free for this order, so voucher ${voucher.code} is not needed.`,
              voucher
            };
          }
          discount = deliveryFee;
          isFreeShip = true;
        }

        // Validate customer spend limit
        if (voucher.maxDiscountSpendPerUser && emailKey !== 'guest') {
          const spend = state.myVoucherUsage[voucher.id]?.accumulatedDiscount ?? 0;
          if (spend + discount > voucher.maxDiscountSpendPerUser) {
            const allowedDiscount = voucher.maxDiscountSpendPerUser - spend;
            if (allowedDiscount <= 0) {
              return {
                isValid: false,
                discountAmount: 0,
                isFreeShipping: false,
                message: `You have reached the maximum accumulated discount limit of ৳${voucher.maxDiscountSpendPerUser} for this voucher.`,
                voucher
              };
            }
            discount = allowedDiscount;
          }
        }

        if (discount <= 0) {
          return {
            isValid: false,
            discountAmount: 0,
            isFreeShipping: false,
            message: `Voucher ${voucher.code} gives no discount on this order.`,
            voucher
          };
        }

        return {
          isValid: true,
          discountAmount: discount,
          isFreeShipping: isFreeShip,
          message: `Voucher ${voucher.code} applied! Saved ৳${discount.toLocaleString('en-US')}`,
          voucher
        };
      },

      addVoucher: async (voucherData) => {
        if (!db) throw new Error('Database not initialized');
        const id = `vouch-${Date.now()}`;
        const cleanCode = voucherData.code.trim().toUpperCase();
        const newVoucher: Voucher = {
          ...voucherData,
          id,
          code: cleanCode,
          claimedByUsers: [],
          usedByCount: {},
          userAccumulatedDiscounts: {},
          usedDiscountBudget: 0
        };

        const campaignDoc = extractCampaignVoucher(newVoucher);
        await setDoc(doc(db, 'vouchers', id), campaignDoc);
        revalidateStorefrontCache();

        set((state) => ({
          vouchers: [newVoucher, ...state.vouchers]
        }));
      },

      updateVoucher: async (id, data) => {
        if (!db) throw new Error('Database not initialized');
        const existing = get().vouchers.find((v) => v.id === id);
        if (!existing) throw new Error('Voucher not found');

        const updated: Voucher = { ...existing, ...data };
        if (data.code) {
          updated.code = data.code.trim().toUpperCase();
        }

        const campaignDoc = extractCampaignVoucher(updated);
        await setDoc(doc(db, 'vouchers', id), campaignDoc);
        revalidateStorefrontCache();

        set((state) => ({
          vouchers: state.vouchers.map((v) => (v.id === id ? updated : v))
        }));
      },

      toggleVoucherStatus: async (id) => {
        if (!db) throw new Error('Database not initialized');
        const existing = get().vouchers.find((v) => v.id === id);
        if (!existing) throw new Error('Voucher not found');

        const updated: Voucher = { ...existing, isActive: !existing.isActive };
        const campaignDoc = extractCampaignVoucher(updated);
        await setDoc(doc(db, 'vouchers', id), campaignDoc);
        revalidateStorefrontCache();

        set((state) => ({
          vouchers: state.vouchers.map((v) =>
            v.id === id ? updated : v
          )
        }));
      },

      deleteVoucher: async (id) => {
        if (!db) throw new Error('Database not initialized');
        await deleteDoc(doc(db, 'vouchers', id));
        revalidateStorefrontCache();

        set((state) => ({
          vouchers: state.vouchers.filter((v) => v.id !== id)
        }));
      },

      importDefaultVouchers: async () => {
        if (!db) throw new Error('Database not initialized');
        const currentVouchers = get().vouchers;
        const existingIds = new Set(currentVouchers.map((v) => v.id));

        let added = 0;
        let skipped = 0;

        const batch = writeBatch(db);

        for (const voucher of INITIAL_VOUCHERS) {
          if (existingIds.has(voucher.id)) {
            skipped++;
            continue;
          }

          const voucherRef = doc(db, 'vouchers', voucher.id);
          batch.set(voucherRef, extractCampaignVoucher(voucher));
          added++;
        }

        if (added > 0) {
          await batch.commit();
          revalidateStorefrontCache();
        }

        return { added, skipped };
      },

      resetVouchersToDefault: async () => {
        if (!db) throw new Error('Database not initialized');
        const currentVouchers = get().vouchers;
        const defaultIds = new Set(INITIAL_VOUCHERS.map((v) => v.id));

        const batch = writeBatch(db);

        // Write all defaults
        for (const voucher of INITIAL_VOUCHERS) {
          const voucherRef = doc(db, 'vouchers', voucher.id);
          batch.set(voucherRef, extractCampaignVoucher(voucher));
        }

        // Delete non-default vouchers
        for (const curr of currentVouchers) {
          if (!defaultIds.has(curr.id)) {
            const voucherRef = doc(db, 'vouchers', curr.id);
            batch.delete(voucherRef);
          }
        }

        // Also reset public_settings/vouchers maxVouchersPerOrder
        const settingsRef = doc(db, 'public_settings', 'vouchers');
        batch.set(settingsRef, { maxVouchersPerOrder: 1 }, { merge: true });

        await batch.commit();
        revalidateStorefrontCache();

        set({
          vouchers: INITIAL_VOUCHERS,
          maxVouchersPerOrder: 1,
        });
      },

      setMaxVouchersPerOrder: async (val) => {
        if (!db) throw new Error('Database not initialized');
        const settingsRef = doc(db, 'public_settings', 'vouchers');
        await setDoc(settingsRef, { maxVouchersPerOrder: val }, { merge: true });
        revalidateStorefrontCache();

        set({ maxVouchersPerOrder: val });
      }
    }),
    {
      name: 'magmati-voucher-storage-v4',
      partialize: () => ({}),
    }
  )
);
