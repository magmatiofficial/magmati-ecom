'use client';

import React from 'react';
import Image from 'next/image';
import { 
  BarChart3, 
  Package, 
  RotateCcw, 
  Database, 
  Layers, 
  Ticket, 
  Users, 
  Palette, 
  Activity, 
  Key, 
  Menu, 
  Store, 
  LogOut 
} from 'lucide-react';
import { formatBDT } from '@/lib/formatCurrency';
import { useAccountState } from '@/hooks/useAccountState';

// Modular Admin Tab Components
import { StatsTab } from '@/components/admin/StatsTab';
import { OrdersTab } from '@/components/admin/OrdersTab';
import { ReturnsTab } from '@/components/admin/ReturnsTab';
import { ProductsTab } from '@/components/admin/ProductsTab';
import { CategoriesTab } from '@/components/admin/CategoriesTab';
import { SettingsTab } from '@/components/admin/SettingsTab';
import { VouchersTab } from '@/components/admin/VouchersTab';
import { CustomersTab } from '@/components/admin/CustomersTab';
import { VisitorLogsTab } from '@/components/admin/VisitorLogsTab';
import { ServiceMonitoringTab } from '@/components/admin/NotificationsTab';
import { EnvVariablesControl } from '@/components/admin/EnvVariablesControl';
import { LogManager } from '@/lib/logManager';

// Modular Admin Modal Components
import { ProductModal } from '@/components/admin/modals/ProductModal';
import { VoucherModal } from '@/components/admin/modals/VoucherModal';
import { CustomerModal } from '@/components/admin/modals/CustomerModal';
import { SlideModal } from '@/components/admin/modals/SlideModal';
import { AdminOrderDetailsModal } from '@/components/admin/modals/AdminOrderDetailsModal';

interface AdminDashboardProps {
  state: ReturnType<typeof useAccountState>;
}

export function AdminDashboard({ state }: AdminDashboardProps) {
  const {
    currentUser,
    logoutUser,
    setIsAdminMode,
    orders,
    returnRequests,
    products,
    categories,
    vouchers,
    users,
    analytics,
    activeAdminTab,
    setActiveAdminTab,
    mobileNavOpen,
    setMobileNavOpen,
    selectedVisitorId,
    setSelectedVisitorId,
    confirmClearLogs,
    setConfirmClearLogs,
    deletingProfileId,
    setDeletingProfileId,
    adminCustomerSearch,
    setAdminCustomerSearch,
    adminCustomerRoleFilter,
    setAdminCustomerRoleFilter,
    adminOrderSearch,
    setAdminOrderSearch,
    adminOrderStatusFilter,
    setAdminOrderStatusFilter,
    selectedOrderDetails,
    setSelectedOrderDetails,
    productModalOpen,
    setProductModalOpen,
    editingProduct,
    prodName, setProdName,
    prodCategory, setProdCategory,
    prodSubcategory, setProdSubcategory,
    prodPrice, setProdPrice,
    prodOriginalPrice, setProdOriginalPrice,
    prodDescription, setProdDescription,
    prodImages, setProdImages,
    prodMedia, setProdMedia,
    prodPreviewGifUrl, setProdPreviewGifUrl,
    prodVideoUrl, setProdVideoUrl,
    prodMainImageIndex, setProdMainImageIndex,
    prodLowStockThreshold, setProdLowStockThreshold,
    prodSku, setProdSku,
    prodInStock, setProdInStock,
    prodStockQuantity, setProdStockQuantity,
    prodBrand, setProdBrand,
    prodSizes, setProdSizes,
    prodIsFlashDeal, setProdIsFlashDeal,
    prodIsTrending, setProdIsTrending,
    prodIsBestDeal, setProdIsBestDeal,
    prodIsNew, setProdIsNew,
    prodIsBrandMall, setProdIsBrandMall,
    prodShowDiscountBadge, setProdShowDiscountBadge,
    prodShowFlashBadge, setProdShowFlashBadge,
    prodShowTrendingBadge, setProdShowTrendingBadge,
    prodShowMallBadge, setProdShowMallBadge,
    prodShowHotDealBadge, setProdShowHotDealBadge,
    prodShowNewBadge, setProdShowNewBadge,
    prodAllowedPaymentMethods, setProdAllowedPaymentMethods,
    prodBestDealSectionId, setProdBestDealSectionId,
    voucherModalOpen, setVoucherModalOpen,
    editingVoucher,
    vCode, setVCode,
    vMaxUsesPerCustomer, setVMaxUsesPerCustomer,
    vMaxDiscountSpendPerUser, setVMaxDiscountSpendPerUser,
    vTotalDiscountBudget, setVTotalDiscountBudget,
    vAutoRemoveDaysAfterExpiry, setVAutoRemoveDaysAfterExpiry,
    vTitleEn, setVTitleEn,
    vDiscountType, setVDiscountType,
    vDiscountValue, setVDiscountValue,
    vMinSpend, setVMinSpend,
    vMaxDiscount, setVMaxDiscount,
    vConditionEn, setVConditionEn,
    vBadgeEn, setVBadgeEn,
    vBgGradient, setVBgGradient,
    vPaymentMethod, setVPaymentMethod,
    vRequiresLogin, setVRequiresLogin,
    vApplicableCategory, setVApplicableCategory,
    vExpiresAt, setVExpiresAt,
    slideModalOpen, setSlideModalOpen,
    editingSlideId,
    slideTitleEn, setSlideTitleEn,
    slideSubtitleEn, setSlideSubtitleEn,
    slideBadgeEn, setSlideBadgeEn,
    slideImage, setSlideImage,
    slideBtnTextEn, setSlideBtnTextEn,
    slideBtnLink, setSlideBtnLink,
    customerModalOpen, setCustomerModalOpen,
    editingCustomer,
    custName, setCustName,
    custEmail, setCustEmail,
    custPhone, setCustPhone,
    custAddress, setCustAddress,
    custRole, setCustRole,
    customerFormError,
    siteSettings,
    statsMetrics,
    newCatName, setNewCatName,
    newCatImage, setNewCatImage,
    adminProductSearch, setAdminProductSearch,
    adminProductCat, setAdminProductCat,
    lowStockOnly, setLowStockOnly,
    resetMessage, setResetMessage,
    showResetConfirm, setShowResetConfirm,
    handleImageUpload,
    updateOrderStatus,
    deleteOrder,
    resetToDefault,
    openAddProductModal,
    openEditProductModal,
    duplicateProduct,
    deleteProduct,
    handleAddCategory,
    deleteCategory,
    handleUpdateCategory,
    openAddSlideModal,
    openEditSlideModal,
    openAddVoucherModal,
    openEditVoucherModal,
    toggleVoucherStatus,
    deleteVoucher,
    openAddCustomerModal,
    openEditCustomerModal,
    toggleUserRole,
    impersonateUser,
    reactivateUser,
    suspendUser,
    deleteUser,
    accountToast,
    setAccountToast,
    handleProductFormSubmit,
    handleCustomerFormSubmit,
    handleSlideFormSubmit,
    addVoucher,
    updateVoucher,
  } = state;

  if (!currentUser) return null;

  const adminNavItems = [
    { id: 'stats' as const, label: 'Analytics & Sales', icon: BarChart3, badge: null },
    { id: 'orders' as const, label: 'Orders Dispatch Queue', icon: Package, badge: orders.length },
    { id: 'returns' as const, label: 'Returns & Refund Requests', icon: RotateCcw, badge: returnRequests.length },
    { id: 'products' as const, label: 'Inventory & Products', icon: Database, badge: products.length },
    { id: 'categories' as const, label: 'Store Categories', icon: Layers, badge: categories.length },
    { id: 'vouchers' as const, label: 'Vouchers & Promo Codes', icon: Ticket, badge: vouchers.length },
    { id: 'customers' as const, label: 'Customers & Users', icon: Users, badge: users.length },
    { id: 'settings' as const, label: 'Storefront & UI Customization', icon: Palette, badge: 'CONTROL' },
    { id: 'service-monitoring' as const, label: 'Service Monitoring', icon: Activity, badge: null },
    { id: 'env-keys' as const, label: '.env Keys & System Config', icon: Key, badge: 'LIVE' },
    { id: 'visitor-logs' as const, label: 'Live Visitor Logs', icon: Activity, badge: Object.keys(analytics.profiles || {}).length },
  ];

  return (
    <div className="min-h-screen bg-surface-subtle/70 text-text-main font-sans pb-3 sm:pb-4">
      <header className="bg-secondary text-white border-b border-border-dark sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors flex items-center justify-center shrink-0 border border-zinc-700 cursor-pointer lg:hidden"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0 border border-red-400/40">
                M
              </div>
              <div className="min-w-0 flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-sm tracking-wider text-white uppercase">
                  MAGMATI
                </span>
                <span className="px-1.5 py-0.5 bg-red-950 text-brand-gold text-2xs font-black rounded uppercase tracking-wider border border-red-900 shadow-xs shrink-0">
                  HQ
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsAdminMode(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white text-xs font-bold transition-all border border-zinc-700 shrink-0 cursor-pointer shadow-xs active:scale-95"
              title={'Back to Storefront'}
            >
              <Store className="w-4 h-4 text-brand-gold shrink-0" />
              <span>{'Back to Store'}</span>
            </button>

            <button
              type="button"
              onClick={logoutUser}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-950/70 hover:bg-primary text-red-200 hover:text-white text-xs font-bold transition-all border border-red-900/60 hover:border-primary shrink-0 cursor-pointer shadow-xs active:scale-95"
              title={'Sign Out'}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{'Sign Out'}</span>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`pure-drawer-backdrop lg:hidden ${mobileNavOpen ? 'is-open' : ''}`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden={!mobileNavOpen}
      />

      <aside
        className={`pure-drawer-panel drawer-left admin-dark-drawer flex flex-col lg:hidden ${
          mobileNavOpen ? 'is-open' : ''
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Admin Navigation Drawer"
      >
        <div className="p-4 sm:p-5 border-b border-border-color/60 flex items-center justify-between bg-white text-text-main">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-primary text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0 border border-red-400/20">
              {currentUser.avatarUrl ? (
                <Image 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name ? `${currentUser.name}'s administrator avatar` : "Store administrator profile avatar"} 
                  fill 
                  sizes="36px" 
                  className="object-cover" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                currentUser.avatarLetter
              )}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-text-main truncate block">{currentUser.name}</span>
              <span className="text-2xs text-text-muted font-mono tracking-tight block">Administrator Portal</span>
            </div>
          </div>
          <button type="button" onClick={() => setMobileNavOpen(false)} className="p-1 text-text-muted hover:text-text-main cursor-pointer">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-zinc-950 text-white font-semibold">
          {adminNavItems.map((item) => {
            const ItemIcon = item.icon;
            const isActive = activeAdminTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveAdminTab(item.id);
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-2.5 text-left rounded-xl transition-all duration-150 cursor-pointer group relative overflow-hidden ${
                  isActive
                    ? 'bg-primary text-white font-bold'
                    : 'hover:bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <div
                  className={`w-9.5 h-9.5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'bg-surface-subtle text-text-muted border border-border-color/60 group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/20'
                  }`}
                >
                  <ItemIcon className="w-4.5 h-4.5 shrink-0" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs truncate">{item.label}</span>
                    {item.badge !== null && (
                      <span className={`text-2xs px-1.5 py-0.5 rounded-md font-bold font-mono shrink-0 ${isActive ? 'bg-white text-primary' : 'bg-zinc-800 text-zinc-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="hidden lg:block lg:col-span-3 sticky top-20 space-y-4">
            <div className="bg-white text-text-main rounded-2xl p-4 border border-border-color/90 shadow-sm overflow-hidden relative">
              <div className="flex items-center gap-3 pb-3 mb-3 border-b border-border-color/60">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-primary text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0 border border-red-400/20">
                  {currentUser.avatarUrl ? (
                    <Image 
                      src={currentUser.avatarUrl} 
                      alt={currentUser.name ? `${currentUser.name}'s administrator avatar` : "Store administrator profile avatar"} 
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
                  <h2 className="font-bold text-xs text-text-main truncate">{currentUser.name}</h2>
                  <span className="text-2xs text-text-muted font-bold block mt-0.5">magmati.com Admin</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="bg-surface-subtle/50 rounded-lg p-1.5 border border-border-color/60">
                  <span className="text-2xs text-text-muted uppercase block">Sales</span>
                  <span className="text-2xs font-extrabold text-primary font-mono truncate block">
                    {formatBDT(statsMetrics.totalSales)}
                  </span>
                </div>
                <div className="bg-surface-subtle/50 rounded-lg p-1.5 border border-border-color/60">
                  <span className="text-2xs text-text-muted uppercase block">Orders</span>
                  <span className="text-2xs font-extrabold text-text-main font-mono block">{statsMetrics.totalOrders}</span>
                </div>
                <div className="bg-surface-subtle/50 rounded-lg p-1.5 border border-border-color/60">
                  <span className="text-2xs text-text-muted uppercase block">Products</span>
                  <span className="text-2xs font-extrabold text-text-main font-mono block">{statsMetrics.activeProductsCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-color/90 p-2.5 shadow-sm space-y-1">
              {adminNavItems.map((item) => {
                const ItemIcon = item.icon;
                const isActive = activeAdminTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveAdminTab(item.id)}
                    className={`w-full flex items-center gap-3 p-2 text-left rounded-xl transition-all duration-200 cursor-pointer group relative overflow-hidden ${
                      isActive
                        ? 'bg-zinc-950 text-white font-bold border border-zinc-950 shadow-xs'
                        : 'bg-white hover:bg-surface-subtle text-text-main hover:text-black border border-transparent'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-surface-subtle text-text-muted border border-border-color/60 group-hover:text-primary group-hover:bg-primary/10'
                      }`}
                    >
                      <ItemIcon className="w-4 h-4 shrink-0" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`font-bold text-xs truncate ${isActive ? 'text-white' : 'text-text-main'}`}>{item.label}</span>
                        {item.badge !== null && (
                          <span className={`text-2xs px-1.5 py-0.2 rounded-md font-bold shrink-0 font-mono ${isActive ? 'bg-primary text-white' : 'bg-surface-subtle text-text-muted border border-border-color/70'}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="lg:col-span-9 w-full space-y-4">
            {activeAdminTab === 'stats' && (
              <StatsTab
                orders={orders}
                products={products}
                users={users}
                formatBDT={formatBDT}
                setActiveAdminTab={setActiveAdminTab}
              />
            )}

            {activeAdminTab === 'orders' && (
              <OrdersTab
                orders={orders}
                adminOrderSearch={adminOrderSearch}
                setAdminOrderSearch={setAdminOrderSearch}
                adminOrderStatusFilter={adminOrderStatusFilter}
                setAdminOrderStatusFilter={setAdminOrderStatusFilter}
                formatBDT={formatBDT}
                updateOrderStatus={updateOrderStatus}
                setSelectedOrderDetails={setSelectedOrderDetails}
                deleteOrder={deleteOrder}
              />
            )}

            {activeAdminTab === 'returns' && (
              <ReturnsTab />
            )}

            {activeAdminTab === 'products' && (
              <ProductsTab
                products={products}
                adminProductSearch={adminProductSearch}
                setAdminProductSearch={setAdminProductSearch}
                adminProductCat={adminProductCat}
                setAdminProductCat={setAdminProductCat}
                lowStockOnly={lowStockOnly}
                setLowStockOnly={setLowStockOnly}
                siteSettings={siteSettings}
                resetToDefault={resetToDefault}
                openAddProductModal={openAddProductModal}
                openEditProductModal={openEditProductModal}
                duplicateProduct={duplicateProduct}
                deleteProduct={deleteProduct}
              />
            )}

            {activeAdminTab === 'categories' && (
              <CategoriesTab
                categories={categories}
                newCatName={newCatName}
                setNewCatName={setNewCatName}
                newCatImage={newCatImage}
                setNewCatImage={setNewCatImage}
                handleAddCategory={handleAddCategory}
                handleImageUpload={handleImageUpload}
                products={products}
                deleteCategory={deleteCategory}
                updateCategory={handleUpdateCategory}
              />
            )}

            {activeAdminTab === 'settings' && (
              <SettingsTab
                siteSettings={siteSettings as any}
                openAddSlideModal={openAddSlideModal}
                openEditSlideModal={openEditSlideModal}
                handleImageUpload={handleImageUpload}
                resetMessage={resetMessage}
                setResetMessage={setResetMessage}
                showResetConfirm={showResetConfirm}
                setShowResetConfirm={setShowResetConfirm}
              />
            )}

            {activeAdminTab === 'service-monitoring' && (
              <ServiceMonitoringTab />
            )}

            {activeAdminTab === 'env-keys' && (
              <EnvVariablesControl />
            )}

            {activeAdminTab === 'vouchers' && (
              <VouchersTab
                vouchers={vouchers}
                openAddVoucherModal={openAddVoucherModal}
                openEditVoucherModal={openEditVoucherModal}
                toggleVoucherStatus={toggleVoucherStatus}
                deleteVoucher={deleteVoucher}
              />
            )}

            {activeAdminTab === 'customers' && (
              <CustomersTab
                users={users}
                orders={orders}
                adminCustomerSearch={adminCustomerSearch}
                setAdminCustomerSearch={setAdminCustomerSearch}
                adminCustomerRoleFilter={adminCustomerRoleFilter}
                setAdminCustomerRoleFilter={setAdminCustomerRoleFilter}
                openAddCustomerModal={openAddCustomerModal}
                currentUser={currentUser}
                toggleUserRole={toggleUserRole}
                impersonateUser={impersonateUser}
                openEditCustomerModal={openEditCustomerModal}
                reactivateUser={reactivateUser}
                suspendUser={suspendUser}
                deleteUser={deleteUser}
                formatBDT={formatBDT}
              />
            )}

            {activeAdminTab === 'visitor-logs' && (
              <VisitorLogsTab
                selectedVisitorId={selectedVisitorId}
                setSelectedVisitorId={setSelectedVisitorId}
                analytics={analytics}
                LogManager={LogManager}
                confirmClearLogs={confirmClearLogs}
                setConfirmClearLogs={setConfirmClearLogs}
                deletingProfileId={deletingProfileId}
                setDeletingProfileId={setDeletingProfileId}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modals for Admin HQ Workspace */}
      {productModalOpen && (
        <ProductModal
          isOpen={productModalOpen}
          onClose={() => setProductModalOpen(false)}
          editingProduct={editingProduct}
          prodName={prodName} setProdName={setProdName}
          prodCategory={prodCategory} setProdCategory={setProdCategory}
          prodSubcategory={prodSubcategory} setProdSubcategory={setProdSubcategory}
          prodPrice={prodPrice} setProdPrice={setProdPrice}
          prodOriginalPrice={prodOriginalPrice} setProdOriginalPrice={setProdOriginalPrice}
          prodDescription={prodDescription} setProdDescription={setProdDescription}
          prodImages={prodImages} setProdImages={setProdImages}
          prodMedia={prodMedia} setProdMedia={setProdMedia}
          prodPreviewGifUrl={prodPreviewGifUrl} setProdPreviewGifUrl={setProdPreviewGifUrl}
          prodVideoUrl={prodVideoUrl} setProdVideoUrl={setProdVideoUrl}
          prodMainImageIndex={prodMainImageIndex} setProdMainImageIndex={setProdMainImageIndex}
          prodLowStockThreshold={prodLowStockThreshold} setProdLowStockThreshold={setProdLowStockThreshold}
          prodSku={prodSku} setProdSku={setProdSku}
          prodInStock={prodInStock} setProdInStock={setProdInStock}
          prodStockQuantity={prodStockQuantity} setProdStockQuantity={setProdStockQuantity}
          prodBrand={prodBrand} setProdBrand={setProdBrand}
          prodSizes={prodSizes} setProdSizes={setProdSizes}
          prodIsFlashDeal={prodIsFlashDeal} setProdIsFlashDeal={setProdIsFlashDeal}
          prodIsTrending={prodIsTrending} setProdIsTrending={setProdIsTrending}
          prodIsBestDeal={prodIsBestDeal} setProdIsBestDeal={setProdIsBestDeal}
          prodIsNew={prodIsNew} setProdIsNew={setProdIsNew}
          prodIsBrandMall={prodIsBrandMall} setProdIsBrandMall={setProdIsBrandMall}
          prodShowDiscountBadge={prodShowDiscountBadge} setProdShowDiscountBadge={setProdShowDiscountBadge}
          prodShowFlashBadge={prodShowFlashBadge} setProdShowFlashBadge={setProdShowFlashBadge}
          prodShowTrendingBadge={prodShowTrendingBadge} setProdShowTrendingBadge={setProdShowTrendingBadge}
          prodShowMallBadge={prodShowMallBadge} setProdShowMallBadge={setProdShowMallBadge}
          prodShowHotDealBadge={prodShowHotDealBadge} setProdShowHotDealBadge={setProdShowHotDealBadge}
          prodShowNewBadge={prodShowNewBadge} setProdShowNewBadge={setProdShowNewBadge}
          prodAllowedPaymentMethods={prodAllowedPaymentMethods} setProdAllowedPaymentMethods={setProdAllowedPaymentMethods}
          prodBestDealSectionId={prodBestDealSectionId} setProdBestDealSectionId={setProdBestDealSectionId}
          siteSettings={siteSettings}
          handleImageUpload={handleImageUpload}
          handleSubmit={handleProductFormSubmit}
          onSubmit={handleProductFormSubmit}
        />
      )}

      {voucherModalOpen && (
        <VoucherModal
          isOpen={voucherModalOpen}
          onClose={() => setVoucherModalOpen(false)}
          editingVoucher={editingVoucher}
          categories={categories}
          vCode={vCode} setVCode={setVCode}
          vMaxUsesPerCustomer={vMaxUsesPerCustomer} setVMaxUsesPerCustomer={setVMaxUsesPerCustomer}
          vMaxDiscountSpendPerUser={vMaxDiscountSpendPerUser} setVMaxDiscountSpendPerUser={setVMaxDiscountSpendPerUser}
          vTotalDiscountBudget={vTotalDiscountBudget} setVTotalDiscountBudget={setVTotalDiscountBudget}
          vAutoRemoveDaysAfterExpiry={vAutoRemoveDaysAfterExpiry} setVAutoRemoveDaysAfterExpiry={setVAutoRemoveDaysAfterExpiry}
          vTitle={vTitleEn} setVTitle={setVTitleEn}
          vTitleEn={vTitleEn} setVTitleEn={setVTitleEn}
          vDiscountType={vDiscountType} setVDiscountType={setVDiscountType}
          vDiscountValue={vDiscountValue} setVDiscountValue={setVDiscountValue}
          vMinSpend={vMinSpend} setVMinSpend={setVMinSpend}
          vMaxDiscount={vMaxDiscount} setVMaxDiscount={setVMaxDiscount}
          vCondition={vConditionEn} setVCondition={setVConditionEn}
          vConditionEn={vConditionEn} setVConditionEn={setVConditionEn}
          vBadge={vBadgeEn} setVBadge={setVBadgeEn}
          vBadgeEn={vBadgeEn} setVBadgeEn={setVBadgeEn}
          vBgGradient={vBgGradient} setVBgGradient={setVBgGradient}
          vPaymentMethod={vPaymentMethod} setVPaymentMethod={setVPaymentMethod}
          vRequiresLogin={vRequiresLogin} setVRequiresLogin={setVRequiresLogin}
          vApplicableCategory={vApplicableCategory} setVApplicableCategory={setVApplicableCategory}
          vExpiresAt={vExpiresAt} setVExpiresAt={setVExpiresAt}
          onSubmit={(e) => {
            e.preventDefault();
            const payload = {
              code: vCode.toUpperCase().trim(),
              title: vTitleEn,
              titleEn: vTitleEn,
              discountType: vDiscountType,
              discountValue: Number(vDiscountValue),
              minSpend: Number(vMinSpend) || 0,
              maxDiscount: vDiscountType === 'percentage' && vMaxDiscount ? Number(vMaxDiscount) : undefined,
              maxUsesPerCustomer: Number(vMaxUsesPerCustomer) || 1,
              maxDiscountSpendPerUser: vMaxDiscountSpendPerUser ? Number(vMaxDiscountSpendPerUser) : undefined,
              totalDiscountBudget: vTotalDiscountBudget ? Number(vTotalDiscountBudget) : undefined,
              autoRemoveDaysAfterExpiry: Number(vAutoRemoveDaysAfterExpiry) || 0,
              condition: vConditionEn,
              conditionEn: vConditionEn,
              badge: vBadgeEn,
              badgeEn: vBadgeEn,
              isActive: true,
              bgGradient: vBgGradient,
              paymentMethod: vPaymentMethod,
              requiresLogin: vRequiresLogin,
              applicableCategory: vApplicableCategory,
              expiresAt: vExpiresAt || undefined,
            };
            if (editingVoucher) {
              updateVoucher(editingVoucher.id, payload);
            } else {
              addVoucher(payload);
            }
            setVoucherModalOpen(false);
          }}
          handleSubmit={(e) => {
            e.preventDefault();
            const payload = {
              code: vCode.toUpperCase().trim(),
              title: vTitleEn,
              titleEn: vTitleEn,
              discountType: vDiscountType,
              discountValue: Number(vDiscountValue),
              minSpend: Number(vMinSpend) || 0,
              maxDiscount: vDiscountType === 'percentage' && vMaxDiscount ? Number(vMaxDiscount) : undefined,
              maxUsesPerCustomer: Number(vMaxUsesPerCustomer) || 1,
              maxDiscountSpendPerUser: vMaxDiscountSpendPerUser ? Number(vMaxDiscountSpendPerUser) : undefined,
              totalDiscountBudget: vTotalDiscountBudget ? Number(vTotalDiscountBudget) : undefined,
              autoRemoveDaysAfterExpiry: Number(vAutoRemoveDaysAfterExpiry) || 0,
              condition: vConditionEn,
              conditionEn: vConditionEn,
              badge: vBadgeEn,
              badgeEn: vBadgeEn,
              isActive: true,
              bgGradient: vBgGradient,
              paymentMethod: vPaymentMethod,
              requiresLogin: vRequiresLogin,
              applicableCategory: vApplicableCategory,
              expiresAt: vExpiresAt || undefined,
            };
            if (editingVoucher) {
              updateVoucher(editingVoucher.id, payload);
            } else {
              addVoucher(payload);
            }
            setVoucherModalOpen(false);
          }}
        />
      )}

      {slideModalOpen && (
        <SlideModal
          isOpen={slideModalOpen}
          onClose={() => setSlideModalOpen(false)}
          editingSlideId={editingSlideId}
          slideTitleEn={slideTitleEn} setSlideTitleEn={setSlideTitleEn}
          slideSubtitleEn={slideSubtitleEn} setSlideSubtitleEn={setSlideSubtitleEn}
          slideBadgeEn={slideBadgeEn} setSlideBadgeEn={setSlideBadgeEn}
          slideImage={slideImage} setSlideImage={setSlideImage}
          slideBtnTextEn={slideBtnTextEn} setSlideBtnTextEn={setSlideBtnTextEn}
          slideBtnLink={slideBtnLink} setSlideBtnLink={setSlideBtnLink}
          handleImageUpload={handleImageUpload}
          handleSubmit={handleSlideFormSubmit}
        />
      )}

      {customerModalOpen && (
        <CustomerModal
          isOpen={customerModalOpen}
          onClose={() => setCustomerModalOpen(false)}
          editingCustomer={editingCustomer}
          custName={custName} setCustName={setCustName}
          custEmail={custEmail} setCustEmail={setCustEmail}
          custPhone={custPhone} setCustPhone={setCustPhone}
          custAddress={custAddress} setCustAddress={setCustAddress}
          custRole={custRole} setCustRole={setCustRole}
          customerFormError={customerFormError}
          handleSubmit={handleCustomerFormSubmit}
        />
      )}

      {selectedOrderDetails && (() => {
        const latestOrder = orders.find((o) => o.id === selectedOrderDetails.id) || selectedOrderDetails;
        return (
          <AdminOrderDetailsModal
            order={latestOrder}
            onClose={() => setSelectedOrderDetails(null)}
            formatBDT={formatBDT}
            updateOrderStatus={updateOrderStatus}
          />
        );
      })()}

      {/* Account Action Notification Toast */}
      {accountToast && (
        <div className="fixed bottom-6 right-6 z-[200] max-w-sm p-4 bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
            ℹ
          </div>
          <div className="space-y-1 select-none flex-1">
            <h4 className="font-extrabold text-xs tracking-wider uppercase text-zinc-300 font-sans">Notification</h4>
            <p className="text-2xs sm:text-xs text-zinc-400 leading-normal font-medium font-sans">{accountToast}</p>
          </div>
          <button
            type="button"
            onClick={() => setAccountToast('')}
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer text-xs p-0.5 shrink-0"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
