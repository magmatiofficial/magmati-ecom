'use client';

import React, { useState } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { HeroSlidesManager } from '@/components/admin/homepage/HeroSlidesManager';
import { SmallBannersManager } from '@/components/admin/homepage/SmallBannersManager';
import { SectionLayoutsManager } from '@/components/admin/homepage/SectionLayoutsManager';
import type { HomeSectionConfig } from '@/store/useSiteSettingsStore';

interface HeroSlide {
  id: string;
  image: string;
  titleEn: string;
  subtitleEn: string;
  badgeEn: string;
  buttonLink: string;
}

interface SmallBanner {
  image: string;
  link: string;
  title?: string;
  badge?: string;
}

interface HomepageSettingsProps {
  siteSettings: {
    heroSlides: HeroSlide[];
    bannerLayoutMode?: 'hero_only' | 'hero_plus_one_small' | 'hero_plus_two_smalls';
    heroAutoPlayIntervalSeconds?: number;
    smallBanner1?: SmallBanner;
    smallBanner2?: SmallBanner;
    sectionLayouts: HomeSectionConfig[];
    combos: any[];
    b1g1Offers: any[];
    updateSettings: (fields: any) => void;
    moveSection: (idx: number, dir: 'up' | 'down') => void;
    toggleSection: (id: string) => void;
    deleteSection: (id: string) => void;
    addSection?: (section: any) => void;
    updateSection: (id: string, fields: any) => void;
    deleteHeroSlide: (id: string) => void;
    addCombo: (combo: any) => void;
    updateCombo: (id: string, combo: any) => void;
    deleteCombo: (id: string) => void;
    toggleCombo: (id: string) => void;
    addB1G1Offer: (offer: any) => void;
    updateB1G1Offer: (id: string, offer: any) => void;
    deleteB1G1Offer: (id: string) => void;
    toggleB1G1Offer: (id: string) => void;
  };
  openAddSlideModal: () => void;
  openEditSlideModal: (slide: HeroSlide) => void;
}

export const HomepageSettings: React.FC<HomepageSettingsProps> = ({
  siteSettings,
  openAddSlideModal,
  openEditSlideModal,
}) => {
  const { products } = useProductStore();

  const handleUpdateSmallBanner1 = (fields: Partial<SmallBanner>) => {
    siteSettings.updateSettings({
      smallBanner1: {
        image: siteSettings.smallBanner1?.image || '',
        link: siteSettings.smallBanner1?.link || '/shop',
        ...fields,
      },
    });
  };

  const handleUpdateSmallBanner2 = (fields: Partial<SmallBanner>) => {
    siteSettings.updateSettings({
      smallBanner2: {
        image: siteSettings.smallBanner2?.image || '',
        link: siteSettings.smallBanner2?.link || '/shop',
        ...fields,
      },
    });
  };

  const handleChangeBannerLayoutMode = (mode: 'hero_only' | 'hero_plus_one_small' | 'hero_plus_two_smalls') => {
    siteSettings.updateSettings({ bannerLayoutMode: mode });
  };

  const handleChangeAutoPlayInterval = (seconds: number) => {
    siteSettings.updateSettings({ heroAutoPlayIntervalSeconds: seconds });
  };

  return (
    <div className="space-y-6">
      <HeroSlidesManager
        slides={siteSettings.heroSlides || []}
        onAddSlide={openAddSlideModal}
        onEditSlide={openEditSlideModal}
        onDeleteSlide={siteSettings.deleteHeroSlide}
      />

      <SmallBannersManager
        bannerLayoutMode={siteSettings.bannerLayoutMode || 'hero_only'}
        onChangeBannerLayoutMode={handleChangeBannerLayoutMode}
        heroAutoPlayIntervalSeconds={siteSettings.heroAutoPlayIntervalSeconds ?? 5}
        onChangeAutoPlayInterval={handleChangeAutoPlayInterval}
        smallBanner1={siteSettings.smallBanner1}
        smallBanner2={siteSettings.smallBanner2}
        onUpdateBanner1={handleUpdateSmallBanner1}
        onUpdateBanner2={handleUpdateSmallBanner2}
      />

      <SectionLayoutsManager
        sectionLayouts={siteSettings.sectionLayouts || []}
        onToggleSection={siteSettings.toggleSection}
        onMoveSection={siteSettings.moveSection}
        onUpdateSection={siteSettings.updateSection}
        onDeleteSection={siteSettings.deleteSection}
      />
    </div>
  );
};
