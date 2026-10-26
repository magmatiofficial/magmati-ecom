/**
 * @file lib/users/userFilters.ts
 * @description User role constants, type guards, ID validation pattern, and AdminUserView type.
 */

export const USER_ROLES = ['admin', 'customer'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);
}

/**
 * Firestore user doc IDs are lowercased email addresses or alphanumeric IDs.
 * Must be safe string without whitespace or slashes, between 3 and 254 chars.
 */
export const USER_EMAIL_PATTERN = /^[^\s/]{3,254}$/;

export interface AdminUserView {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  avatarLetter: string;
  avatarUrl?: string;
  isSuspended: boolean;
  createdAt?: string;
  isSuperAdmin: boolean;
}
