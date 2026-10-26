# MAGMATI – Premium E-Commerce Platform

> Bangladesh's premier fashion, gadgets, and lifestyle shopping destination with nationwide Cash on Delivery (COD) and Online Payment support in Bangladeshi Taka (৳ BDT).

---

## 🚀 Key Highlights & Features

- **Storefront & Catalog**:
  - Multi-category navigation (Men's, Women's, Kids, Gadgets, Home, Beauty, Premium Lifestyle).
  - Advanced search with debounce, price range filtering, brand filtering, size/color selectors, and sorting.
  - Flash Deals countdown timer, Best Deals spotlight, and Brand Mall showcase.
- **Cart, Wishlist & Checkout**:
  - Live drawer cart with dynamic BDT pricing calculation.
  - All 64 Districts of Bangladesh with automated standard delivery charges (Inside Dhaka ৳60, Outside Dhaka ৳120 / Free Shipping Threshold).
  - Multi-Payment Support: Cash on Delivery (COD), bKash, Nagad, SSLCOMMERZ / Debit/Credit Cards.
- **Tax Invoice & Print Engine**:
  - Instant direct browser printing via isolated sandboxed frame.
  - Real 2.5x high-resolution vector A4 PDF export using `jsPDF` & `html2canvas`.
  - Machine-scannable courier parcel barcode and complete tax breakdown.
- **Admin Control Center**:
  - **Orders Management**: Real-time status update (Pending, Confirmed, Shipped, Delivered, Cancelled), tracking numbers, and instant invoice printing.
  - **Product Catalog Management**: Create, edit, delete, duplicate, manage stock quantity, upload/paste images, and set flash sale tags.
  - **Data Transfer & Bulk Import**: Export orders/products to CSV and JSON; bulk product upload parser with validation.
  - **Site Settings & Visual Customization**: Dynamic theme color presets, border-radius controls, banner management, announcement marquee, and delivery fee controls.
  - **Visitor Analytics & Activity Logs**: Comprehensive user journey tracking, page view stats, and CSV/JSON log exports.
  - **Vouchers & Coupons**: Promo code manager with percentage/flat discounts, minimum spend, expiry date, and usage limits.
- **Persistence & Cloud Sync**:
  - Integrated Firebase Firestore database and LocalStorage fallback persistence.

---

## 📂 Project Architecture

```
├── app/                        # Next.js 15+ App Router
│   ├── account/               # Customer account & order history
│   ├── admin/                 # Admin dashboard & backoffice panel
│   ├── api/                   # Backend API proxy endpoints
│   ├── best-deals/            # Best deals curated page
│   ├── cart/                  # Dedicated checkout page
│   ├── category/              # Dynamic category catalog browser
│   ├── flash-deals/           # Timed flash sales page
│   ├── product/[id]/          # Product details page with image gallery
│   ├── shop/                  # Filterable master catalog
│   ├── track/                 # Courier parcel & order live tracking
│   ├── layout.tsx             # Root layout with fonts & providers
│   └── globals.css            # Tailwind CSS v4 design tokens
├── components/                 # Reusable UI & Business Components
│   ├── admin/                 # Admin tables, forms, modals & analytics
│   ├── auth/                  # Login, register & user profile modals
│   ├── cart/                  # Drawer cart, checkout forms
│   ├── home/                  # Hero carousel, promotional banners
│   ├── invoice/               # Production-ready Tax Invoice Modal
│   ├── layout/                # Navbar, Footer, Mobile Bottom Bar
│   ├── product/               # ProductCard, ProductGrid, QuickView
│   └── ui/                    # Base design system primitives
├── data/                       # Initial catalogs
│   └── products.ts            # Seed product catalog
├── lib/                        # Core Utilities & Services
│   ├── bangladeshDistricts.ts # All 64 BD districts & delivery zones
│   ├── dataTransferUtils.ts   # CSV/JSON export & bulk import parsers
│   ├── firebase.ts            # Firestore client & Auth SDK
│   ├── formatCurrency.ts      # BDT currency formatting (৳ symbol)
│   ├── invoicePrintUtils.ts   # Sandboxed direct print & PDF generator
│   ├── logManager.ts          # Central visitor analytics & log management
│   ├── theme.ts               # Color tokens & branding definitions
│   └── uiTheme.ts             # Border radius & dynamic style presets
├── store/                      # Zustand Global State Stores
│   ├── useAnalyticsStore.ts   # Realtime traffic & visitor profiles
│   ├── useAuthStore.ts        # Authentication & RBAC user state
│   ├── useCartStore.ts        # Shopping cart state & checkout items
│   ├── useOrderStore.ts       # Orders database & fulfillment actions
│   ├── useProductStore.ts     # Live product catalog CRUD store
│   ├── useSiteSettingsStore.ts# Storefront configurations & banners
│   ├── useVoucherStore.ts     # Promo codes & discount validations
│   └── useWishlistStore.ts    # Customer wishlist bookmarks
└── types/                      # TypeScript definitions & interfaces
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Code Linting & Typecheck
```bash
npm run lint
```

### 4. Build for Production
```bash
npm run build
```

---

## 📖 Developer Documentation
- [Firebase Setup Guide (Bengali)](./FIREBASE_SETUP_GUIDE.md) - Complete instructions for Firestore, Authentication, and Hosting.
- [Developer Guide (English)](./DEVELOPER.md) - Comprehensive developer documentation, database schemas, and contribution instructions.
