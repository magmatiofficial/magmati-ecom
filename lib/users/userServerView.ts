/**
 * @file lib/users/userServerView.ts
 * @description Safe server-side projection of user documents for admin views.
 * Strictly allow-lists safe fields and never exposes sensitive credentials or security data.
 */

import { AdminUserView, UserRole } from './userFilters';

export function getSuperAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function toAdminUserView(id: string, data: Record<string, unknown> | undefined): AdminUserView {
  const d = data || {};
  const email = (typeof d.email === 'string' && d.email.trim() ? d.email.trim() : id).toLowerCase();
  const rawRole = typeof d.role === 'string' ? d.role.trim().toLowerCase() : '';
  const role: UserRole = rawRole === 'admin' ? 'admin' : 'customer';

  const name = typeof d.name === 'string' ? d.name.trim() : '';

  const phone = typeof d.phone === 'string' && d.phone.trim() ? d.phone.trim() : undefined;
  const address = typeof d.address === 'string' && d.address.trim() ? d.address.trim() : undefined;
  const avatarUrl = typeof d.avatarUrl === 'string' && d.avatarUrl.trim() ? d.avatarUrl.trim() : undefined;

  let avatarLetter = '';
  if (typeof d.avatarLetter === 'string' && d.avatarLetter.trim()) {
    avatarLetter = d.avatarLetter.trim().charAt(0).toUpperCase();
  } else if (name) {
    avatarLetter = name.charAt(0).toUpperCase();
  } else if (email) {
    avatarLetter = email.charAt(0).toUpperCase();
  } else if (id) {
    avatarLetter = id.charAt(0).toUpperCase();
  } else {
    avatarLetter = '?';
  }

  const isSuspended = Boolean(d.isSuspended);
  const createdAt = typeof d.createdAt === 'string' && d.createdAt.trim() ? d.createdAt.trim() : undefined;
  const isSuperAdmin = getSuperAdminEmails().includes(email);

  return {
    id,
    name,
    email,
    role,
    phone,
    address,
    avatarLetter,
    avatarUrl,
    isSuspended,
    createdAt,
    isSuperAdmin,
  };
}
