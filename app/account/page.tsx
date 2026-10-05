/**
 * @file app/account/page.tsx
 * @description Customer Dashboard, Admin HQ Panel, and Auth Shell.
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  User as UserIcon, 
  Package, 
  Heart, 
  MapPin, 
  Settings, 
  Ticket, 
  Menu,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { formatBDT } from '@/lib/formatCurrency';
import { useAccountState } from '@/hooks/useAccountState';

// Modular Components
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { CustomerAuthSection } from '@/components/auth/CustomerAuthSection';
import { CustomerOrdersTab } from '@/components/customer/CustomerOrdersTab';
import { CustomerWishlistTab } from '@/components/customer/CustomerWishlistTab';
import { CustomerVouchersTab } from '@/components/customer/CustomerVouchersTab';
import { CustomerAddressesTab } from '@/components/customer/CustomerAddressesTab';
import { CustomerProfileTab } from '@/components/customer/CustomerProfileTab';
import { CustomerSettingsTab } from '@/components/customer/CustomerSettingsTab';

export default function AccountPage() {
  const router = useRouter();
  const state = useAccountState();

  const {
    wishlistItems,
    removeWishlistItem,
    addToCart,
    currentUser,
    myOrders,
    getVisibleVouchers,
    userClaimedCodes,
    claimVoucher,
    isAdminMode,
    setIsAdminMode,
    activeTab,
    setActiveTab,
    wishlistViewMode,
    setWishlistViewMode,
    expandedUserOrderId,
    setExpandedUserOrderId,
    mobileNavOpen,
    setMobileNavOpen,
    copiedVoucherCode,
    setCopiedVoucherCode,
    authMode, setAuthMode,
    loginEmail, setLoginEmail,
    loginPassword, setLoginPassword,
    registerName, setRegisterName,
    registerEmail, setRegisterEmail,
    registerPhone, setRegisterPhone,
    registerAddress, setRegisterAddress,
    registerPassword, setRegisterPassword,
    authError, setAuthError,
    showLoginPassword, setShowLoginPassword,
    showRegisterPassword, setShowRegisterPassword,
    rememberMe, setRememberMe,
    isSubmittingAuth,
    isGoogleLoading,
    showForgotPasswordModal, setShowForgotPasswordModal,
    forgotPasswordEmail, setForgotPasswordEmail,
    forgotPasswordSent, setForgotPasswordSent,
    profileName, setProfileName,
    profilePhone, setProfilePhone,
    profileAddress, setProfileAddress,
    profileAvatarUrl, setProfileAvatarUrl,
    savedSuccess, setSavedSuccess,
    handleImageUpload,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleGoogleSignIn,
    handleSaveProfile,
    logoutUser,
  } = state;

  const handleSignOut = () => {
    setIsAdminMode(false);
    logoutUser();
    router.replace('/account');
  };

  if (!currentUser) {
    return (
      <CustomerAuthSection
        authMode={authMode}
        setAuthMode={setAuthMode}
        authError={authError}
        setAuthError={setAuthError}
        isGoogleLoading={isGoogleLoading}
        isSubmittingAuth={isSubmittingAuth}
        handleGoogleSignIn={handleGoogleSignIn}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        showLoginPassword={showLoginPassword}
        setShowLoginPassword={setShowLoginPassword}
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
        handleLoginSubmit={handleLoginSubmit}
        registerName={registerName}
        setRegisterName={setRegisterName}
        registerEmail={registerEmail}
        setRegisterEmail={setRegisterEmail}
        registerPassword={registerPassword}
        setRegisterPassword={setRegisterPassword}
        showRegisterPassword={showRegisterPassword}
        setShowRegisterPassword={setShowRegisterPassword}
        registerPhone={registerPhone}
        setRegisterPhone={setRegisterPhone}
        registerAddress={registerAddress}
        setRegisterAddress={setRegisterAddress}
        handleRegisterSubmit={handleRegisterSubmit}
        showForgotPasswordModal={showForgotPasswordModal}
        setShowForgotPasswordModal={setShowForgotPasswordModal}
        forgotPasswordEmail={forgotPasswordEmail}
        setForgotPasswordEmail={setForgotPasswordEmail}
        forgotPasswordSent={forgotPasswordSent}
        setForgotPasswordSent={setForgotPasswordSent}
      />
    );
  }

  // Admin Mode Dashboard
  if (currentUser.role === 'admin' && isAdminMode) {
    return <AdminDashboard state={state} />;
  }

  const userNavItems = [
    { id: 'orders' as const, label: 'My Orders', icon: Package, badge: myOrders.length },
    { id: 'wishlist' as const, label: 'Wishlist & Saved', icon: Heart, badge: wishlistItems.length },
    { id: 'vouchers' as const, label: 'Discount Vouchers', icon: Ticket, badge: getVisibleVouchers().length },
    { id: 'addresses' as const, label: 'Saved Addresses', icon: MapPin, badge: null },
    { id: 'profile' as const, label: 'Account Profile', icon: UserIcon, badge: null },
    { id: 'settings' as const, label: 'Preferences & Security', icon: Settings, badge: null },
  ];

  return (
    <div className="min-h-screen bg-app-bg pb-12 sm:pb-16 font-sans">
      {/* Mobile Drawer Backdrop */}
      <div
        className={`pure-drawer-backdrop lg:hidden ${mobileNavOpen ? 'is-open' : ''}`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden={!mobileNavOpen}
      />

      {/* Mobile Side Drawer Navigation */}
      <aside
        className={`pure-drawer-panel drawer-left flex flex-col lg:hidden ${mobileNavOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-label="Account Navigation"
      >
        <div className="p-4 sm:p-5 border-b border-border-color/80 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary text-white font-black text-sm flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
              {currentUser.avatarUrl ? (
                <Image 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name ? `${currentUser.name}'s profile avatar` : "User profile avatar"} 
                  fill 
                  sizes="40px" 
                  className="object-cover" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                currentUser.avatarLetter
              )}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm text-text-main truncate block">{currentUser.name}</span>
              <span className="text-2xs text-text-muted font-mono truncate block">{currentUser.email}</span>
            </div>
          </div>
          <button type="button" onClick={() => setMobileNavOpen(false)} className="p-1 text-text-muted hover:text-text-main cursor-pointer">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-white">
          {currentUser.role === 'admin' && (
            <button
              type="button"
              onClick={() => {
                setIsAdminMode(true);
                setMobileNavOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 text-left rounded-xl transition-all duration-150 cursor-pointer bg-zinc-950 text-white hover:bg-zinc-900 font-bold shadow-xs mb-2 border border-zinc-800"
            >
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs truncate">Admin Dashboard</span>
                  <span className="text-2xs px-2 py-0.5 rounded-full bg-primary text-white font-mono font-bold shrink-0">
                    HQ
                  </span>
                </div>
              </div>
            </button>
          )}

          {userNavItems.map((item) => {
            const ItemIcon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 text-left rounded-xl transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'hover:bg-surface-subtle text-text-main'
                }`}
              >
                <ItemIcon className="w-4 h-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs truncate">{item.label}</span>
                    {item.badge !== null && (
                      <span className={`text-2xs px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${isActive ? 'bg-white text-primary' : 'bg-surface-subtle text-text-muted'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          <button
            id="btn-customer-signout-mobile"
            type="button"
            onClick={() => {
              setMobileNavOpen(false);
              handleSignOut();
            }}
            aria-label="Sign Out"
            title="Sign Out"
            className="w-full flex items-center gap-3 p-3 text-left rounded-xl transition-all duration-150 cursor-pointer bg-red-50 text-red-600 font-bold hover:bg-red-100 mt-2.5 active:scale-95"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs truncate">Sign Out</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Layout Shell */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="lg:hidden mb-4">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-border-color/80 shadow-2xs font-bold text-xs text-text-main cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Menu className="w-4 h-4 text-primary" />
              <span>Menu: {userNavItems.find(i => i.id === activeTab)?.label}</span>
            </div>
            <span className="text-2xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Change Tab</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Desktop Navigation Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4">
            <div className="bg-white text-text-main rounded-2xl p-5 border border-border-color/90 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary text-white font-black text-lg flex items-center justify-center shadow-md border border-white/40 shrink-0">
                  {currentUser.avatarUrl ? (
                    <Image 
                      src={currentUser.avatarUrl} 
                      alt={currentUser.name ? `${currentUser.name}'s profile avatar` : "User profile avatar"} 
                      fill 
                      sizes="48px" 
                      className="object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    currentUser.avatarLetter
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-base text-text-main truncate">{currentUser.name}</h2>
                  <p className="text-xs text-text-muted truncate mt-0.5">{currentUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-100">
                <div className="bg-surface-subtle/50 rounded-xl p-2 text-center border border-zinc-100 shadow-xs">
                  <span className="text-2xs text-text-subtle uppercase font-bold block">Orders</span>
                  <span className="text-sm font-bold text-text-main">{myOrders.length}</span>
                </div>
                <div className="bg-surface-subtle/50 rounded-xl p-2 text-center border border-zinc-100 shadow-xs">
                  <span className="text-2xs text-text-subtle uppercase font-bold block">Wishlist</span>
                  <span className="text-sm font-bold text-text-main">{wishlistItems.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-color/90 p-3 shadow-xs space-y-1.5">
              <div className="text-2xs font-bold text-text-subtle uppercase tracking-widest px-3 py-1.5">
                Account Menu
              </div>

              {currentUser.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => setIsAdminMode(true)}
                  className="w-full flex items-center gap-3 p-2.5 text-left transition-all duration-200 cursor-pointer rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 border border-zinc-800 shadow-xs mb-1.5 group"
                >
                  <div className="w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 bg-primary/20 text-primary border border-primary/30 group-hover:bg-primary group-hover:text-white transition-colors">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-white truncate">
                        Admin Dashboard
                      </span>
                      <span className="text-2xs px-1.5 py-0.5 rounded-full bg-primary text-white font-black uppercase tracking-wider shrink-0">
                        HQ
                      </span>
                    </div>
                  </div>
                </button>
              )}

              {userNavItems.map((item) => {
                const ItemIcon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 p-2.5 text-left transition-all duration-200 cursor-pointer rounded-xl ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/20 border border-primary font-bold'
                        : 'bg-white hover:bg-surface-subtle text-text-main border border-border-color/70 hover:border-border-hover'
                    }`}
                  >
                    <div
                      className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'bg-surface-subtle/90 text-text-muted group-hover:text-primary group-hover:bg-primary/10 border border-border-color/80'
                      }`}
                    >
                      <ItemIcon className="w-4 h-4 shrink-0" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`font-bold text-xs truncate ${isActive ? 'text-white' : 'text-text-main'}`}>
                          {item.label}
                        </span>
                        {item.badge !== null && (
                          <span
                            className={`text-2xs px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                              isActive
                                ? 'bg-white text-primary font-black shadow-xs'
                                : 'bg-surface-subtle text-text-muted border border-border-color/80'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              <button
                id="btn-customer-signout"
                type="button"
                onClick={handleSignOut}
                aria-label="Sign Out"
                title="Sign Out"
                className="w-full flex items-center gap-3 p-2.5 text-left transition-all duration-200 cursor-pointer rounded-xl bg-red-50/50 hover:bg-red-100/50 text-red-600 hover:text-red-700 border border-red-100 hover:border-red-200 mt-2 active:scale-95 group"
              >
                <div className="w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 bg-red-100/80 text-red-600 border border-red-200/50 group-hover:bg-red-200 transition-colors">
                  <LogOut className="w-4 h-4 shrink-0" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-xs truncate">Sign Out</span>
                </div>
              </button>
            </div>
          </aside>

          {/* Active Tab Container */}
          <main className="lg:col-span-9 space-y-4">
            {activeTab === 'orders' && (
              <CustomerOrdersTab
                myOrders={myOrders}
                formatBDT={formatBDT}
                expandedUserOrderId={expandedUserOrderId}
                setExpandedUserOrderId={setExpandedUserOrderId}
              />
            )}

            {activeTab === 'wishlist' && (
              <CustomerWishlistTab
                wishlistItems={wishlistItems}
                formatBDT={formatBDT}
                wishlistViewMode={wishlistViewMode}
                setWishlistViewMode={setWishlistViewMode}
                addToCart={addToCart}
                removeWishlistItem={removeWishlistItem}
              />
            )}

            {activeTab === 'vouchers' && (
              <CustomerVouchersTab
                vouchers={getVisibleVouchers()}
                userClaimedCodes={userClaimedCodes}
                copiedVoucherCode={copiedVoucherCode}
                setCopiedVoucherCode={setCopiedVoucherCode}
                claimVoucher={claimVoucher}
                currentUserEmail={currentUser.email || ''}
              />
            )}

            {activeTab === 'addresses' && (
              <CustomerAddressesTab
                currentUser={currentUser}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'profile' && (
              <CustomerProfileTab
                currentUser={currentUser}
                profileName={profileName}
                setProfileName={setProfileName}
                profilePhone={profilePhone}
                setProfilePhone={setProfilePhone}
                profileAddress={profileAddress}
                setProfileAddress={setProfileAddress}
                profileAvatarUrl={profileAvatarUrl}
                setProfileAvatarUrl={setProfileAvatarUrl}
                handleImageUpload={handleImageUpload}
                handleSaveProfile={handleSaveProfile}
                savedSuccess={savedSuccess}
              />
            )}

            {activeTab === 'settings' && (
              <CustomerSettingsTab
                savedSuccess={savedSuccess}
                setSavedSuccess={setSavedSuccess}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
