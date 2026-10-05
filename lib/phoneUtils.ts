/**
 * @file lib/phoneUtils.ts
 * @description Standardized Bangladeshi mobile phone number normalization and comparison utility.
 */

export function normalizePhone(phoneInput: string | null | undefined): string {
  if (!phoneInput) return '';
  // Strip all non-digit characters
  let digits = phoneInput.replace(/\D/g, '');
  // Strip country code 88 if present
  if (digits.startsWith('880')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('88')) {
    digits = digits.slice(2);
  }
  // Ensure leading zero for 10-digit BD mobile numbers starting with 1
  if (digits.length === 10 && digits.startsWith('1')) {
    digits = '0' + digits;
  }
  return digits;
}

export function isValidBDPhone(phoneInput: string | null | undefined): boolean {
  const normalized = normalizePhone(phoneInput);
  return /^01[3-9]\d{8}$/.test(normalized);
}

export function isPhoneMatching(phone1: string | null | undefined, phone2: string | null | undefined): boolean {
  const norm1 = normalizePhone(phone1);
  const norm2 = normalizePhone(phone2);
  if (!norm1 || !norm2 || norm1.length < 11 || norm2.length < 11) {
    return false;
  }
  return norm1 === norm2;
}
