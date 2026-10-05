'use client';

import React, { useState, useEffect } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useBestDealsStore } from '@/store/useBestDealsStore';
import { BestDealsHeader } from '@/components/best-deals/BestDealsHeader';
import { BestDealSectionCard } from '@/components/best-deals/BestDealSectionCard';

export function BestDealsPageClient() {
  const { products } = useProductStore();
  const { sections } = useBestDealsStore();

  const [activeSectionId, setActiveSectionId] = useState<string | undefined>();

  // IntersectionObserver to highlight current active section pill
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -70% 0px',
      }
    );

    const elements = document.querySelectorAll('section[id^="section-"]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sections]);

  // Filter only enabled sections, sorted by order
  const activeSections = (sections || [])
    .filter((sec) => sec.enabled)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="min-h-screen bg-surface-subtle/60 pb-16">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* 1. Header & Navigation */}
        <BestDealsHeader
          sections={activeSections}
          activeSectionId={activeSectionId}
        />

        {/* 2. Vertical Stack of Best Deal Category Showcases */}
        <div className="space-y-6 sm:space-y-8">
          {activeSections.map((section) => (
            <BestDealSectionCard
              key={section.id}
              section={section}
              allProducts={products}
            />
          ))}

          {activeSections.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-border-color p-8 space-y-3">
              <p className="text-base font-bold text-text-muted">
                No deal sections are currently active.
              </p>
              <p className="text-xs text-text-muted">
                Please activate sections or restore defaults from the Admin HQ.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
