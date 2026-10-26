/**
 * @file lib/returns/returnFilters.ts
 * @description Return status constants, type guards, and return ID pattern.
 */

export const RETURN_STATUSES = ['Pending', 'Approved', 'Rejected', 'Completed'] as const;

export type ReturnStatus = (typeof RETURN_STATUSES)[number];

export function isReturnStatus(value: string): value is ReturnStatus {
  return (RETURN_STATUSES as readonly string[]).includes(value);
}

export const RETURN_ID_PATTERN = /^[A-Za-z0-9_-]{1,40}$/;
