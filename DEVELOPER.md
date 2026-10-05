# 🛠️ MAGMATI – Master Developer & Engineering Guide

Welcome! This project is a full-stack e-commerce platform built with **Next.js 15+ (App Router)**, **TypeScript**, **Tailwind CSS**, **Zustand**, and **Firebase Firestore**.

This documentation provides details on the project's architecture, file structure, database schema, state management, and business logic for future development.

---

## 📑 Table of Contents
1. [Project Overview & Technology Stack](#1-project-overview--technology-stack)
2. [File & Folder Directory Structure](#2-file--folder-directory-structure)
3. [State Management (Zustand Stores)](#3-state-management-zustand-stores)
4. [Invoice Printing & PDF Generation Engine](#4-invoice-printing--pdf-generation-engine)
5. [Admin Panel & Backoffice Features](#5-admin-panel--backoffice-features)
6. [Database & Firebase Integration](#6-database--firebase-integration)
7. [Bangladesh Delivery & Address System](#7-bangladesh-delivery--address-system)
8. [Currency Formatting](#8-currency-formatting)
9. [Data Backup, Export & Bulk Import](#9-data-backup-export--bulk-import)
10. [Guidelines & Commands for Developers](#10-guidelines--commands-for-developers)
11. [Known Limitations & Production Scaling](#11-known-limitations--production-scaling)

---

## 1. Project Overview & Technology Stack

* **Framework**: Next.js 15+ (App Router)
* **Language**: TypeScript (Strict type checking)
* **Styling**: Tailwind CSS v4 (Design tokens with zero runtime overhead)
* **Icons**: `lucide-react` (Standard vector icons)
* **State Management**: Zustand (Lightweight, fast, and reactive global state)
* **Database & Auth**: Firebase Firestore & Firebase Authentication
* **PDF & Printing**: `jsPDF` + `html2canvas` (Isolated iframe sandboxing)
* **Animations**: `motion` (Route & modal transitions)

---

## 2. File & Folder Directory Structure

```
/
├── app/                          # Next.js App Router pages & routing
│   ├── account/page.tsx          # Customer profile, order history, and password change
│   ├── admin/page.tsx            # Admin dashboard (Orders, Products, Settings, Vouchers)
│   ├── best-deals/page.tsx       # Best deals curated page
│   ├── cart/page.tsx             # Full checkout & payment page
│   ├── category/page.tsx         # Category-based product browsing
│   ├── flash-deals/page.tsx      # Flash sale countdown page
│   ├── product/[id]/page.tsx     # Product details, reviews, and size chart
│   ├── shop/page.tsx             # Master catalog filtering & search
│   ├── track/page.tsx            # Courier parcel & order live tracking
│   ├── layout.tsx                # Root layout with fonts & providers
│   ├── globals.css               # Tailwind design variables & print rules
│   ├── sitemap.ts                # SEO sitemap generator
│   └── robots.ts                 # Search engine crawler policy
│
├── components/                   # Reusable UI & Business Components
│   ├── admin/                    # Admin panel tables, forms, and modals
│   ├── auth/                     # Login, registration, and OTP modals
│   ├── cart/                     # Slide-in cart drawer and cart items
│   ├── home/                     # Hero slider, banners, and featured sections
│   ├── invoice/InvoiceModal.tsx  # Premium Tax Invoice and receipt modal
│   ├── layout/                   # Header, Footer, and Bottom Navigation Bar
│   ├── product/                  # Product cards, image galleries, and quick-view
│   └── ui/                       # Skeletons, badges, and logo components
│
├── lib/                          # Core utilities & business helpers
│   ├── bangladeshDistricts.ts    # 64 BD districts and delivery zone charging
│   ├── dataTransferUtils.ts      # CSV/JSON export & bulk product import parser
│   ├── firebase.ts               # Firebase initialization and Firestore client
│   ├── formatCurrency.ts         # BDT currency formatting (৳ symbol)
│   ├── invoicePrintUtils.ts      # Direct print dialog and high-resolution PDF export
│   ├── logManager.ts             # User visitor analytics and activity logging
│   ├── theme.ts                  # Color palette and brand config
│   └── uiTheme.ts                # Dynamic border radius and theme color presets
│
├── store/                        # Zustand global state stores
│   ├── useAnalyticsStore.ts      # Visitor tracking and event logs
│   ├── useAuthStore.ts           # User profiles, roles, and sessions
│   ├── useCartStore.ts           # Shopping cart and checkout state
│   ├── useOrderStore.ts          # Orders database and status updates
│   ├── useProductStore.ts        # Product catalog and live stock
│   ├── useSiteSettingsStore.ts   # Home banners, notices, and store settings
│   ├── useVoucherStore.ts        # Coupon discount and voucher logic
│   └── useWishlistStore.ts       # User wishlist persistence
│
├── data/                         # Initial data
│   └── products.ts               # Seed product catalog
│
└── types/                        # TypeScript interfaces & types
    ├── index.ts                  # Common types
    └── product.ts                # Product, review, and variant types
```

---

## 3. State Management (Zustand Stores)

All project data is managed via **Zustand**. Key stores include:

### a. `useProductStore` (Product Catalog & Live Stock)
* Loading product lists, creating new products (`addProduct`), editing (`updateProduct`), deleting (`deleteProduct`), and stock updates.
```typescript
import { useProductStore } from '@/store/useProductStore';

const products = useProductStore((state) => state.products);
const addProduct = useProductStore((state) => state.addProduct);
```

### b. `useOrderStore` (Orders & Fulfillment)
* Placing new orders (`createOrder`), updating status (`updateOrderStatus`: `'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'`), and assigning tracking numbers.
```typescript
import { useOrderStore } from '@/store/useOrderStore';

const { orders, updateOrderStatus, updateTrackingNumber } = useOrderStore();
```

### c. `useCartStore` (Shopping Cart & Checkout)
* Adding items to cart (`addItem`), updating quantity (`updateQuantity`), removing items (`removeItem`), applying vouchers (`applyVoucher`), and automated subtotal calculation.

---

## 4. Invoice Printing & PDF Generation Engine

`lib/invoicePrintUtils.ts` acts as the centralized engine for invoice printing and PDF creation:

### Key Features:
1. **Direct Browser Print (`directPrintInvoice`)**:
   - Opens the system print dialog without external file downloads.
   - Uses a sandboxed hidden `iframe` to ensure print layout doesn't affect main page styles.
2. **True A4 PDF Export (`downloadInvoicePDF`)**:
   - Uses `jsPDF` and `html2canvas` to create **2.5x high-definition** vector quality PDFs.
   - Uses isolated hex-color templates to avoid issues with Tailwind's `oklch` or other color spaces.
3. **Courier Barcode**:
   - Each invoice includes a real vector SVG barcode scannable by courier services.

---

## 5. Admin Panel & Backoffice Features

The Admin Panel (`app/admin/page.tsx`) is a comprehensive e-commerce backoffice:

* **📊 Dashboard Overview**: Daily sales, total revenue, average order value, pending order counts, and popular products.
* **📦 Order Management**: Status filtering, one-click invoice view/print, and courier tracking updates.
* **🏷️ Catalog Manager**: Product add/edit, stock quantity tracking, flash deal toggles, and category filters.
* **📥 Bulk Data Import/Export**:
  - Download orders, products, and customer lists in CSV/JSON format.
  - Validated parser for bulk product CSV uploads.
* **🎟️ Coupon & Voucher Manager**: Flat or percentage discount code creation and expiry management.
* **🎨 Site Branding & Layout Customizer**: Theme colors, border radius, announcement bar, and banner management.
* **👥 Visitor Analytics & Logs**: Visitor activity tracking and audit trails.

---

## 6. Database & Firebase Integration

### 6.1 Architecture & Client Config
Firebase client initialization is handled in `lib/firebase.ts`:
* **Firestore Collections**:
  - `products`: Product catalog, pricing, and stock inventory.
  - `orders`: Customer orders, delivery status, and payment logs.
  - `users`: Registered customer profiles, roles, and saved shipping addresses.
  - `vouchers`: Active promo codes and discount validations.
  - `site_settings`: Storefront banners, marquee announcements, theme colors, and delivery fees.
* **Offline Fallback**: Data is cached in local memory to prevent iframe security restrictions and synced with Firestore when online.

---

### 6.2 Firebase Admin SDK (`lib/firebaseAdmin.ts`)
Server-side Next.js API routes (`/api/orders/history`, `/api/orders/update-status`, `/api/returns/create`, etc.) execute using the Firebase Admin SDK.

`lib/firebaseAdmin.ts` automatically attempts authentication in two ways:
1. **Explicit Private Key (`FIREBASE_SERVICE_ACCOUNT_KEY`)**: Parsed when present in environment variables.
2. **Application Default Credentials (ADC)**: Used when running inside GCP environments (like Google Cloud Run or AI Studio) when no private key environment variable is set.

---

### 6.3 Google AI Studio Hosting Setup Guide (IAM Access)
When running inside Google AI Studio preview environments:
- The server runs on a Cloud Run instance under a Google-managed service account (`ais-sandbox@ais-asia-southeast1-4ac90b8232.iam.gserviceaccount.com`).
- To allow server-side API routes (such as `/api/orders/history`) to query the project's Firestore database without `7 PERMISSION_DENIED` errors, you must grant this service account IAM permissions in Google Cloud Console.

#### **Step-by-Step AI Studio IAM Setup:**
1. Open [Google Cloud Console - IAM Page](https://console.cloud.google.com/iam-admin/iam?project=magmati-ecom).
2. Ensure your Firebase project (`magmati-ecom`) is selected at the top header dropdown.
3. Click the **`+ Grant access`** button above the permissions table.
4. In the **New principals** field, paste:
   ```text
   ais-sandbox@ais-asia-southeast1-4ac90b8232.iam.gserviceaccount.com
   ```
5. In **Select a role**, select **Cloud Datastore User** (or **Firebase Rules Admin** / **Editor**).
6. Click **Save**.

---

### 6.4 Third-Party & Self-Hosting Deployment Guide (Vercel, Netlify, VPS, Docker, AWS, Render)
If you export or deploy this codebase to your own hosting provider or custom server, follow these instructions:

#### **A. Environment Variables Setup**
Set the following environment variables in your hosting dashboard or `.env.local` file:

```env
# Client-Side Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyAIP3IE6TfuZgf1jxB3fskpQgdRlbt-7Do"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="magmati-ecom.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="magmati-ecom"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="magmati-ecom.firebasestorage.app"

# Server-Side Firebase Admin Service Account Key (JSON String)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"magmati-ecom","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token"}'

# App Base URL
APP_URL="https://your-custom-domain.com"
```

#### **B. How to Obtain `FIREBASE_SERVICE_ACCOUNT_KEY`:**
1. Open [Firebase Console](https://console.firebase.google.com/).
2. Select your project (`magmati-ecom`).
3. Click the Gear Icon ⚙️ (**Project settings**) > **Service accounts** tab.
4. Click **Generate new private key** and download the `.json` key file.
5. Copy the **entire contents** of the downloaded `.json` file.
6. Paste it as the value for `FIREBASE_SERVICE_ACCOUNT_KEY` in your hosting dashboard (Vercel, Netlify, Render, Railway, AWS, Docker, or `.env.local`).

---

### 6.5 Custom Domain & Google OAuth Setup Guide
When hosting on a custom domain (e.g., `https://magmati.com` or `https://www.magmati.com`):

#### **1. Firebase Authorized Domains**
1. Open [Firebase Console](https://console.firebase.google.com/) > **Authentication** > **Settings** tab.
2. Under **Authorized domains**, click **Add domain**.
3. Add your custom domains (e.g., `magmati.com` and `www.magmati.com`).
*(Prevents `auth/unauthorized-domain` errors during user login).*

#### **2. Google OAuth Credentials Update**
1. Open [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials?project=magmati-ecom).
2. Click your **OAuth 2.0 Web Client ID** to edit.
3. Under **Authorized JavaScript origins**, add your custom domain: `https://magmati.com`.
4. Under **Authorized redirect URIs**, add your Firebase auth callback handler:
   `https://magmati-ecom.firebaseapp.com/__/auth/handler`
5. Click **Save**.

---

### 6.6 🇧🇩 সম্পূর্ণ কনফিগারেশন ও হোস্টিং গাইড (বাংলা নির্দেশনা)

#### **১. AI Studio প্রিভিউ এনভায়রনমেন্ট পারমিশন (IAM Setup):**
AI Studio এনভায়রনমেন্টে সার্ভার থেকে ডাটাবেজ অ্যাক্সেস চালু করতে:
1. [Google Cloud IAM Console](https://console.cloud.google.com/iam-admin/iam?project=magmati-ecom)-এ যান।
2. উপরে আপনার প্রজেক্টটি (`magmati-ecom`) সিলেক্ট করা আছে কিনা নিশ্চিত করুন।
3. **`+ Grant access`** বাটনে ক্লিক করুন।
4. **"New principals"** বক্সে নিচের ইমেইলটি বসান:
   `ais-sandbox@ais-asia-southeast1-4ac90b8232.iam.gserviceaccount.com`
5. **"Select a role"** থেকে **`Cloud Datastore User`** বা **`Editor`** সিলেক্ট করে **`Save`** করুন।

#### **২. থার্ড পার্টি বা নিজের হোস্টিংয়ে (Vercel, Netlify, VPS, Docker) সেটআপ:**
আপনি যদি আপনার নিজস্ব যেকোনো হোস্টিংয়ে অ্যাপটি লাইভ করতে চান:
1. **Service Account JSON Key তৈরি করুন:**
   * Firebase Console -> Project Settings (গিয়ার আইকন) -> **Service accounts** ট্যাবে যান।
   * **Generate new private key**-তে ক্লিক করে একটি JSON ফাইল ডাউনলোড করুন।
2. **Environment Variable যোগ করুন:**
   * আপনার হোস্টিং ড্যাশবোর্ডে (Vercel/Netlify/VPS/Docker `.env.local`) একটি ভেরিয়েবল তৈরি করুন:
     * **Name**: `FIREBASE_SERVICE_ACCOUNT_KEY`
     * **Value**: ডাউনলোড করা সম্পূর্ণ JSON ফাইলটির পুরো টেক্সট।
3. **Authorized Domain যোগ করুন:**
   * Firebase Console -> **Authentication** -> **Settings** -> **Authorized domains**-এ আপনার কাস্টম ডোমেইনটি (যেমন `magmati.com`) যোগ করুন।

---

## 7. Bangladesh Delivery & Address System

All configuration for delivery management in Bangladesh is in `lib/bangladeshDistricts.ts`:
* **64 Districts**: All district names in English.
* **Delivery Zones**:
  - Inside Dhaka: **৳60** (1-2 business days)
  - Outside Dhaka: **৳120** (3-5 business days)
* **Free Delivery Threshold**: Automatic free delivery for orders above a certain value as per store settings.

---

## 8. Currency Formatting

* **Taka Formatting (`lib/formatCurrency.ts`)**:
  - English format: `৳2,950` (Using English numerals and the ৳ symbol).

---

## 9. Data Backup, Export & Bulk Import

Complete store backups can be taken with one click via `lib/dataTransferUtils.ts`:
* **Full Store Backup**: Downloads a master JSON backup file of the entire database.
* **CSV Import**: Support for bulk uploading new products using a sample template.

---

## 10. Guidelines & Commands for Developers

### Commands to Run the Project:
```bash
# 1. Install dependencies
npm install

# 2. Run local server
npm run dev

# 3. Lint and syntax verification
npm run lint

# 4. Production build
npm run build
```

### Coding Rules:
1. **TypeScript Types**: Define appropriate interfaces in the `types/` folder when creating new objects or state.
2. **Styling**: Always use Tailwind CSS classes for colors and margins. Avoid unnecessary custom CSS files.
3. **Print & PDF**: When adding new fields to the invoice, style them using hex colors (`#hex`) in the `lib/invoicePrintUtils.ts` file.

---

## 11. Known Limitations & Production Scaling

### 11.1 In-Memory API Rate Limiting (`lib/rateLimit.ts`)
* **Current Implementation**: The API route rate limiter (`rateLimit()`) uses an in-memory JavaScript `Map` inside the Node.js server process.
* **Limitation**: In-memory state is local to a single server instance. In multi-instance environments (e.g., auto-scaled Google Cloud Run containers, clustered VPS instances, or serverless functions), each instance tracks request counts independently.
* **Recommended Fix for Multi-Instance Deployments**:
  - Replace the local `Map` in `lib/rateLimit.ts` with a centralized distributed key-value store such as **Redis** or **Upstash** (`@upstash/ratelimit` with `@upstash/redis`).
  - This guarantees shared, atomic rate-limiting counters across all container instances and edge regions without race conditions.

---

*Last documentation update: October 2026*
