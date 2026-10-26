/**
 * @file lib/formatCurrency.ts
 * @description Currency formatting utility for Bangladeshi Taka (BDT - ৳) with English numerals.
 */



/**
 * Retained for backwards compatibility; returns standard digits.
 */
export function toBengaliNumerals(input: number | string): string {
  return String(input);
}

/**
 * Formats a numeric price into Bangladeshi Taka notation with English numerals.
 * @param amount Numeric price in BDT.
 * @returns Formatted currency string with ৳ symbol.
 */
export function formatBDT(amount: number): string {
  const formattedEn = Math.round(amount).toLocaleString('en-US');
  return `\u09F3${formattedEn}`;
}

