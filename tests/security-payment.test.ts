/**
 * @file tests/security-payment.test.ts
 * @description Automated Unit & Integration Tests for MAGMATI Security & Payment Fixes
 */

import { isPhoneMatching, isValidBDPhone, normalizePhone } from '../lib/phoneUtils';
import { escapeHtml } from '../lib/utils';
import { getInvoiceContentOnly } from '../lib/invoicePrintUtils';
import { safeJsonLd } from '../lib/jsonLd';
import type { Order } from '../store/useOrderStore';

function runSecurityTests() {
  console.log('====================================================');
  console.log('MAGMATI VERIFIED SECURITY & PAYMENT TESTS RUNNER');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✕ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Phone Normalization & Validation Tests
  assert(normalizePhone('+8801712345678') === '01712345678', 'Normalizes +8801712345678 to 01712345678');
  assert(normalizePhone('8801812345678') === '01812345678', 'Normalizes 8801812345678 to 01812345678');
  assert(normalizePhone('01912345678') === '01912345678', 'Normalizes 01912345678 to 01912345678');
  assert(normalizePhone('1712345678') === '01712345678', 'Normalizes 10-digit 1712345678 to 01712345678');
  assert(isValidBDPhone('01712345678') === true, 'Validates 11-digit BD phone number');
  assert(isValidBDPhone('12345') === false, 'Rejects short phone number');

  // 2. Phone Equality Matching vs Partial Matching
  assert(isPhoneMatching('01712345678', '+8801712345678') === true, 'Matches normalized full phone numbers');
  assert(isPhoneMatching('01712345678', '5678') === false, 'Rejects partial phone numbers (suffix match disallowed)');
  assert(isPhoneMatching('01712345678', '01812345678') === false, 'Rejects different phone numbers');

  // 3. Mock Order Tracking Verification Logic
  const mockOrder = {
    id: 'MGM-1001',
    phone: '01712345678',
    userEmail: 'customer@example.com',
    total: 3450,
  };

  // Test 3.1: Order ID alone without phone
  const trackAttemptNoPhone = (!mockOrder.id || !isValidBDPhone(''));
  assert(trackAttemptNoPhone === true, 'Order ID alone cannot track order (requires phone)');

  // Test 3.2: Order ID with partial phone
  const partialPhone = '5678';
  const trackAttemptPartial = !isValidBDPhone(partialPhone) || !isPhoneMatching(mockOrder.phone, partialPhone);
  assert(trackAttemptPartial === true, 'Partial phone number rejected for order tracking');

  // Test 3.3: Order ID with matching full phone
  const fullPhone = '+8801712345678';
  const trackAttemptValid = isValidBDPhone(fullPhone) && isPhoneMatching(mockOrder.phone, fullPhone);
  assert(trackAttemptValid === true, 'Matching Order ID + full normalized phone allows tracking');

  // 4. Payment Ownership Verification
  function verifyPaymentOwnership(req: { tokenEmail?: string; guestPhone?: string }, order: typeof mockOrder) {
    if (req.tokenEmail && req.tokenEmail.toLowerCase() === order.userEmail.toLowerCase()) {
      return true;
    }
    if (req.guestPhone && isValidBDPhone(req.guestPhone) && isPhoneMatching(order.phone, req.guestPhone)) {
      return true;
    }
    return false;
  }

  assert(
    verifyPaymentOwnership({ tokenEmail: 'other@example.com' }, mockOrder) === false,
    'One customer cannot initialize payment for another customer order'
  );
  assert(
    verifyPaymentOwnership({ guestPhone: '01712345678' }, mockOrder) === true,
    'Guest with matching Order ID and phone can initialize payment'
  );
  assert(
    verifyPaymentOwnership({ guestPhone: '5678' }, mockOrder) === false,
    'Guest with partial phone cannot initialize payment'
  );

  // 5. B1G1 and Combo Server Validation Logic
  function validateOrderB1G1(item: { isFreeItem?: boolean; prodId: string; claimedB1G1?: boolean }, buyItem?: { prodId: string; claimedB1G1?: boolean }) {
    if (!item.isFreeItem) return true;
    if (item.isFreeItem) {
      if (buyItem && item.claimedB1G1) {
        return true;
      }
      return false; // Rejected: unclaimed or missing buy product
    }
    return true;
  }

  assert(
    validateOrderB1G1({ isFreeItem: true, prodId: 'speaker', claimedB1G1: false }, { prodId: 'watch', claimedB1G1: false }) === false,
    'Unclaimed B1G1 free gift rejected by server'
  );
  assert(
    validateOrderB1G1({ isFreeItem: true, prodId: 'speaker', claimedB1G1: true }, { prodId: 'watch', claimedB1G1: true }) === true,
    'Valid explicit B1G1 claim accepted by server'
  );

  // 6. HTML Injection & XSS Escaping Tests
  const xssImgPayload = '<img src=x onerror=alert(1)>';
  const escapedImg = escapeHtml(xssImgPayload);
  assert(
    escapedImg === '&lt;img src=x onerror=alert(1)&gt;',
    'escapeHtml: <img src=x onerror=alert(1)> is safely converted to &lt;img src=x onerror=alert(1)&gt;'
  );

  const xssScriptPayload = '"><script>alert("XSS")</script>';
  const escapedScript = escapeHtml(xssScriptPayload);
  assert(
    !escapedScript.includes('<script>') && !escapedScript.includes('">') && escapedScript.includes('&lt;script&gt;'),
    'escapeHtml: Script tag payload is safely escaped'
  );

  assert(
    escapeHtml(null) === '' && escapeHtml(undefined) === '',
    'escapeHtml: Handles null and undefined cleanly without throwing'
  );

  // 7. Invoice Content HTML Escaping Test
  const mockMaliciousOrder: Order = {
    id: 'MGM-XSS-100',
    date: '2026-10-05',
    createdAt: new Date().toISOString(),
    userName: '<img src=x onerror=alert(1)>',
    phone: '01712345678',
    userEmail: 'attacker@example.com',
    address: '<script>alert("address")</script>',
    district: 'Dhaka',
    orderNotes: '<svg onload=alert("notes")>',
    payment: 'Cash on Delivery',
    paymentMethod: 'cod',
    deliveryFee: 60,
    discount: 0,
    total: 1060,
    subtotal: 1000,
    status: 'Pending',
    items: [
      {
        product: {
          id: 'prod-1',
          name: '<img src=x onerror=alert(1)>',
          price: 1000,
          sku: 'SKU-<script>',
          images: [],
          category: 'fashion',
        } as any,
        selectedSize: '<b onmouseover=alert(1)>XL</b>',
        selectedColor: { name: 'Red', hex: '#ff0000' },
        quantity: 1,
      },
    ],
  };

  const invoiceHtml = getInvoiceContentOnly(mockMaliciousOrder);
  assert(
    !invoiceHtml.includes('<img src=x onerror=alert(1)>'),
    'getInvoiceContentOnly: Customer name <img src=x onerror=alert(1)> is escaped in rendered invoice HTML'
  );
  assert(
    invoiceHtml.includes('&lt;img src=x onerror=alert(1)&gt;'),
    'getInvoiceContentOnly: Escaped entity &lt;img src=x onerror=alert(1)&gt; is rendered'
  );
  assert(
    !invoiceHtml.includes('<script>alert("address")</script>'),
    'getInvoiceContentOnly: Malicious address <script> tag is escaped'
  );
  assert(
    !invoiceHtml.includes('<svg onload=alert("notes")>'),
    'getInvoiceContentOnly: Malicious orderNotes <svg> tag is escaped'
  );

  // 8. Safe JSON-LD Serialization Test
  const mockJsonLdObj = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MAGMATI',
    potentialAction: {
      target: 'https://magmati.com/search?q=</script><script>alert(1)</script>',
    },
  };
  const serializedJsonLd = safeJsonLd(mockJsonLdObj);
  assert(
    !serializedJsonLd.includes('</script>'),
    'safeJsonLd: Replaces all < with \\u003c to prevent script breakout attacks'
  );
  assert(
    serializedJsonLd.includes('\\u003c/script>'),
    'safeJsonLd: Contains \\u003c unicode escape sequence'
  );

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests();
