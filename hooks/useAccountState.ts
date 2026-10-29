'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore, UserProfile } from '@/store/useAuthStore';
import { useOrderStore, Order } from '@/store/useOrderStore';
import { useProductStore } from '@/store/useProductStore';
import { useCategoryStore, DEFAULT_CATEGORY_PLACEHOLDER } from '@/store/useCategoryStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { useVoucherStore, Voucher } from '@/store/useVoucherStore';
import { useReturnStore } from '@/store/useReturnStore';
import { useUIStore } from '@/store/useUIStore';
import { LogManager } from '@/lib/logManager';
import { Product, ProductMediaItem, ProductColor } from '@/types';
import { normalizeProductMedia, getProductHoverGif } from '@/lib/mediaUtils';
import { toast } from '@/store/useToastStore';
import { auth } from '@/lib/firebase';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { createAdminUserApi, updateAdminUserDetailsApi, setAdminUserRoleApi } from '@/lib/users/userApi';
import { useAdminUserChangeStore } from '@/store/useAdminUserChangeStore';

export type TabType = 'orders' | 'wishlist' | 'vouchers' | 'addresses' | 'profile' | 'settings';
export type AdminTabType = 'stats' | 'orders' | 'returns' | 'reviews' | 'products' | 'categories' | 'best-deals' | 'vouchers' | 'customers' | 'settings' | 'visitor-logs' | 'service-monitoring';

export function useAccountState() {
  const { items: wishlistItems, removeItem: removeWishlistItem } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);
  
  // Auth state
  const { 
    currentUser, 
    loginUser, 
    registerUser, 
    logoutUser, 
    updateProfile, 
    users, 
    impersonateUser,
    loginWithGoogle
  } = useAuthStore();
  
  // Order state
  const { orders, updateOrderStatus, deleteOrder } = useOrderStore();
  // Return state
  const { returnRequests } = useReturnStore();
  // Product state
  const { products, addProduct, updateProduct, deleteProduct, resetToDefault } = useProductStore();
  // Category state
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  // Site Settings state
  const siteSettings = useSiteSettingsStore();
  const analytics = useAnalyticsStore();

  // Voucher store state
  const { 
    vouchers, 
    userClaimedCodes, 
    claimVoucher, 
    isVoucherClaimed, 
    addVoucher, 
    updateVoucher,
    toggleVoucherStatus, 
    deleteVoucher,
    getVisibleVouchers
  } = useVoucherStore();

  const [isAdminMode, setIsAdminMode] = useState(false);
  const setIsAdminPanelActive = useUIStore((state) => state.setIsAdminPanelActive);

  // Sync admin panel active state with global AppLayout
  useEffect(() => {
    if (currentUser?.role === 'admin' && isAdminMode) {
      setIsAdminPanelActive(true);
    } else {
      setIsAdminPanelActive(false);
    }
    return () => {
      setIsAdminPanelActive(false);
    };
  }, [currentUser?.role, isAdminMode, setIsAdminPanelActive]);
  
  // Tab states
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  useScrollToTop(activeTab);
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTabType>('stats');
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [confirmClearLogs, setConfirmClearLogs] = useState(false);
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);
  const [wishlistViewMode, setWishlistViewMode] = useState<'table' | 'grid'>('table');
  const [expandedUserOrderId, setExpandedUserOrderId] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [copiedVoucherCode, setCopiedVoucherCode] = useState<string | null>(null);

  // Admin Customer management states
  const [adminCustomerSearch, setAdminCustomerSearch] = useState('');
  const [adminCustomerRoleFilter, setAdminCustomerRoleFilter] = useState<'All' | 'admin' | 'customer'>('All');
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (currentUser?.role !== 'admin') {
      setIsSuperAdmin(false);
      return;
    }
    async function checkSuperAdmin() {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          if (mounted) setIsSuperAdmin(false);
          return;
        }
        const res = await fetch('/api/auth/sync-role', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json().catch(() => null);
        if (mounted) {
          setIsSuperAdmin(data?.isSuperAdmin === true);
        }
      } catch (err) {
        if (mounted) {
          setIsSuperAdmin(false);
        }
      }
    }
    checkSuperAdmin();
    return () => {
      mounted = false;
    };
  }, [currentUser?.email, currentUser?.role]);
  const [editingCustomer, setEditingCustomer] = useState<UserProfile | null>(null);
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custRole, setCustRole] = useState<'admin' | 'customer'>('customer');
  const [customerFormError, setCustomerFormError] = useState<string | null>(null);

  // Admin Orders search & filter states
  const [adminOrderSearch, setAdminOrderSearch] = useState('');
  const [adminOrderStatusFilter, setAdminOrderStatusFilter] = useState<'All' | Order['status']>('All');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Admin Voucher creation & editing modal states
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [vCode, setVCode] = useState('');
  const [vMaxUsesPerCustomer, setVMaxUsesPerCustomer] = useState<number | undefined>(undefined);
  const [vMaxDiscountSpendPerUser, setVMaxDiscountSpendPerUser] = useState<number | undefined>(undefined);
  const [vTotalDiscountBudget, setVTotalDiscountBudget] = useState<number | undefined>(undefined);
  const [vAutoRemoveDaysAfterExpiry, setVAutoRemoveDaysAfterExpiry] = useState<number>(3);
  const [vTitleEn, setVTitleEn] = useState('');
  const [vDiscountType, setVDiscountType] = useState<'fixed' | 'percentage' | 'free_shipping'>('fixed');
  const [vDiscountValue, setVDiscountValue] = useState(200);
  const [vMinSpend, setVMinSpend] = useState(1500);
  const [vMaxDiscount, setVMaxDiscount] = useState<number | undefined>(undefined);
  const [vConditionEn, setVConditionEn] = useState('On orders over ৳1,500');
  const [vBadgeEn, setVBadgeEn] = useState('SPECIAL DEAL');
  const [vBgGradient, setVBgGradient] = useState('from-red-600 to-rose-700');
  const [vPaymentMethod, setVPaymentMethod] = useState<'all' | 'bkash' | 'nagad' | 'cod' | 'card'>('all');
  const [vRequiresLogin, setVRequiresLogin] = useState(false);
  const [vApplicableCategory, setVApplicableCategory] = useState<string>('All');
  const [vExpiresAt, setVExpiresAt] = useState<string>('');

  // Admin Hero Slide Manager states
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideTitleEn, setSlideTitleEn] = useState('');
  const [slideSubtitleEn, setSlideSubtitleEn] = useState('');
  const [slideBadgeEn, setSlideBadgeEn] = useState('');
  const [slideImage, setSlideImage] = useState('');
  const [slideBtnTextEn, setSlideBtnTextEn] = useState('Shop Now');
  const [slideBtnLink, setSlideBtnLink] = useState('/shop');
  
  // Login/Signup form states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerAddress, setRegisterAddress] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  // Profile forms
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('');

  // Security and Dev elevation states
  const [devElevateKey, setDevElevateKey] = useState('');
  const [devElevateError, setDevElevateError] = useState<string | null>(null);
  const [devElevateSuccess, setDevElevateSuccess] = useState(false);

  // Helper for uploading image files (Base64 Data URL / Cloudinary)
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void, folder: string = 'general') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const inputElement = e.target;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast.error('Please upload a valid image (JPEG, PNG, WEBP, GIF) under 5MB.');
      if (inputElement) inputElement.value = '';
      return;
    }

    setIsUploadingImage(true);
    try {
      const downscaleImage = async (f: File): Promise<File> => {
        if (f.type === 'image/gif') return f;
        try {
          const bitmap = await createImageBitmap(f);
          if (bitmap.width <= 1600 && bitmap.height <= 1600) {
            bitmap.close();
            return f;
          }
          const canvas = document.createElement('canvas');
          const ratio = Math.min(1600 / bitmap.width, 1600 / bitmap.height);
          canvas.width = bitmap.width * ratio;
          canvas.height = bitmap.height * ratio;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            bitmap.close();
            return f;
          }
          ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
          bitmap.close();
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
          if (!blob || blob.size >= f.size) return f;
          const extMap: Record<string, string> = { 'image/webp': '.webp', 'image/png': '.png', 'image/jpeg': '.jpg' };
          const ext = extMap[blob.type];
          if (!ext) return f;
          return new File([blob], f.name.replace(/\.[^/.]+$/, ext), { type: blob.type });
        } catch (e) {
          return f;
        }
      };

      const fileToUpload = await downscaleImage(file);
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.error('Authentication required for image upload.');
        return;
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data) {
        let errorMsg = 'Image upload failed. Please try again.';
        if (typeof data?.error === 'string' && data.error.length > 0) errorMsg = data.error;
        else if (res.status === 413) errorMsg = 'Image is too large.';
        else if ([502, 503, 504].includes(res.status)) errorMsg = 'Server is busy. Please try again in a moment.';
        toast.error(errorMsg);
        return;
      }

      if (data.url) {
        if (data.storage === 'data_url' && data.url.length > 700000) {
          toast.error('Image storage (Cloudinary) is not configured on the server, so this image is too large to save.');
        } else {
          callback(data.url);
          toast.success('Image uploaded.');
        }
      } else {
        toast.error(data.error || 'Image upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      toast.error('Image upload failed. Please try again.');
    } finally {
      setIsUploadingImage(false);
      if (inputElement) {
        inputElement.value = '';
      }
    }
  };

  // Admin Modal states for adding/editing product
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Product form fields
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState("Men's Fashion");
  const [prodSubcategory, setProdSubcategory] = useState('Panjabi');
  const [prodRegularPrice, setProdRegularPrice] = useState(0);
  const [prodSpecialPrice, setProdSpecialPrice] = useState<number | undefined>(undefined);
  const [prodDescription, setProdDescription] = useState('');
  const [prodImages, setProdImages] = useState<string[]>(['']);
  const [prodMedia, setProdMedia] = useState<ProductMediaItem[]>([
    { id: 'media-1', type: 'image', url: '', title: '' }
  ]);
  const [prodPreviewGifUrl, setProdPreviewGifUrl] = useState('');
  const [prodVideoUrl, setProdVideoUrl] = useState('');
  const [prodMainImageIndex, setProdMainImageIndex] = useState(0);
  const [prodLowStockThreshold, setProdLowStockThreshold] = useState<number | undefined>(undefined);
  const [prodSku, setProdSku] = useState('');
  const [prodInStock, setProdInStock] = useState(true);
  const [prodStockQuantity, setProdStockQuantity] = useState(10);
  const [prodBrand, setProdBrand] = useState('Atelier Premium');
  const [prodSizes, setProdSizes] = useState('38, 40, 42, 44');
  const [prodColors, setProdColors] = useState<ProductColor[]>([]);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [prodIsFlashDeal, setProdIsFlashDeal] = useState(false);
  const [prodIsTrending, setProdIsTrending] = useState(false);
  const [prodIsBestDeal, setProdIsBestDeal] = useState(false);
  const [prodIsNew, setProdIsNew] = useState(true);
  const [prodIsBrandMall, setProdIsBrandMall] = useState(false);

  // Per-product Badge Display control toggles
  const [prodShowDiscountBadge, setProdShowDiscountBadge] = useState(true);
  const [prodShowFlashBadge, setProdShowFlashBadge] = useState(true);
  const [prodShowTrendingBadge, setProdShowTrendingBadge] = useState(true);
  const [prodShowMallBadge, setProdShowMallBadge] = useState(true);
  const [prodShowHotDealBadge, setProdShowHotDealBadge] = useState(true);
  const [prodShowNewBadge, setProdShowNewBadge] = useState(true);
  const [prodAllowedPaymentMethods, setProdAllowedPaymentMethods] = useState<('cod' | 'bkash' | 'nagad' | 'card')[]>(['cod', 'bkash', 'nagad', 'card']);
  const [prodBestDealSectionId, setProdBestDealSectionId] = useState<string>('');
  const [prodTaxStatus, setProdTaxStatus] = useState<'taxable' | 'non_taxable' | 'shipping_only'>('taxable');
  const [prodTaxClass, setProdTaxClass] = useState<string>('');
  const [prodCostPrice, setProdCostPrice] = useState<number | undefined>(undefined);
  const [prodWholesalePrice, setProdWholesalePrice] = useState<number | undefined>(undefined);
  const [prodWholesaleMinQty, setProdWholesaleMinQty] = useState<number | undefined>(undefined);
  const [prodPricePerUnitLabel, setProdPricePerUnitLabel] = useState<string>('');

  // New Category form fields
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');

  // Admin product filters
  const [adminProductSearch, setAdminProductSearch] = useState('');
  const [adminProductCat, setAdminProductCat] = useState('All');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' && currentUser?.role === 'admin') {
        setIsAdminMode(true);
      }
      const tabParam = params.get('tab');
      if (tabParam === 'orders' || tabParam === 'wishlist' || tabParam === 'vouchers' || tabParam === 'addresses' || tabParam === 'profile' || tabParam === 'settings') {
        setActiveTab(tabParam as TabType);
      }
      const adminTabParam = params.get('adminTab');
      if (adminTabParam) {
        setActiveAdminTab(adminTabParam as AdminTabType);
      }
    }
  }, [currentUser?.role]);

  // Lock body scroll and prevent background interaction when mobile sidebar or modal is open
  useEffect(() => {
    const isOverlayOpen = mobileNavOpen || productModalOpen || voucherModalOpen || !!selectedVisitorId || confirmClearLogs || !!deletingProfileId;
    if (isOverlayOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileNavOpen, productModalOpen, voucherModalOpen, selectedVisitorId, confirmClearLogs, deletingProfileId]);

  // Sync profile editing fields when user loads (only on user ID switch)
  const currentUserId = currentUser?.id;
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfilePhone(currentUser.phone || '');
      setProfileAddress(currentUser.address || '');
      setProfileAvatarUrl(currentUser.avatarUrl || '');
    }
  }, [currentUserId]);

  // Dynamic system-wide metrics calculated live (order totals come from server summary API)
  const statsMetrics = useMemo(() => ({ activeProductsCount: products.length }), [products]);

  // Search filter for Admin Product panel
  const filteredAdminProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(adminProductSearch.toLowerCase()) || p.sku?.toLowerCase().includes(adminProductSearch.toLowerCase());
      const matchesCat = adminProductCat === 'All' || p.category === adminProductCat;
      const qty = p.stockQuantity ?? 10;
      const isLow = qty <= (p.lowStockThreshold ?? siteSettings.lowStockThreshold);
      const matchesLowStock = !lowStockOnly || isLow;
      return matchesSearch && matchesCat && matchesLowStock;
    });
  }, [products, adminProductSearch, adminProductCat, lowStockOnly, siteSettings.lowStockThreshold]);

  // Filter orders related to logged in customer (matched by email or phone)
  const myOrders = currentUser
    ? orders.filter((o) => {
        const emailMatch = currentUser.email && o.userEmail && o.userEmail.toLowerCase() === currentUser.email.toLowerCase();
        const cleanUserPhone = currentUser.phone?.replace(/[\s-+]/g, '').replace(/^88/, '');
        const cleanOrderPhone = o.phone?.replace(/[\s-+]/g, '').replace(/^88/, '');
        const phoneMatch = cleanUserPhone && cleanOrderPhone && cleanUserPhone === cleanOrderPhone;
        return Boolean(emailMatch || phoneMatch);
      })
    : [];

  // Handle Logins
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = loginEmail.trim();
    if (!targetEmail) {
      setAuthError('Email address is required.');
      return;
    }
    if (!loginPassword) {
      setAuthError('Password is required.');
      return;
    }
    setIsSubmittingAuth(true);
    setAuthError(null);
    try {
      const res = await loginUser(targetEmail, loginPassword);
      if (res.success) {
        setAuthError(null);
        setLoginPassword('');
      } else {
        setAuthError(res.error || ('Authentication failed. Please check your email and password.'));
      }
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Handle Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim()) {
      setAuthError('Full Name is required.');
      return;
    }
    if (!registerEmail.trim()) {
      setAuthError('Email address is required.');
      return;
    }
    if (!registerPassword) {
      setAuthError('Password is required.');
      return;
    }
    if (registerPassword.length < 4) {
      setAuthError('Password must be at least 4 characters long.');
      return;
    }
    setIsSubmittingAuth(true);
    setAuthError(null);
    try {
      const res = await registerUser(
        registerName.trim(), 
        registerEmail.trim(), 
        registerPhone.trim(), 
        registerAddress.trim(),
        registerPassword
      );
      if (res.success) {
        setAuthError(null);
        setRegisterPassword('');
      } else {
        setAuthError(res.error || ('Registration failed.'));
      }
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    if (isGoogleLoading || isSubmittingAuth) return;
    setAuthError(null);
    setIsGoogleLoading(true);

    let focusTimer: ReturnType<typeof setTimeout> | null = null;
    const handleWindowFocus = () => {
      focusTimer = setTimeout(() => {
        setIsGoogleLoading(false);
        window.removeEventListener('focus', handleWindowFocus);
      }, 1000);
    };
    window.addEventListener('focus', handleWindowFocus, { once: true });

    const safetyTimeout = setTimeout(() => {
      setIsGoogleLoading(false);
      window.removeEventListener('focus', handleWindowFocus);
    }, 25000);

    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        if (res.cancelled) {
          setAuthError(null);
          return;
        }
        let msg = res.error || 'Google Sign-In failed.';
        const msgLower = msg.toLowerCase();
        
        if (msgLower.includes('popup-blocked') || msgLower.includes('window was blocked') || msgLower.includes('popup blocked')) {
          msg = 'The Google sign-in window was blocked by your browser. Please enable popups or open the app in a new tab.';
        } else if (msgLower.includes('network-request-failed') || msgLower.includes('network connection')) {
          msg = 'Network connection issue occurred. Please check your internet connection and try again.';
        }
        setAuthError(msg);
      }
    } catch (err: any) {
      const msgLower = (err?.message || '').toLowerCase();
      const codeLower = (err?.code || '').toLowerCase();
      if (
        msgLower.includes('popup-closed-by-user') || 
        codeLower.includes('popup-closed-by-user') ||
        msgLower.includes('cancelled') ||
        msgLower.includes('closed')
      ) {
        setAuthError(null);
        return;
      }
      setAuthError(err?.message || ('Google Sign-In failed.'));
    } finally {
      clearTimeout(safetyTimeout);
      if (focusTimer) clearTimeout(focusTimer);
      window.removeEventListener('focus', handleWindowFocus);
      setIsGoogleLoading(false);
    }
  };

  const handleQuickLogin = (email: string) => {
    loginUser(email);
    setAuthError(null);
  };

  // Profile update handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profileName,
      phone: profilePhone,
      address: profileAddress,
      avatarUrl: profileAvatarUrl,
    });
    toast.success(profileName ? `Profile updated for ${profileName}.` : 'Profile updated.');
  };

  // Duplicate Product feature
  const duplicateProduct = async (product: Product) => {
    const cloned: Omit<Product, 'id'> = {
      ...product,
      name: `${product.name} (Copy)`,
      sku: `${product.sku || 'SKU'}-COPY-${products.length + 1}`,
    };
    const ok = await addProduct(cloned);
    if (ok) toast.success(`"${cloned.name}" was created.`);
    else toast.error(`Could not duplicate "${product.name}". Please try again.`);
  };

  // Open Add Product form
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory("Men's Fashion");
    setProdSubcategory('Panjabi');
    setProdRegularPrice(0);
    setProdSpecialPrice(undefined);
    setProdDescription('');
    setProdImages(['']);
    setProdMedia([
      { id: 'media-1', type: 'image', url: '', title: '' }
    ]);
    setProdPreviewGifUrl('');
    setProdVideoUrl('');
    setProdMainImageIndex(0);
    setProdLowStockThreshold(undefined);
    setProdSku(`MGM-AP-${Date.now().toString().slice(-6)}`);
    setProdInStock(true);
    setProdStockQuantity(25);
    setProdBrand('');
    setProdSizes('');
    setProdColors([]);
    setProdIsFlashDeal(false);
    setProdIsTrending(false);
    setProdIsBestDeal(false);
    setProdIsNew(true);
    setProdIsBrandMall(false);
    setProdShowDiscountBadge(true);
    setProdShowFlashBadge(true);
    setProdShowTrendingBadge(true);
    setProdShowMallBadge(true);
    setProdShowHotDealBadge(true);
    setProdShowNewBadge(true);
    setProdAllowedPaymentMethods(['cod', 'bkash', 'nagad', 'card']);
    setProdBestDealSectionId('');
    setProdTaxStatus('taxable');
    setProdTaxClass('');
    setProdCostPrice(undefined);
    setProdWholesalePrice(undefined);
    setProdWholesaleMinQty(undefined);
    setProdPricePerUnitLabel('');
    setProductModalOpen(true);
  };

  // Open Edit Product form
  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdCategory(product.category);
    setProdSubcategory(product.subcategory);
    const hasSpecialPrice = typeof product.originalPrice === 'number' && product.originalPrice > product.price;
    setProdRegularPrice(hasSpecialPrice ? (product.originalPrice as number) : product.price);
    setProdSpecialPrice(hasSpecialPrice ? product.price : undefined);
    setProdDescription(product.description);
    setProdImages(product.images?.length ? [...product.images] : ['']);
    
    const normalizedMedia = normalizeProductMedia(product);
    setProdMedia(normalizedMedia.length ? normalizedMedia : [{ id: 'media-1', type: 'image', url: '', title: '' }]);
    setProdPreviewGifUrl(product.previewGifUrl || getProductHoverGif(product) || '');
    setProdVideoUrl(product.videoUrl || '');

    setProdMainImageIndex(0);
    setProdLowStockThreshold(product.lowStockThreshold);
    setProdSku(product.sku || '');
    setProdInStock(product.inStock);
    setProdStockQuantity(product.stockQuantity ?? 10);
    setProdBrand(product.brand || 'Atelier Premium');
    setProdSizes(Array.isArray(product.sizes) ? product.sizes.join(', ') : 'FREE SIZE');
    setProdColors(Array.isArray(product.colors) ? product.colors.map((c) => ({ name: c.name, hex: c.hex })) : []);
    setProdIsFlashDeal(Boolean(product.isFlashDeal));
    setProdIsTrending(Boolean(product.isTrending));
    setProdIsBestDeal(Boolean(product.isBestDeal));
    setProdIsNew(Boolean(product.isNew));
    setProdIsBrandMall(Boolean(product.isBrandMall));
    setProdShowDiscountBadge(product.showDiscountBadge ?? true);
    setProdShowFlashBadge(product.showFlashBadge ?? true);
    setProdShowTrendingBadge(product.showTrendingBadge ?? true);
    setProdShowMallBadge(product.showMallBadge ?? true);
    setProdShowHotDealBadge(product.showHotDealBadge ?? true);
    setProdShowNewBadge(product.showNewBadge ?? true);
    setProdAllowedPaymentMethods(product.allowedPaymentMethods || ['cod', 'bkash', 'nagad', 'card']);
    setProdBestDealSectionId(product.bestDealSectionId || '');
    setProdTaxStatus((product as any).taxStatus || 'taxable');
    setProdTaxClass((product as any).taxClass || '');
    setProdCostPrice(product.cost_price ?? (product as any).costPrice);
    setProdWholesalePrice((product as any).wholesalePrice);
    setProdWholesaleMinQty((product as any).wholesaleMinQty);
    setProdPricePerUnitLabel((product as any).pricePerUnitLabel || '');
    setProductModalOpen(true);
  };

  // Handle Add/Edit Product submission
  const handleProductFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missingFields: string[] = [];
    if (!prodName.trim()) missingFields.push('Product Name');
    if (!prodCategory) missingFields.push('Category');
    if (!prodRegularPrice || Number(prodRegularPrice) <= 0) missingFields.push('Regular Price');
    if (prodStockQuantity === undefined || Number.isNaN(Number(prodStockQuantity)) || Number(prodStockQuantity) < 0) missingFields.push('Stock Qty');
    if (Number(prodStockQuantity) < 0) missingFields.push('Stock Quantity');
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`, 'Cannot save product');
      return;
    }

    const regularPrice = Number(prodRegularPrice);
    const specialPrice = prodSpecialPrice && Number(prodSpecialPrice) > 0 ? Number(prodSpecialPrice) : undefined;
    if (specialPrice !== undefined && specialPrice >= regularPrice) {
      toast.error('Special Price must be lower than Regular Price.', 'Cannot save product');
      return;
    }
    const finalSku = prodSku.trim() || `SKU-${Date.now().toString(36).toUpperCase()}`;

    const validMedia = prodMedia.filter((m) => m.url && m.url.trim().length > 0);
    
    let finalImages: string[] = [];
    if (validMedia.length > 0) {
      finalImages = validMedia.map((m) => m.url);
    } else {
      finalImages = [...prodImages].filter(Boolean);
      if (finalImages.length === 0) {
        finalImages = ['https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800&auto=format&fit=crop'];
      }
    }

    if (prodMainImageIndex > 0 && prodMainImageIndex < finalImages.length) {
      const main = finalImages.splice(prodMainImageIndex, 1)[0];
      finalImages.unshift(main);
    }

    const detectedVideo = validMedia.find((m) => m.type === 'video')?.url || prodVideoUrl.trim();
    const detectedGif = validMedia.find((m) => m.type === 'gif')?.url || prodPreviewGifUrl.trim();

    const parsedSizes = prodSizes.split(',').map((s) => s.trim()).filter(Boolean);

    const payload = {
      name: prodName,
      slug: prodName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category: prodCategory,
      subcategory: prodSubcategory,
      price: specialPrice !== undefined ? specialPrice : regularPrice,
      originalPrice: specialPrice !== undefined ? regularPrice : undefined,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewCount: editingProduct ? editingProduct.reviewCount : 1,
      images: finalImages,
      media: validMedia.length > 0 ? validMedia : undefined,
      previewGifUrl: detectedGif || undefined,
      videoUrl: detectedVideo || undefined,
      sizes: parsedSizes.length ? parsedSizes : ['FREE SIZE'],
      colors: prodColors.filter((c) => c.name.trim()).map((c) => ({ name: c.name.trim(), hex: c.hex || '#000000' })),
      inStock: prodInStock && Number(prodStockQuantity) > 0,
      stockQuantity: Number(prodStockQuantity),
      lowStockThreshold: prodLowStockThreshold,
      description: prodDescription,
      details: editingProduct ? editingProduct.details : (prodDescription.trim() ? [prodDescription] : []),
      brand: prodBrand.trim() || 'Atelier Premium',
      sku: finalSku,
      isFlashDeal: prodIsFlashDeal,
      isTrending: prodIsTrending,
      isBestDeal: prodIsBestDeal,
      isNew: prodIsNew,
      isBrandMall: prodIsBrandMall,
      showDiscountBadge: prodShowDiscountBadge,
      showFlashBadge: prodShowFlashBadge,
      showTrendingBadge: prodShowTrendingBadge,
      showMallBadge: prodShowMallBadge,
      showHotDealBadge: prodShowHotDealBadge,
      showNewBadge: prodShowNewBadge,
      allowedPaymentMethods: prodAllowedPaymentMethods,
      bestDealSectionId: prodBestDealSectionId || undefined,
      cost_price: prodCostPrice,
      taxStatus: prodTaxStatus,
      taxClass: prodTaxClass || undefined,
      wholesalePrice: prodWholesalePrice,
      wholesaleMinQty: prodWholesaleMinQty,
      pricePerUnitLabel: prodPricePerUnitLabel || undefined,
    };

    if (isSavingProduct) return;
    setIsSavingProduct(true);
    try {
      const ok = editingProduct ? await updateProduct(editingProduct.id, payload) : await addProduct(payload);
      if (ok) {
        toast.success(`"${prodName}" was saved successfully.`);
        setProductModalOpen(false);
      } else {
        toast.error(`Could not save "${prodName}". Check your connection and admin access, then try again.`);
      }
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Customer Management Handlers
  const openAddCustomerModal = () => {
    setEditingCustomer(null);
    setCustName('');
    setCustEmail('');
    setCustPhone('');
    setCustAddress('');
    setCustRole('customer');
    setCustomerFormError(null);
    setCustomerModalOpen(true);
  };

  const openEditCustomerModal = (user: UserProfile) => {
    setEditingCustomer(user);
    setCustName(user.name);
    setCustEmail(user.email);
    setCustPhone(user.phone || '');
    setCustAddress(user.address || '');
    setCustRole(user.role || 'customer');
    setCustomerFormError(null);
    setCustomerModalOpen(true);
  };

  const handleCustomerFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custEmail.trim()) {
      setCustomerFormError('Name and Email are required.');
      return;
    }
    setCustomerFormError(null);

    if (editingCustomer) {
      if (custEmail.trim().toLowerCase() !== editingCustomer.email.toLowerCase()) {
        setCustomerFormError('Email cannot be changed.');
        return;
      }
      const res = await updateAdminUserDetailsApi(editingCustomer.email, {
        name: custName.trim(),
        phone: custPhone.trim(),
        address: custAddress.trim(),
      });
      if (!res.ok) {
        setCustomerFormError(res.error);
        return;
      }
      if (custRole !== editingCustomer.role) {
        if (!isSuperAdmin) {
          setCustomerFormError('Only the main admin can change roles.');
          useAdminUserChangeStore.getState().publishUserChange(editingCustomer.email.toLowerCase());
          return;
        }
        const roleRes = await setAdminUserRoleApi(editingCustomer.email, custRole);
        if (!roleRes.ok) {
          setCustomerFormError('Details saved, but the role was not changed: ' + roleRes.error);
          useAdminUserChangeStore.getState().publishUserChange(editingCustomer.email.toLowerCase());
          return;
        }
      }
      useAdminUserChangeStore.getState().publishUserChange(editingCustomer.email.toLowerCase());
      toast.success('Customer updated.');
      setCustomerModalOpen(false);
    } else {
      const res = await createAdminUserApi({
        name: custName.trim(),
        email: custEmail.trim(),
        phone: custPhone.trim(),
        address: custAddress.trim(),
        role: custRole,
      });
      if (!res.ok) {
        setCustomerFormError(res.error || 'Failed to add user.');
        return;
      }
      useAdminUserChangeStore.getState().publishUserChange(res.user.email);
      toast.success('Customer added.');
      setCustomerModalOpen(false);
    }
  };


  // Hero Slider Handlers
  const openAddSlideModal = () => {
    setEditingSlideId(null);
    setSlideTitleEn('');
    setSlideSubtitleEn('');
    setSlideBadgeEn('SPECIAL PROMO');
    setSlideImage('https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=1600&auto=format&fit=crop&q=80');
    setSlideBtnTextEn('Shop Now');
    setSlideBtnLink('/shop');
    setSlideModalOpen(true);
  };

  const openEditSlideModal = (slide: any) => {
    setEditingSlideId(slide.id);
    setSlideTitleEn(slide.titleEn || '');
    setSlideSubtitleEn(slide.subtitleEn || '');
    setSlideBadgeEn(slide.badgeEn || '');
    setSlideImage(slide.image || '');
    setSlideBtnTextEn(slide.buttonTextEn || 'Shop Now');
    setSlideBtnLink(slide.buttonLink || '/shop');
    setSlideModalOpen(true);
  };

  const handleSlideFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideTitleEn.trim() || !slideImage.trim()) {
      toast.error('Slide Title and Image URL are required!');
      return;
    }
    const slideData = {
      title: slideTitleEn.trim(),
      titleEn: slideTitleEn.trim(),
      subtitle: slideSubtitleEn.trim(),
      subtitleEn: slideSubtitleEn.trim(),
      badge: slideBadgeEn.trim() || 'PROMO',
      badgeEn: slideBadgeEn.trim() || 'PROMO',
      image: slideImage.trim(),
      buttonText: slideBtnTextEn.trim() || 'Shop Now',
      buttonTextEn: slideBtnTextEn.trim() || 'Shop Now',
      buttonLink: slideBtnLink.trim() || '/shop',
    };

    if (editingSlideId) {
      siteSettings.updateHeroSlide(editingSlideId, slideData);
    } else {
      siteSettings.addHeroSlide(slideData);
    }
    setSlideModalOpen(false);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      slug: newCatName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
      image: newCatImage.trim() || DEFAULT_CATEGORY_PLACEHOLDER,
    });
    setNewCatName('');
    setNewCatImage('');
  };

  const handleUpdateCategory = async (id: string, updatedFields: { name: string; image: string; slug?: string; subcategories?: any[] }) => {
    const oldCategory = categories.find((c) => c.id === id);
    try {
      await updateCategory(id, updatedFields);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(`Could not update category "${updatedFields.name}". Please try again.`);
      return;
    }

    if (!oldCategory || oldCategory.name === updatedFields.name) {
      toast.success(`Category "${updatedFields.name}" was saved.`);
      return;
    }

    const affected = products.filter((p) => p.category === oldCategory.name);
    let failedCount = 0;
    for (const p of affected) {
      const ok = await updateProduct(p.id, { category: updatedFields.name });
      if (!ok) {
        failedCount++;
      }
    }

    if (failedCount === 0) {
      toast.success(`Category "${updatedFields.name}" updated successfully along with ${affected.length} product(s).`);
    } else {
      toast.error(`Category updated, but ${failedCount} of ${affected.length} product(s) failed to update. Please check connection.`);
    }
  };

  // Voucher Management Modal Openers
  const openAddVoucherModal = () => {
    setEditingVoucher(null);
    setVCode('');
    setVMaxUsesPerCustomer(1);
    setVMaxDiscountSpendPerUser(undefined);
    setVTotalDiscountBudget(undefined);
    setVAutoRemoveDaysAfterExpiry(3);
    setVTitleEn('15% Instant Discount');
    setVDiscountType('percentage');
    setVDiscountValue(15);
    setVMinSpend(1200);
    setVMaxDiscount(400);
    setVConditionEn('On orders above ৳1,200');
    setVBadgeEn('SPECIAL DEAL');
    setVBgGradient('from-zinc-900 to-zinc-800');
    setVPaymentMethod('all');
    setVRequiresLogin(false);
    setVApplicableCategory('All');
    setVExpiresAt('');
    setVoucherModalOpen(true);
  };

  const openEditVoucherModal = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setVCode(voucher.code);
    setVMaxUsesPerCustomer(voucher.maxUsesPerCustomer);
    setVMaxDiscountSpendPerUser(voucher.maxDiscountSpendPerUser);
    setVTotalDiscountBudget(voucher.totalDiscountBudget);
    setVAutoRemoveDaysAfterExpiry(voucher.autoRemoveDaysAfterExpiry ?? 3);
    setVTitleEn(voucher.titleEn || voucher.title || '');
    setVDiscountType(voucher.discountType);
    setVDiscountValue(voucher.discountValue);
    setVMinSpend(voucher.minSpend);
    setVMaxDiscount(voucher.maxDiscount);
    setVConditionEn(voucher.conditionEn || voucher.condition || '');
    setVBadgeEn(voucher.badgeEn || voucher.badge || '');
    setVBgGradient(voucher.bgGradient || 'from-red-600 to-rose-700');
    setVPaymentMethod(voucher.paymentMethodRequirement || 'all');
    setVRequiresLogin(Boolean(voucher.requiresLogin));
    setVApplicableCategory(voucher.applicableCategory || 'All');
    setVExpiresAt(voucher.expiresAt || '');
    setVoucherModalOpen(true);
  };

  return {
    wishlistItems,
    removeWishlistItem,
    addToCart,
    currentUser,
    loginUser,
    registerUser,
    logoutUser,
    updateProfile,
    users,
    impersonateUser,
    loginWithGoogle,
    orders,
    updateOrderStatus,
    deleteOrder,
    returnRequests,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToDefault,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    siteSettings,
    analytics,
    vouchers,
    userClaimedCodes,
    claimVoucher,
    isVoucherClaimed,
    addVoucher,
    updateVoucher,
    toggleVoucherStatus,
    deleteVoucher,
    getVisibleVouchers,
    isAdminMode,
    setIsAdminMode,
    activeTab,
    setActiveTab,
    activeAdminTab,
    setActiveAdminTab,
    selectedVisitorId,
    setSelectedVisitorId,
    confirmClearLogs,
    setConfirmClearLogs,
    deletingProfileId,
    setDeletingProfileId,
    wishlistViewMode,
    setWishlistViewMode,
    expandedUserOrderId,
    setExpandedUserOrderId,
    mobileNavOpen,
    setMobileNavOpen,
    copiedVoucherCode,
    setCopiedVoucherCode,
    adminCustomerSearch,
    setAdminCustomerSearch,
    adminCustomerRoleFilter,
    setAdminCustomerRoleFilter,
    customerModalOpen,
    setCustomerModalOpen,
    editingCustomer,
    setEditingCustomer,
    custName,
    setCustName,
    custEmail,
    setCustEmail,
    custPhone,
    setCustPhone,
    custAddress,
    setCustAddress,
    custRole,
    setCustRole,
    customerFormError,
    setCustomerFormError,
    adminOrderSearch,
    setAdminOrderSearch,
    adminOrderStatusFilter,
    setAdminOrderStatusFilter,
    selectedOrderDetails,
    setSelectedOrderDetails,
    voucherModalOpen,
    setVoucherModalOpen,
    editingVoucher,
    setEditingVoucher,
    vCode,
    setVCode,
    vMaxUsesPerCustomer,
    setVMaxUsesPerCustomer,
    vMaxDiscountSpendPerUser,
    setVMaxDiscountSpendPerUser,
    vTotalDiscountBudget,
    setVTotalDiscountBudget,
    vAutoRemoveDaysAfterExpiry,
    setVAutoRemoveDaysAfterExpiry,
    vTitleEn,
    setVTitleEn,
    vDiscountType,
    setVDiscountType,
    vDiscountValue,
    setVDiscountValue,
    vMinSpend,
    setVMinSpend,
    vMaxDiscount,
    setVMaxDiscount,
    vConditionEn,
    setVConditionEn,
    vBadgeEn,
    setVBadgeEn,
    vBgGradient,
    setVBgGradient,
    vPaymentMethod,
    setVPaymentMethod,
    vRequiresLogin,
    setVRequiresLogin,
    vApplicableCategory,
    setVApplicableCategory,
    vExpiresAt,
    setVExpiresAt,
    slideModalOpen,
    setSlideModalOpen,
    editingSlideId,
    setEditingSlideId,
    slideTitleEn,
    setSlideTitleEn,
    slideSubtitleEn,
    setSlideSubtitleEn,
    slideBadgeEn,
    setSlideBadgeEn,
    slideImage,
    setSlideImage,
    slideBtnTextEn,
    setSlideBtnTextEn,
    slideBtnLink,
    setSlideBtnLink,
    authMode,
    setAuthMode,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    registerName,
    setRegisterName,
    registerEmail,
    setRegisterEmail,
    registerPhone,
    setRegisterPhone,
    registerAddress,
    setRegisterAddress,
    registerPassword,
    setRegisterPassword,
    authError,
    setAuthError,
    showLoginPassword,
    setShowLoginPassword,
    showRegisterPassword,
    setShowRegisterPassword,
    rememberMe,
    setRememberMe,
    isSubmittingAuth,
    setIsSubmittingAuth,
    isGoogleLoading,
    setIsGoogleLoading,
    showForgotPasswordModal,
    setShowForgotPasswordModal,
    forgotPasswordEmail,
    setForgotPasswordEmail,
    forgotPasswordSent,
    setForgotPasswordSent,
    profileName,
    setProfileName,
    profilePhone,
    setProfilePhone,
    profileAddress,
    setProfileAddress,
    profileAvatarUrl,
    setProfileAvatarUrl,
    devElevateKey,
    setDevElevateKey,
    devElevateError,
    setDevElevateError,
    devElevateSuccess,
    setDevElevateSuccess,
    isUploadingImage,
    setIsUploadingImage,
    productModalOpen,
    setProductModalOpen,
    editingProduct,
    setEditingProduct,
    prodName,
    setProdName,
    prodCategory,
    setProdCategory,
    prodSubcategory,
    setProdSubcategory,
    prodRegularPrice,
    setProdRegularPrice,
    prodSpecialPrice,
    setProdSpecialPrice,
    prodDescription,
    setProdDescription,
    prodImages,
    setProdImages,
    prodMedia,
    setProdMedia,
    prodPreviewGifUrl,
    setProdPreviewGifUrl,
    prodVideoUrl,
    setProdVideoUrl,
    prodMainImageIndex,
    setProdMainImageIndex,
    prodLowStockThreshold,
    setProdLowStockThreshold,
    prodSku,
    setProdSku,
    prodInStock,
    setProdInStock,
    prodStockQuantity,
    setProdStockQuantity,
    prodBrand,
    setProdBrand,
    prodSizes,
    setProdSizes,
    prodColors,
    setProdColors,
    prodIsFlashDeal,
    setProdIsFlashDeal,
    prodIsTrending,
    setProdIsTrending,
    prodIsBestDeal,
    setProdIsBestDeal,
    prodIsNew,
    setProdIsNew,
    prodIsBrandMall,
    setProdIsBrandMall,
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
    prodAllowedPaymentMethods,
    setProdAllowedPaymentMethods,
    prodBestDealSectionId,
    setProdBestDealSectionId,
    prodTaxStatus,
    setProdTaxStatus,
    prodTaxClass,
    setProdTaxClass,
    prodCostPrice,
    setProdCostPrice,
    prodWholesalePrice,
    setProdWholesalePrice,
    prodWholesaleMinQty,
    setProdWholesaleMinQty,
    prodPricePerUnitLabel,
    setProdPricePerUnitLabel,
    newCatName,
    setNewCatName,
    newCatImage,
    setNewCatImage,
    adminProductSearch,
    setAdminProductSearch,
    adminProductCat,
    setAdminProductCat,
    lowStockOnly,
    setLowStockOnly,
    statsMetrics,
    filteredAdminProducts,
    myOrders,
    handleImageUpload,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleGoogleSignIn,
    handleQuickLogin,
    handleSaveProfile,
    duplicateProduct,
    openAddProductModal,
    openEditProductModal,
    handleProductFormSubmit,
    isSavingProduct,
    openAddCustomerModal,
    openEditCustomerModal,
    handleCustomerFormSubmit,
    openAddSlideModal,
    openEditSlideModal,
    handleSlideFormSubmit,
    handleAddCategory,
    handleUpdateCategory,
    openAddVoucherModal,
    openEditVoucherModal,
    isSuperAdmin,
  };
}
