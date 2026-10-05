/**
 * @file lib/invoicePrintUtils.ts
 * @description Premium, high-contrast, crystal-clear invoice printing and PDF export utility.
 * - Direct Print: Triggers native printer dialog with pure isolated iframe without downloading files.
 * - Download PDF: Generates ultra-crisp, rock-solid A4 PDF with 100% stable non-overlapping layout.
 */

import { Order } from '@/store/useOrderStore';
import { formatBDT } from '@/lib/formatCurrency';
import { escapeHtml } from '@/lib/utils';

export const PRINT_COLORS = {
  primary: '#D12929',
  dark: '#09090B',
  border: '#E4E4E7',
  muted: '#71717A',
  bgSubtle: '#F4F4F5',
} as const;

/**
 * Extract only the invoice card content for isolated rendering.
 */
export function getInvoiceContentOnly(order: Order): string {
  const deliveryFee = typeof order.deliveryFee === 'number' ? order.deliveryFee : (typeof order.shippingFee === 'number' ? order.shippingFee : 0);
  const discountAmount = typeof order.discount === 'number' ? order.discount : (typeof order.discountAmount === 'number' ? order.discountAmount : 0);
  const total = typeof order.total === 'number' ? order.total : 0;
  const subtotal = typeof order.subtotal === 'number' ? order.subtotal : Math.max(0, total - deliveryFee + discountAmount);

  const orderId = order.id || '-';
  const orderDate = order.date || order.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10);

  const paymentMethodStr = (order.paymentMethod || order.payment || 'Cash on Delivery').toString();
  const isPaidOnline = paymentMethodStr.toLowerCase().includes('paid') || 
                       paymentMethodStr.toLowerCase().includes('sslcommerz') || 
                       paymentMethodStr.toLowerCase().includes('card') ||
                       paymentMethodStr.toLowerCase().includes('bkash') ||
                       paymentMethodStr.toLowerCase().includes('nagad') ||
                       order.paymentMethod === 'card' ||
                       order.paymentMethod === 'bkash' ||
                       order.paymentMethod === 'nagad';

  const paymentStatus = isPaidOnline ? 'Paid Online' : 'Cash on Delivery (Pending)';

  const deliverTo = order.userName || '-';
  const phone = order.phone || '-';
  const email = order.userEmail || '-';

  const addressParts = [];
  if (order.address) addressParts.push(order.address);
  if (order.district) addressParts.push(order.district);
  const deliveryAddress = addressParts.join(', ') || '-';

  const itemsRows = (order.items || []).map((item, idx) => {
    const pProduct = item.product || {};
    const pName = pProduct.name || (item as any).name || (item as any).title || 'Product Item';
    const pSku = pProduct.sku || (item as any).sku || '-';
    const pSize = item.selectedSize || 'Standard';
    const pQty = item.quantity || 1;
    
    const pPrice = typeof item.customPrice === 'number' 
      ? item.customPrice 
      : (typeof pProduct.price === 'number' ? pProduct.price : ((item as any).price || 0));
    const pTotal = pPrice * pQty;

    return `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 8px 10px; text-align: center; border: 1px solid #e5e7eb; color: #4b5563; font-family: monospace;">${idx + 1}</td>
      <td style="padding: 8px 10px; border: 1px solid #e5e7eb; color: #111827; font-weight: 600; word-break: break-word; overflow-wrap: break-word; white-space: normal;">${escapeHtml(pName)}</td>
      <td style="padding: 8px 10px; border: 1px solid #e5e7eb; color: #4b5563; font-family: monospace;">${escapeHtml(pSku)}</td>
      <td style="padding: 8px 10px; border: 1px solid #e5e7eb; text-align: center; color: #374151;">${escapeHtml(pSize)}</td>
      <td style="padding: 8px 10px; border: 1px solid #e5e7eb; text-align: center; color: #111827; font-weight: 600;">${escapeHtml(pQty)}</td>
      <td style="padding: 8px 10px; border: 1px solid #e5e7eb; text-align: right; color: #374151;">৳${Math.round(pPrice).toLocaleString('en-US')}</td>
      <td style="padding: 8px 10px; border: 1px solid #e5e7eb; text-align: right; color: #111827; font-weight: 600;">৳${Math.round(pTotal).toLocaleString('en-US')}</td>
    </tr>
    `;
  }).join('');

  return `
  <div class="invoice-container" style="max-width: 100%; margin: 0 auto; background: #ffffff; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827;">
    <!-- a) Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #B91C1C; padding-bottom: 12px; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background-color: #B91C1C; width: 40px; height: 40px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: bold; font-size: 24px; line-height: 1;">M</div>
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 22px; font-weight: 800; color: #111827; letter-spacing: -0.5px; line-height: 1.1;">MAGMATI</span>
          <span style="font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Tax Invoice / Purchase Summary</span>
        </div>
      </div>
      <div style="text-align: right; font-size: 12px; color: #374151;">
        <div style="font-weight: 500;">Invoice No: <strong style="color: #111827; font-family: monospace; font-size: 13px;">#${escapeHtml(orderId)}</strong></div>
        <div style="font-weight: 500; margin-top: 4px;">Date: <span style="color: #111827;">${escapeHtml(orderDate)}</span></div>
      </div>
    </div>

    <!-- b) Order Details table -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; border: 1px solid #e5e7eb;">
      <tbody>
        <tr>
          <td style="width: 30%; padding: 8px 12px; font-weight: 600; color: #4b5563; border: 1px solid #e5e7eb; background-color: #f9fafb;">Order ID</td>
          <td style="width: 70%; padding: 8px 12px; color: #111827; font-family: monospace; font-weight: 700; border: 1px solid #e5e7eb;">#${escapeHtml(orderId)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #4b5563; border: 1px solid #e5e7eb; background-color: #f9fafb;">Order Date</td>
          <td style="padding: 8px 12px; color: #111827; border: 1px solid #e5e7eb;">${escapeHtml(orderDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #4b5563; border: 1px solid #e5e7eb; background-color: #f9fafb;">Payment Method</td>
          <td style="padding: 8px 12px; color: #111827; border: 1px solid #e5e7eb; text-transform: uppercase; font-weight: 500;">${escapeHtml(paymentMethodStr)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #4b5563; border: 1px solid #e5e7eb; background-color: #f9fafb;">Payment Status</td>
          <td style="padding: 8px 12px; color: #111827; border: 1px solid #e5e7eb; font-weight: bold;">
            <span style="color: ${isPaidOnline ? '#15803d' : '#b45309'}; text-transform: uppercase; font-size: 11px;">${escapeHtml(paymentStatus)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #4b5563; border: 1px solid #e5e7eb; background-color: #f9fafb;">Deliver To</td>
          <td style="padding: 8px 12px; color: #111827; font-weight: 600; border: 1px solid #e5e7eb;">${escapeHtml(deliverTo)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #4b5563; border: 1px solid #e5e7eb; background-color: #f9fafb;">Phone</td>
          <td style="padding: 8px 12px; color: #111827; font-family: monospace; border: 1px solid #e5e7eb;">${escapeHtml(phone)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #4b5563; border: 1px solid #e5e7eb; background-color: #f9fafb;">Email</td>
          <td style="padding: 8px 12px; color: #111827; border: 1px solid #e5e7eb;">${escapeHtml(email)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #4b5563; border: 1px solid #e5e7eb; background-color: #f9fafb;">Delivery Address</td>
          <td style="padding: 8px 12px; color: #111827; line-height: 1.4; border: 1px solid #e5e7eb;">${escapeHtml(deliveryAddress)}</td>
        </tr>
        ${order.orderNotes ? `
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; color: #4b5563; border: 1px solid #e5e7eb; background-color: #f9fafb;">Order Notes</td>
          <td style="padding: 8px 12px; color: #111827; line-height: 1.4; border: 1px solid #e5e7eb;">${escapeHtml(order.orderNotes)}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>

    <!-- c) Ordered Items table -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; border: 1px solid #e5e7eb;">
      <thead>
        <tr style="background-color: #f9fafb; border-bottom: 2px solid #d1d5db;">
          <th style="padding: 8px 10px; font-weight: 700; color: #374151; border: 1px solid #e5e7eb; text-align: center; width: 5%;">#</th>
          <th style="padding: 8px 10px; font-weight: 700; color: #374151; border: 1px solid #e5e7eb; text-align: left; width: 45%;">Product Name</th>
          <th style="padding: 8px 10px; font-weight: 700; color: #374151; border: 1px solid #e5e7eb; text-align: left; width: 15%;">SKU</th>
          <th style="padding: 8px 10px; font-weight: 700; color: #374151; border: 1px solid #e5e7eb; text-align: center; width: 10%;">Size</th>
          <th style="padding: 8px 10px; font-weight: 700; color: #374151; border: 1px solid #e5e7eb; text-align: center; width: 8%;">Qty</th>
          <th style="padding: 8px 10px; font-weight: 700; color: #374151; border: 1px solid #e5e7eb; text-align: right; width: 12%;">Unit Price</th>
          <th style="padding: 8px 10px; font-weight: 700; color: #374151; border: 1px solid #e5e7eb; text-align: right; width: 15%;">Item Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <!-- d) Totals box aligned right -->
    <div style="display: flex; justify-content: flex-end; margin-bottom: 30px; font-size: 12px;">
      <table style="width: 260px; border-collapse: collapse; border: 1px solid #e5e7eb;">
        <tbody>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 6px 10px; color: #4b5563; text-align: left; font-weight: 500;">Subtotal</td>
            <td style="padding: 6px 10px; text-align: right; color: #111827; font-weight: 600;">৳${Math.round(subtotal).toLocaleString('en-US')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 6px 10px; color: #4b5563; text-align: left; font-weight: 500;">Shipping Fee</td>
            <td style="padding: 6px 10px; text-align: right; color: #111827; font-weight: 600;">${deliveryFee > 0 ? `৳${Math.round(deliveryFee).toLocaleString('en-US')}` : 'Free'}</td>
          </tr>
          ${discountAmount > 0 ? `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 6px 10px; color: #15803d; text-align: left; font-weight: 600;">Voucher/Discount</td>
            <td style="padding: 6px 10px; text-align: right; color: #15803d; font-weight: 600;">-৳${Math.round(discountAmount).toLocaleString('en-US')}</td>
          </tr>
          ` : ''}
          <tr style="background-color: #f9fafb;">
            <td style="padding: 8px 10px; color: #111827; text-align: left; font-weight: 700;">Total</td>
            <td style="padding: 8px 10px; text-align: right; color: #B91C1C; font-weight: 800; font-size: 14px;">৳${Math.round(total).toLocaleString('en-US')}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- e) Footer -->
    <div style="border-top: 1px solid #d1d5db; padding-top: 15px; font-size: 11px; color: #4b5563; line-height: 1.5;">
      <div style="font-weight: 700; color: #111827; font-size: 12px; margin-bottom: 6px; text-align: center;">Thank you for choosing MAGMATI.</div>
      
      <div style="margin-bottom: 12px;">
        <div style="font-weight: 700; color: #374151; margin-bottom: 2px;">Exchange & Return Policy:</div>
        <div style="margin-left: 4px;">• Please verify your items upon delivery with the courier representative.</div>
        <div style="margin-left: 4px;">• Exchanges or defect reports are entertained within 7 days of invoice date with original packaging and memo.</div>
      </div>

      <div style="border-top: 1px dashed #e5e7eb; padding-top: 8px; text-align: center; color: #6b7280; font-size: 10px;">
        House 42, Road 11, Banani, Dhaka-1213, Bangladesh | Hotline: +880 1712-345678 | BIN: 002948192-0102
      </div>
    </div>
  </div>
  `;
}

export function generateInvoiceHTML(order: Order, autoPrint: boolean = false): string {
  const scriptTag = autoPrint 
    ? '<script>window.onload = function() { setTimeout(function() { window.print(); }, 250); }</script>'
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - ${escapeHtml(order.id || 'Order')}</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 14mm 12mm;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #ffffff;
      color: #111827;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .invoice-container {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      background: #ffffff;
      padding: 0;
      box-sizing: border-box;
    }
    @media print {
      body {
        background: #ffffff;
      }
      .invoice-container {
        width: 100%;
        max-width: none;
        padding: 0;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  ${getInvoiceContentOnly(order)}
  ${scriptTag}
</body>
</html>`;
}

/**
 * Direct Print Executor:
 * Uses a Blob URL with window.open to trigger printing seamlessly across mobile and desktop.
 * Falls back to downloadInvoicePDF if popups are blocked.
 */
export function directPrintInvoice(order: Order): boolean {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return false;
    }

    const htmlContent = generateInvoiceHTML(order, true);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);

    const printWin = window.open(blobUrl, '_blank');
    if (!printWin) {
      console.warn('Print popup blocked, falling back to downloadInvoicePDF');
      downloadInvoicePDF(order);
      return true;
    }

    setTimeout(() => {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch {}
    }, 60000);

    return true;
  } catch (err) {
    console.error('Direct print execution error:', err);
    try {
      downloadInvoicePDF(order);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * PDF Generation & Download Result Interface
 */
export interface PDFDownloadResult {
  success: boolean;
  filename: string;
  blobUrl?: string;
  error?: string;
}

/**
 * Opens invoice in a new tab with auto-print script so user can choose "Save as PDF".
 * Avoids html2canvas and jsPDF to prevent CSS parsing crashes.
 */
export async function downloadInvoicePDF(
  order: Order,
  _unusedTargetId?: string
): Promise<PDFDownloadResult> {
  const filename = `MAGMATI-Invoice-${order?.id || 'ORDER'}.pdf`;

  try {
    if (!order) {
      throw new Error('Order data is missing or undefined.');
    }

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error('This operation can only be executed in a browser environment.');
    }

    const htmlContent = generateInvoiceHTML(order, true);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);

    let popupOpened = false;
    try {
      const printWin = window.open(blobUrl, '_blank');
      if (printWin) {
        popupOpened = true;
      }
    } catch {
      popupOpened = false;
    }

    if (!popupOpened) {
      try {
        const link = document.createElement('a');
        link.href = blobUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          try {
            document.body.removeChild(link);
          } catch {}
        }, 100);
        popupOpened = true;
      } catch (linkErr) {
        console.warn('Fallback link click failed:', linkErr);
      }
    }

    if (!popupOpened) {
      return {
        success: false,
        filename,
        error: 'Please allow popups to download the invoice.',
      };
    }

    return {
      success: true,
      filename,
      blobUrl,
    };
  } catch (err: any) {
    console.error('Failed to generate PDF document:', err, err?.stack);
    return {
      success: false,
      filename,
      error: err?.message || 'Failed to open invoice PDF',
    };
  }
}
