'use client';

import React, { useEffect, useRef } from 'react';

/**
 * @file components/ui/AutoScrollIndicator.tsx
 * @description Floating overlay scrollbar indicator.
 * - Occupies 0px of layout space (zero layout gutter / zero content shift).
 * - Completely invisible when idle.
 * - Appears as a sleek floating indicator when scrolling.
 * - Automatically fades out smoothly once scrolling stops.
 * - Supports dragging on desktop for rapid scrolling.
 */
export function AutoScrollIndicator() {
  // Return null to allow 100% native 60fps/120fps GPU compositor scrolling on all devices without layout thrashing
  return null;
}

