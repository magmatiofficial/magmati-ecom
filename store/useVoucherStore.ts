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
  userClaimedCodes: string[]; // List of claimed coupon codes
  claimVoucher: (voucherIdOrCode: string, userEmail?: string) => {
    success: boolean;
    message: string;
  };
  isVoucherClaimed: (voucherIdOrCode: string, userEmail?: string) => boolean;
  applyAndValidateVoucher: (
    code: string,
    subtotal: number,
    deliveryFee: number,
    options?: VoucherValidationOptions
  ) => VoucherValidationResult;
  redeemVoucher: (code: string, userEmail?: string, discountAmount?: number) => void;
  addVoucher: (voucher: Omit<Voucher, 'id' | 'claimedByUsers'>) => void;
  updateVoucher: (id: string, data: Partial<Voucher>) => void;
  toggleVoucherStatus: (id: string) => void;
  deleteVoucher: (id: string) => void;
  resetVouchersToDefault: () => void;
  getVisibleVouchers: () => Voucher[]; // helper to get vouchers not auto-removed after expiration
  maxVouchersPerOrder: number;
  setMaxVouchersPerOrder: (val: number) => void;
}

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
    id: 'vouch-welcome100',
    code: 'WELCOME100',
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
      vouchers: INITIAL_VOUCHERS,
      userClaimedCodes: [],
      maxVouchersPerOrder: 1,

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

      claimVoucher: (voucherIdOrCode: string, userEmail?: string) => {
        const state = get();
        const codeUpper = voucherIdOrCode.trim().toUpperCase();
        const voucher = state.vouchers.find(
          (v) => v.id === voucherIdOrCode || v.code.toUpperCase() === codeUpper
        );

        if (!voucher) {
          return {
            success: false,
            message: 'Voucher not found',
          };
        }

        if (!voucher.isActive) {
          return {
            success: false,
            message: 'This voucher is currently inactive',
          };
        }

        // Account requirement check for collectible vouchers
        if (voucher.requiresLogin && (!userEmail || userEmail === 'guest')) {
          return {
            success: false,
            message: 'Account required: Please log in or register to collect this exclusive voucher.',
          };
        }

        const emailKey = userEmail && userEmail !== 'guest' ? userEmail.toLowerCase() : 'guest';
        
        // 1. Check overall budget limit
        if (voucher.totalDiscountBudget && (voucher.usedDiscountBudget || 0) >= voucher.totalDiscountBudget) {
          return {
            success: false,
            message: 'Voucher overall campaign discount limit has been reached.',
          };
        }

        // 2. Check maximum uses per customer
        if (voucher.maxUsesPerCustomer && emailKey !== 'guest') {
          const uses = voucher.usedByCount?.[emailKey] || 0;
          if (uses >= voucher.maxUsesPerCustomer) {
            return {
              success: false,
              message: `You have reached the maximum use limit of (${voucher.maxUsesPerCustomer}) for this voucher.`,
            };
          }
        }

        // 3. Check accumulated discount spend limit per customer
        if (voucher.maxDiscountSpendPerUser && emailKey !== 'guest') {
          const spend = voucher.userAccumulatedDiscounts?.[emailKey] || 0;
          if (spend >= voucher.maxDiscountSpendPerUser) {
            return {
              success: false,
              message: `You have reached the maximum accumulated discount limit of ৳${voucher.maxDiscountSpendPerUser} for this voucher.`,
            };
          }
        }

        const isAlreadyClaimed = 
          state.userClaimedCodes.includes(voucher.code) || 
          (emailKey !== 'guest' && voucher.claimedByUsers.includes(emailKey));

        if (isAlreadyClaimed) {
          return {
            success: true,
            message: `Voucher "${voucher.code}" already in your account & copied!`,
          };
        }

        // Add to claimed list
        set((current) => ({
          userClaimedCodes: Array.from(new Set([...current.userClaimedCodes, voucher.code])),
          vouchers: current.vouchers.map((v) =>
            v.id === voucher.id
              ? {
                  ...v,
                  claimedByUsers: emailKey !== 'guest' 
                    ? Array.from(new Set([...v.claimedByUsers, emailKey]))
                    : v.claimedByUsers
                }
              : v
          )
        }));

        return {
          success: true,
          message: `Voucher "${voucher.code}" successfully added to your account!`,
        };
      },

      isVoucherClaimed: (voucherIdOrCode, userEmail) => {
        const state = get();
        const codeUpper = voucherIdOrCode.trim().toUpperCase();
        const voucher = state.vouchers.find(
          (v) => v.id === voucherIdOrCode || v.code.toUpperCase() === codeUpper
        );
        if (!voucher) return false;

        const emailKey = userEmail && userEmail !== 'guest' ? userEmail.toLowerCase() : null;
        if (voucher.requiresLogin) {
          if (!emailKey) return false;
          return (
            voucher.claimedByUsers.includes(emailKey) ||
            state.userClaimedCodes.includes(voucher.code)
          );
        }

        return (
          state.userClaimedCodes.includes(voucher.code) ||
          (emailKey ? voucher.claimedByUsers.includes(emailKey) : false)
        );
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
          const uses = voucher.usedByCount?.[emailKey] || 0;
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
          const spend = voucher.userAccumulatedDiscounts?.[emailKey] || 0;
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

        // 1. Authentication & Collection check for Account-Required Vouchers
        if (voucher.requiresLogin) {
          if (!options || !options.isLoggedIn || !options.userEmail) {
            return {
              isValid: false,
              discountAmount: 0,
              isFreeShipping: false,
              message: `Voucher "${voucher.code}" requires an account. Please sign in and collect it first to apply.`,
              voucher
            };
          }

          // Check if collected by the user
          const isClaimedByUser = 
            state.userClaimedCodes.includes(voucher.code) ||
            voucher.claimedByUsers.some((u) => u.toLowerCase() === options.userEmail!.toLowerCase());

          if (!isClaimedByUser) {
            return {
              isValid: false,
              discountAmount: 0,
              isFreeShipping: false,
              message: `Please collect voucher "${voucher.code}" to your account before applying at checkout.`,
              voucher
            };
          }
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
          discount = deliveryFee;
          isFreeShip = true;
        }

        // Validate customer spend limit
        if (voucher.maxDiscountSpendPerUser && emailKey !== 'guest') {
          const spend = voucher.userAccumulatedDiscounts?.[emailKey] || 0;
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

        return {
          isValid: true,
          discountAmount: discount,
          isFreeShipping: isFreeShip,
          message: `Voucher ${voucher.code} applied! Saved ৳${discount.toLocaleString('en-US')}`,
          voucher
        };
      },

      redeemVoucher: (code, userEmail, discountAmount = 0) => {
        const state = get();
        const cleanCode = code.trim().toUpperCase();
        const emailKey = userEmail ? userEmail.toLowerCase() : 'guest';

        set((current) => ({
          vouchers: current.vouchers.map((v) => {
            if (v.code.toUpperCase() === cleanCode) {
              const currentCount = v.usedByCount?.[emailKey] || 0;
              const currentSpend = v.userAccumulatedDiscounts?.[emailKey] || 0;
              
              const updatedUsedByCount = {
                ...(v.usedByCount || {}),
                [emailKey]: currentCount + 1
              };
              
              const updatedAccumulated = {
                ...(v.userAccumulatedDiscounts || {}),
                [emailKey]: currentSpend + discountAmount
              };

              const newUsedBudget = (v.usedDiscountBudget || 0) + discountAmount;

              let isStillActive = v.isActive;
              if (v.totalDiscountBudget && newUsedBudget >= v.totalDiscountBudget) {
                isStillActive = false;
              }

              return {
                ...v,
                usedDiscountBudget: newUsedBudget,
                usedByCount: updatedUsedByCount,
                userAccumulatedDiscounts: updatedAccumulated,
                isActive: isStillActive
              };
            }
            return v;
          })
        }));
      },

      addVoucher: (voucherData) => {
        const newVoucher: Voucher = {
          ...voucherData,
          id: `vouch-${Date.now()}`,
          code: voucherData.code.trim().toUpperCase(),
          claimedByUsers: [],
          usedByCount: {},
          userAccumulatedDiscounts: {},
          usedDiscountBudget: 0
        };

        set((state) => ({
          vouchers: [newVoucher, ...state.vouchers]
        }));
      },

      updateVoucher: (id, data) => {
        set((state) => ({
          vouchers: state.vouchers.map((v) => (v.id === id ? { ...v, ...data } : v))
        }));
      },

      toggleVoucherStatus: (id) => {
        set((state) => ({
          vouchers: state.vouchers.map((v) =>
            v.id === id ? { ...v, isActive: !v.isActive } : v
          )
        }));
      },

      deleteVoucher: (id) => {
        set((state) => ({
          vouchers: state.vouchers.filter((v) => v.id !== id)
        }));
      },

      resetVouchersToDefault: () => {
        set({
          vouchers: INITIAL_VOUCHERS,
          userClaimedCodes: ['WELCOME100'],
          maxVouchersPerOrder: 1
        });
      },

      setMaxVouchersPerOrder: (val) => {
        set({ maxVouchersPerOrder: val });
      }
    }),
    {
      name: 'magmati-voucher-storage-v2' // upgrade version key to prevent schema mismatch
    }
  )
);
