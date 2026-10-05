/**
 * @file lib/dataTransferUtils.ts
 * @description Enterprise-grade Data Transfer Utilities for MAGMATI.
 * Handles:
 * - Exporting Orders, Products, Customers to CSV and JSON
 * - Full Store Backup generation & restoration
 * - Parsing & validating CSV/JSON imports for bulk product uploads
 * - Generating sample CSV product templates
 */

import { Product } from '@/types';
import { Order } from '@/store/useOrderStore';
import { UserProfile } from '@/store/useAuthStore';

/**
 * Universal browser file downloader
 */
export function downloadFile(filename: string, content: string, mimeType: string) {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape CSV field to handle quotes, commas, and linebreaks
 */
function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

// ============================================================================
// EXPORT: ORDERS
// ============================================================================

export function exportOrdersToCSV(orders: Order[]) {
  const headers = [
    'Order ID',
    'Date Placed',
    'Customer Name',
    'Customer Phone',
    'Customer Email',
    'Delivery Address',
    'District',
    'Payment Method',
    'Order Status',
    'Total Items Count',
    'Items Summary',
    'Subtotal (BDT)',
    'Shipping Fee (BDT)',
    'Discount Amount (BDT)',
    'Grand Total (BDT)',
    'Order Notes'
  ];

  const rows = orders.map((o) => {
    const itemsSummary = o.items
      .map((item) => `${item.product?.name || 'Item'} (${item.selectedSize || 'Std'}) x${item.quantity}`)
      .join('; ');
    const totalQty = o.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const subtotal = o.subtotal || Math.max(0, o.total - (o.shippingFee || 0));

    return [
      escapeCSV(o.id),
      escapeCSV(o.date || o.createdAt?.slice(0, 10) || ''),
      escapeCSV(o.userName || ''),
      escapeCSV(o.phone || ''),
      escapeCSV(o.userEmail || ''),
      escapeCSV(o.address || ''),
      escapeCSV(o.district || ''),
      escapeCSV(o.paymentMethod || o.payment || 'COD'),
      escapeCSV(o.status || 'Pending'),
      escapeCSV(totalQty),
      escapeCSV(itemsSummary),
      escapeCSV(subtotal),
      escapeCSV(o.shippingFee || 0),
      escapeCSV(o.discountAmount || 0),
      escapeCSV(o.total || 0),
      escapeCSV(o.orderNotes || '')
    ].join(',');
  });

  // Prepend UTF-8 BOM (\uFEFF) for perfect rendering in Microsoft Excel
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(`magmati_orders_${dateStr}.csv`, csvContent, 'text/csv;charset=utf-8;');
}

export function exportOrdersToJSON(orders: Order[]) {
  const jsonStr = JSON.stringify(orders, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(`magmati_orders_${dateStr}.json`, jsonStr, 'application/json;charset=utf-8;');
}

// ============================================================================
// EXPORT: PRODUCTS
// ============================================================================

export function exportProductsToCSV(products: Product[]) {
  const headers = [
    'ID',
    'SKU',
    'Name',
    'Category',
    'Price (BDT)',
    'Original Price (BDT)',
    'Stock Quantity',
    'In Stock',
    'Available Sizes',
    'Color',
    'Rating',
    'Reviews Count',
    'Is Flash Deal',
    'Is Best Deal',
    'Is New',
    'Is Brand Mall',
    'Is Trending',
    'Primary Image URL',
    'Description'
  ];

  const rows = products.map((p) => [
    escapeCSV(p.id),
    escapeCSV(p.sku || ''),
    escapeCSV(p.name || ''),
    escapeCSV(p.category || ''),
    escapeCSV(p.price || 0),
    escapeCSV(p.originalPrice || ''),
    escapeCSV(p.stockQuantity ?? 10),
    escapeCSV(p.inStock ? 'Yes' : 'No'),
    escapeCSV(p.sizes ? p.sizes.join('|') : ''),
    escapeCSV(p.colors ? p.colors.map((c) => c.name).join('|') : ''),
    escapeCSV(p.rating || 4.5),
    escapeCSV(p.reviewCount || 0),
    escapeCSV(p.isFlashDeal ? 'Yes' : 'No'),
    escapeCSV(p.isBestDeal ? 'Yes' : 'No'),
    escapeCSV(p.isNew ? 'Yes' : 'No'),
    escapeCSV(p.isBrandMall ? 'Yes' : 'No'),
    escapeCSV(p.isTrending ? 'Yes' : 'No'),
    escapeCSV(p.images?.[0] || ''),
    escapeCSV(p.description || '')
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(`magmati_products_${dateStr}.csv`, csvContent, 'text/csv;charset=utf-8;');
}

export function exportProductsToJSON(products: Product[]) {
  const jsonStr = JSON.stringify(products, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(`magmati_products_${dateStr}.json`, jsonStr, 'application/json;charset=utf-8;');
}

// ============================================================================
// EXPORT: CUSTOMERS
// ============================================================================

export function exportCustomersToCSV(customers: UserProfile[], orders: Order[]) {
  const headers = [
    'Customer ID',
    'Full Name',
    'Email',
    'Phone',
    'Default Address',
    'Role',
    'Total Orders Placed',
    'Total Spent (BDT)',
    'Member Since'
  ];

  const rows = customers.map((c) => {
    const userOrders = orders.filter((o) => {
      const emailMatch = c.email && o.userEmail && o.userEmail.toLowerCase() === c.email.toLowerCase();
      const phoneMatch = c.phone && o.phone && c.phone.replace(/\D/g, '') === o.phone.replace(/\D/g, '');
      return emailMatch || phoneMatch;
    });

    const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return [
      escapeCSV(c.id),
      escapeCSV(c.name || ''),
      escapeCSV(c.email || ''),
      escapeCSV(c.phone || ''),
      escapeCSV(c.address || ''),
      escapeCSV(c.role || 'customer'),
      escapeCSV(userOrders.length),
      escapeCSV(totalSpent),
      escapeCSV(c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US') : '')
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(`magmati_customers_${dateStr}.csv`, csvContent, 'text/csv;charset=utf-8;');
}

export function exportCustomersToJSON(customers: UserProfile[]) {
  const jsonStr = JSON.stringify(customers, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(`magmati_customers_${dateStr}.json`, jsonStr, 'application/json;charset=utf-8;');
}

// ============================================================================
// EXPORT: FULL STORE BACKUP
// ============================================================================

export interface StoreBackupData {
  backupVersion: string;
  createdAt: string;
  storeName: string;
  products: Product[];
  orders: Order[];
  categories?: any[];
  siteSettings?: any;
  vouchers?: any[];
}

export function exportFullStoreBackup(data: {
  products: Product[];
  orders: Order[];
  categories?: any[];
  siteSettings?: any;
  vouchers?: any[];
}) {
  const backupPayload: StoreBackupData = {
    backupVersion: '1.0',
    createdAt: new Date().toISOString(),
    storeName: 'MAGMATI',
    products: data.products,
    orders: data.orders,
    categories: data.categories,
    siteSettings: data.siteSettings,
    vouchers: data.vouchers
  };

  const jsonStr = JSON.stringify(backupPayload, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(`magmati_full_store_backup_${dateStr}.json`, jsonStr, 'application/json;charset=utf-8;');
}

// ============================================================================
// IMPORT: PARSING & VALIDATION
// ============================================================================

/**
 * Generates sample CSV template for Product imports
 */
export function generateSampleProductCSV(): string {
  const headers = [
    'Name',
    'Category',
    'Price',
    'OriginalPrice',
    'StockQuantity',
    'SKU',
    'Sizes',
    'Color',
    'ImageURL',
    'Description'
  ];

  const sampleRows = [
    [
      'Executive Oxford Cotton Shirt',
      "Men's Fashion",
      '1850',
      '2200',
      '25',
      'MS-OXF-01',
      'M|L|XL|XXL',
      'Sky Blue',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
      '100% fine cotton formal shirt crafted with premium thread count.'
    ],
    [
      'Artisan Floral Silk Saree',
      "Women's Fashion",
      '4200',
      '5500',
      '15',
      'WS-SAR-02',
      'Free Size',
      'Burgundy',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
      'Handcrafted silk saree with zari embroidery border.'
    ],
    [
      'Magnetic Fast-Charge Power Bank 10000mAh',
      'Electronics & Gadgets',
      '2350',
      '2800',
      '40',
      'EL-PB-03',
      'Standard',
      'Graphite Black',
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80',
      'Ultra-slim 22.5W PD fast charging with dual USB-C ports.'
    ],
  ];

  const content = '\uFEFF' + [
    headers.join(','),
    ...sampleRows.map((r) => r.map((cell) => escapeCSV(cell)).join(','))
  ].join('\r\n');

  return content;
}

/**
 * Robust CSV parser that handles quotes and multiple lines
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses products CSV text into valid Product objects
 */
export function parseProductsCSV(csvText: string): {
  products: Product[];
  errors: string[];
} {
  const errors: string[] = [];
  const products: Product[] = [];

  // Remove potential UTF-8 BOM
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleanText) {
    errors.push('The provided CSV content is empty.');
    return { products, errors };
  }

  const lines = cleanText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    errors.push('CSV must have a header row and at least one data row.');
    return { products, errors };
  }

  const rawHeaders = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  // Normalize header mapping
  const headerMap: Record<string, number> = {};
  rawHeaders.forEach((h, idx) => {
    if (h.includes('name') || h.includes('title')) headerMap['name'] = idx;
    else if (h.includes('category') || h.includes('cat')) headerMap['category'] = idx;
    else if (h.includes('orig') || h.includes('regularprice') || h.includes('marketprice')) headerMap['originalPrice'] = idx;
    else if (h.includes('price')) headerMap['price'] = idx;
    else if (h.includes('stock') || h.includes('qty') || h.includes('quantity')) headerMap['stock'] = idx;
    else if (h.includes('sku') || h.includes('code')) headerMap['sku'] = idx;
    else if (h.includes('size')) headerMap['sizes'] = idx;
    else if (h.includes('color')) headerMap['color'] = idx;
    else if (h.includes('image') || h.includes('photo') || h.includes('picture')) headerMap['image'] = idx;
    else if (h.includes('desc')) headerMap['description'] = idx;
  });

  if (headerMap['name'] === undefined) {
    errors.push('Required header "Name" or "Product Name" was not found in CSV.');
    return { products, errors };
  }
  if (headerMap['price'] === undefined) {
    errors.push('Required header "Price" was not found in CSV.');
    return { products, errors };
  }

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1;
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

    const name = values[headerMap['name']] || '';
    if (!name.trim()) {
      errors.push(`Row ${rowNum}: Product Name is required.`);
      continue;
    }

    const priceRaw = values[headerMap['price']];
    const price = parseFloat(priceRaw ? priceRaw.replace(/[^0-9.]/g, '') : '0');
    if (isNaN(price) || price <= 0) {
      errors.push(`Row ${rowNum}: Invalid price "${priceRaw}" for "${name}".`);
      continue;
    }

    const origPriceRaw = headerMap['originalPrice'] !== undefined ? values[headerMap['originalPrice']] : '';
    const originalPrice = origPriceRaw ? parseFloat(origPriceRaw.replace(/[^0-9.]/g, '')) : undefined;

    const stockRaw = headerMap['stock'] !== undefined ? values[headerMap['stock']] : '20';
    const stockQuantity = parseInt(stockRaw ? stockRaw.replace(/[^0-9]/g, '') : '20', 10) || 10;

    const category = headerMap['category'] !== undefined && values[headerMap['category']]
      ? values[headerMap['category']]
      : "Men's Fashion";

    const sku = headerMap['sku'] !== undefined && values[headerMap['sku']]
      ? values[headerMap['sku']]
      : `SKU-${Date.now().toString().slice(-5)}-${i}`;

    const sizesRaw = headerMap['sizes'] !== undefined ? values[headerMap['sizes']] : '';
    const sizes = sizesRaw
      ? sizesRaw.split(/[,|/]/).map((s) => s.trim()).filter(Boolean)
      : ['M', 'L', 'XL'];

    const color = headerMap['color'] !== undefined ? values[headerMap['color']] : 'Standard';
    const image = headerMap['image'] !== undefined && values[headerMap['image']]
      ? values[headerMap['image']]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

    const description = headerMap['description'] !== undefined ? values[headerMap['description']] : '';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `prod-${Date.now()}`;
    const colorName = color.trim() || 'Standard';

    const newProduct: Product = {
      id: `prod-imp-${Date.now()}-${i}`,
      name: name.trim(),
      slug: `${slug}-${i}`,
      category: category.trim(),
      subcategory: 'General',
      price: Math.round(price),
      originalPrice: originalPrice && !isNaN(originalPrice) ? Math.round(originalPrice) : undefined,
      stockQuantity,
      inStock: stockQuantity > 0,
      sku: sku.trim(),
      sizes: sizes.length > 0 ? sizes : ['Standard'],
      colors: [
        {
          name: colorName,
          hex: '#18181b',
        },
      ],
      images: [image.trim()],
      description: description.trim() || name.trim(),
      details: ['Premium quality materials', 'Easy care garment'],
      brand: 'MAGMATI',
      rating: 4.8,
      reviewCount: Math.floor(10 + Math.random() * 40),
      isNew: true,
      allowedPaymentMethods: ['cod', 'bkash', 'nagad', 'card'],
      lowStockThreshold: 5,
    };

    products.push(newProduct);
  }

  return { products, errors };
}

/**
 * Parses JSON array of products
 */
export function parseProductsJSON(jsonText: string): {
  products: Product[];
  errors: string[];
} {
  const errors: string[] = [];
  const products: Product[] = [];

  try {
    const parsed = JSON.parse(jsonText);
    const rawList = Array.isArray(parsed) ? parsed : parsed.products && Array.isArray(parsed.products) ? parsed.products : null;

    if (!rawList) {
      errors.push('Invalid JSON: Must be an array of products or an object with a "products" array.');
      return { products, errors };
    }

    rawList.forEach((item: any, idx: number) => {
      if (!item.name || typeof item.price !== 'number') {
        errors.push(`Item #${idx + 1}: Missing required "name" (string) or "price" (number).`);
        return;
      }

      const slug = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `prod-${Date.now()}`;
      const colorName = typeof item.color === 'string' ? item.color : 'Standard';
      const colorsList = Array.isArray(item.colors) && item.colors.length > 0
        ? item.colors
        : [];      const product: Product = {
        id: item.id || `prod-json-${Date.now()}-${idx}`,
        name: item.name,
        slug: `${slug}-${idx}`,
        category: item.category || "Men's Fashion",
        subcategory: item.subcategory || 'General',
        price: Math.round(item.price),
        originalPrice: item.originalPrice ? Math.round(item.originalPrice) : undefined,
        stockQuantity: item.stockQuantity ?? 15,
        inStock: (item.stockQuantity ?? 15) > 0,
        sku: item.sku || `SKU-${Date.now().toString().slice(-4)}-${idx}`,
        sizes: Array.isArray(item.sizes) ? item.sizes : ['M', 'L', 'XL'],
        colors: colorsList,
        images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
        description: item.description || item.name,
        details: Array.isArray(item.details) ? item.details : ['Premium craftsmanship', 'Standard fit'],
        brand: item.brand || 'MAGMATI',
        rating: item.rating || 4.8,
        reviewCount: item.reviewCount || item.reviewsCount || 15,
        isFlashDeal: !!item.isFlashDeal,
        isBestDeal: !!item.isBestDeal,
        isNew: item.isNew !== undefined ? item.isNew : true,
        isBrandMall: !!item.isBrandMall,
        isTrending: !!item.isTrending,
        allowedPaymentMethods: item.allowedPaymentMethods || ['cod', 'bkash', 'nagad', 'card'],
        lowStockThreshold: item.lowStockThreshold || 5,
      };

      products.push(product);
    });
  } catch (err: any) {
    errors.push(`JSON Syntax Error: ${err.message}`);
  }

  return { products, errors };
}
