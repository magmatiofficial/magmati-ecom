import { BANGLADESH_DISTRICTS } from './bangladeshDistricts';
import { INSIDE_DHAKA_DELIVERY_FEE_BDT, OUTSIDE_DHAKA_DELIVERY_FEE_BDT } from './constants';

/**
 * Checks if a given district string corresponds to Dhaka City.
 * Compares lowercase against both d.id and d.nameEn.
 * If the district text is exactly "dhaka" (any case), treat it as Dhaka City.
 */
export function isDhakaCityDistrict(district?: string): boolean {
  if (!district) return false;
  
  const searchLower = district.toLowerCase().trim();
  
  // Explicit rule: If the district text is exactly "dhaka" (any case), treat it as Dhaka City
  if (searchLower === 'dhaka') return true;

  const matchedDistrict = BANGLADESH_DISTRICTS.find(d => 
    d.id.toLowerCase() === searchLower || 
    d.nameEn.toLowerCase() === searchLower
  );

  return !!matchedDistrict?.isDhakaCity;
}

/**
 * Computes the shipping fee for a return based on the order's delivery fee or district.
 */
export function getReturnShippingFee(order: { deliveryFee?: number; district?: string }): number {
  if (order.deliveryFee !== undefined && Number(order.deliveryFee) > 0) {
    return Number(order.deliveryFee);
  }

  return isDhakaCityDistrict(order.district)
    ? INSIDE_DHAKA_DELIVERY_FEE_BDT
    : OUTSIDE_DHAKA_DELIVERY_FEE_BDT;
}
