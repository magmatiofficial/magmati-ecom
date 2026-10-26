import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"
import type { Product, CategoryItem } from "@/types"

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            '4xs',
            '3xs',
            '2xs',
            'xs',
            'sm',
            'base-sm',
            'base',
            'md',
            'lg',
            'xl',
            '2xl',
            '3xl',
            '4xl',
            '5xl',
            'display',
            'h1',
            'h2',
            'h3',
            'body',
            'caption',
            'eyebrow',
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs))
}

export function cleanWhatsAppNumber(phoneStr?: string, fallback = "8801700000000"): string {
  if (!phoneStr) return fallback;
  const digits = phoneStr.replace(/[^\d]/g, '');
  if (digits.length === 11 && digits.startsWith('01')) {
    return '88' + digits;
  }
  return digits || fallback;
}

/**
 * Normalization helper to map user store categories to standardized product category slugs.
 */
export function getNormalizedCategory(cat: string): string {
  if (!cat) return '';
  const c = cat.toLowerCase();
  if (c.includes('headphone') || c.includes('earphone') || c.includes('gadget') || c.includes('electronics')) {
    return 'electronics & gadgets';
  }
  if (c.includes('computer') || c.includes('office')) {
    return 'electronics & gadgets';
  }
  if (c.includes('men')) {
    return 'men';
  }
  if (c.includes('women')) {
    return 'women';
  }
  if (c.includes('watch')) {
    return 'electronics & gadgets';
  }
  if (c.includes('kids') || c.includes('baby')) {
    return 'kids & baby care';
  }
  if (c.includes('kitchen') || c.includes('home') || c.includes('appliances')) {
    return 'home & kitchen appliances';
  }
  if (c.includes('health') || c.includes('beauty') || c.includes('grooming') || c.includes('personal care')) {
    return 'beauty & personal care';
  }
  if (c.includes('footwear') || c.includes('bags') || c.includes('leather')) {
    return 'footwear & leather';
  }
  return c;
}

/**
 * Escapes special HTML characters to prevent XSS injection in raw HTML strings.
 */
export function escapeHtml(str?: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Determines whether a product belongs to a category by checking if:
 * 1. product.category equals category.name (case-insensitive, trimmed)
 * 2. OR product.subcategory equals any entry name in category.subcategories (case-insensitive, trimmed)
 */
export function productBelongsToCategory(
  product: Product,
  category: CategoryItem
): boolean {
  if (!product || !category) return false;

  const prodCat = (product.category || '').trim().toLowerCase();
  const catName = (category.name || '').trim().toLowerCase();

  if (prodCat && catName && prodCat === catName) {
    return true;
  }

  const prodSub = (product.subcategory || '').trim().toLowerCase();
  if (prodSub && category.subcategories && category.subcategories.length > 0) {
    return category.subcategories.some((entry) => {
      const entryName = (typeof entry === 'string' ? entry : entry?.name || '').trim().toLowerCase();
      return Boolean(entryName && entryName === prodSub);
    });
  }

  return false;
}

