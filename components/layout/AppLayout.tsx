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
import { auth } from '@/lib/firebase';
import { ShieldAlert, ArrowLeftRight } from 'lucide-react';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // Global Real-Time Firestore Product Catalog Sync
  useProductSync();

  const pathname = usePathname();
  const isAdminPanelActive = useUIStore((state) => state.isAdminPanelActive);
  const isAdminPage = pathname?.startsWith('/admin') || isAdminPanelActive;
  const isAccountPage = pathname?.startsWith('/account') || isAdminPage;

  const isCategoryDrawerOpen = useUIStore((state) => state.isCategoryDrawerOpen);
  const isSearchOpen = useUIStore((state) => state.isSearchOpen);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const cartError = useCartStore((state) => state.cartError);
  const setCartError = useCartStore((state) => state.setCartError);

  // Auto-dismiss cart error after 5 seconds
  useEffect(() => {
    if (cartError) {
      const t = setTimeout(() => {
        setCartError(null);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [cartError, setCartError]);
  const isWishlistOpen = useWishlistStore((state) => state.isWishlistOpen);

  const { currentUser, exitImpersonation, updateUserDetails } = useAuthStore();

  // Global Auth Sync: Authoritatively verify and sync user role from server whenever session refreshes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const syncUserRole = async () => {
      const fbUser = auth.currentUser;
      if (!fbUser || !currentUser) return;

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

  // Clean mock orders and conditionally subscribe to live Firestore orders for Admin or Account/Track routes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      useOrderStore.getState().clearMockOrders();
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
    <div className="flex flex-col min-h-dvh bg-app-bg">
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

      {/* Mobile Native Bottom Navigation Bar - Hidden on Admin Dashboard */}
      {!isAdminPage && <MobileBottomNav />}

      {/* Global Interactive Drawers & Modals (Pure CSS transitions, zero lag) */}
      <CartDrawer />
      <WishlistDrawer />
      <CategoryDrawer />
      <SearchModal />

      {/* Global Cart Error Floating Toast */}
      {cartError && (
        <div className="fixed bottom-6 right-6 z-[200] max-w-sm p-4 bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="w-5 h-5 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
            ✕
          </div>
          <div className="space-y-1 select-none flex-1">
            <h4 className="font-extrabold text-xs tracking-wider uppercase text-zinc-300">Cart Alert</h4>
            <p className="text-2xs sm:text-xs text-zinc-400 leading-normal font-medium">{cartError}</p>
          </div>
          <button
            type="button"
            onClick={() => setCartError(null)}
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer text-xs p-0.5 shrink-0 animate-in fade-in"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
