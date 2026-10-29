/**
 * @file components/layout/AppLayout.tsx
 * @description Master responsive layout shell encompassing Navbar, Drawers, Mobile Bottom Nav, and Footer.
 */

'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { TopNavbar } from './TopNavbar';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { CategoryDrawer } from './CategoryDrawer';
import { SearchModal } from './SearchModal';
import { Footer } from './Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { WishlistDrawer } from '@/components/cart/WishlistDrawer';
import { LoadingBar } from './LoadingBar';
import { DynamicThemeStyles } from './DynamicThemeStyles';
import { AutoScrollIndicator } from '@/components/ui/AutoScrollIndicator';
import { useUIStore } from '@/store/useUIStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useProductSync } from '@/hooks/useProductSync';
import { useSiteSettingsSync } from '@/hooks/useSiteSettingsSync';
import { useCategorySync } from '@/hooks/useCategorySync';
import { useVoucherSync } from '@/hooks/useVoucherSync';
import { useAccountScopedStores } from '@/hooks/useAccountScopedStores';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ShieldAlert, ArrowLeftRight } from 'lucide-react';
import { Toaster } from '@/components/ui/Toaster';
import { toast } from '@/store/useToastStore';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // Global Real-Time Firestore Product & Category Catalog Sync
  useProductSync();
  useSiteSettingsSync();
  useCategorySync();
  useVoucherSync();
  useAccountScopedStores();

  const pathname = usePathname();
  const isAdminPanelActive = useUIStore((state) => state.isAdminPanelActive);
  const isAdminPage = pathname?.startsWith('/admin') || isAdminPanelActive;
  useScrollToTop(`${pathname}|${isAdminPanelActive}`);
  const isAccountPage = pathname?.startsWith('/account') || isAdminPage;

  const isCategoryDrawerOpen = useUIStore((state) => state.isCategoryDrawerOpen);
  const isSearchOpen = useUIStore((state) => state.isSearchOpen);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const cartError = useCartStore((state) => state.cartError);
  const setCartError = useCartStore((state) => state.setCartError);

  // Show cart errors through the global toast system
  useEffect(() => {
    if (cartError) {
      toast.error(cartError, 'Cart Alert');
      setCartError(null);
    }
  }, [cartError, setCartError]);
  const isWishlistOpen = useWishlistStore((state) => state.isWishlistOpen);

  const { currentUser, exitImpersonation, updateUserDetails } = useAuthStore();

  // Automatic Session Restoration from Firebase Auth
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const { setAuthReady } = useAuthStore.getState();

    // Safety timer: mark auth as ready after 4 seconds regardless of Firebase response
    const safetyTimer = setTimeout(() => {
      setAuthReady(true);
    }, 4000);

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (!fbUser) {
          setAuthReady(true);
          clearTimeout(safetyTimer);
          return;
        }

        const state = useAuthStore.getState();
        const localUser = state.currentUser;

        // If already matched, skip
        if (localUser && localUser.email.toLowerCase() === fbUser.email?.toLowerCase()) {
          setAuthReady(true);
          clearTimeout(safetyTimer);
          return;
        }

        // If impersonating, do not disrupt
        if (localUser?.impersonatingFromAdminEmail) {
          setAuthReady(true);
          clearTimeout(safetyTimer);
          return;
        }

        // Restore session from authoritative Firebase source
        await state.restoreSessionFromFirebase(fbUser);
      } catch (err) {
        console.warn('[AuthRestore] Failed:', err);
      } finally {
        setAuthReady(true);
        clearTimeout(safetyTimer);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  // Global Auth Sync: Authoritatively verify and sync user role from server whenever session refreshes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const syncUserRole = async () => {
      const fbUser = auth.currentUser;
      if (!fbUser || !currentUser) return;
      // Never sync/write roles while an admin is impersonating a customer
      if (currentUser.impersonatingFromAdminEmail) return;

      try {
        const idToken = await fbUser.getIdToken();
        const res = await fetch('/api/auth/sync-role', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.role && data.role !== currentUser.role) {
            console.log(`[AuthSync] Authoritative role update: ${currentUser.role} -> ${data.role}`);
            // Use updateUserDetails to only change role without losing other profile data
            updateUserDetails(currentUser.id, { role: data.role });
          }
        }
      } catch (err) {
        console.warn('[AuthSync] Role verification skipped:', err);
      }
    };

    // Initial sync on mount or user change
    syncUserRole();

    // Periodic sync every 15 minutes to handle background role updates
    const interval = setInterval(syncUserRole, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentUser?.id, currentUser?.role, updateUserDetails, currentUser]);

  // Lock body scroll and prevent any background interaction when any drawer/overlay is active
  useEffect(() => {
    const isAnyOverlayActive = isCategoryDrawerOpen || isSearchOpen || isCartOpen || isWishlistOpen;
    if (isAnyOverlayActive) {
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
  }, [isCategoryDrawerOpen, isSearchOpen, isCartOpen, isWishlistOpen]);

  // Conditionally subscribe to live Firestore orders for Admin or Account/Track routes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (isAdminPage || pathname?.startsWith('/account') || pathname?.startsWith('/track')) {
        const unsub = useOrderStore.getState().syncWithFirestore();
        return () => {
          if (typeof unsub === 'function') {
            (unsub as () => void)();
          }
        };
      }
    } catch {
      // Ignore SSR/prerender sync errors
    }
  }, [isAdminPage, pathname]);

  return (
    <>
      <div className="flex flex-col min-h-screen bg-app-bg">
        {currentUser?.impersonatingFromAdminEmail && (
          <div className="bg-amber-400 text-zinc-950 font-bold text-xs py-2.5 px-4 sticky top-0 z-50 flex items-center justify-between shadow-md border-b border-amber-500 font-sans">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-zinc-950 animate-pulse shrink-0" />
              <span>
                {`ADMIN ACT-AS IMPERSONATION MODE: Logged in as customer "${currentUser.name}" (${currentUser.email}).`}
              </span>
            </div>
            <button
              onClick={() => {
                exitImpersonation();
              }}
              className="px-3 py-1 bg-zinc-950 text-white rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-1 font-extrabold cursor-pointer text-2xs"
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>{'Exit Act-As'}</span>
            </button>
          </div>
        )}
        <DynamicThemeStyles />
        {/* Top Loading Progress Bar for Instant Page Navigation Feedback */}
        <LoadingBar />

        {/* Floating Auto-Hide Overlay Scroll Indicator */}
        <AutoScrollIndicator />

        {/* Top Navbar (Desktop) - Hidden ONLY on Admin Dashboard */}
        {!isAdminPage && <TopNavbar />}

        {/* Mobile Top Header - Hidden ONLY on Admin Dashboard */}
        {!isAdminPage && <MobileHeader />}

        {/* Main Page Content - pb-20 on mobile (except admin pages) */}
        <main className={`flex-1 w-full ${isAdminPage ? 'pb-0' : 'pb-20 md:pb-0'}`}>
          {children}
        </main>

        {/* Footer - Hidden ONLY on Admin Dashboard */}
        {!isAdminPage && <Footer />}
      </div>

      {/* Mobile Native Bottom Navigation Bar - Standalone fixed overlay outside page container */}
      {!isAdminPage && <MobileBottomNav />}

      {/* Global Interactive Drawers & Modals (Pure CSS transitions, zero lag) */}
      <CartDrawer />
      <WishlistDrawer />
      <CategoryDrawer />
      <SearchModal />

      {/* Global notifications */}
      <Toaster />
    </>
  );
}
