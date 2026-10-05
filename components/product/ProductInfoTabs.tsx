'use client';

import React from 'react';
import { Product } from '@/types';

interface ProductInfoTabsProps {
  
  product: Product;
  activeTab: 'details' | 'specs' | 'delivery';
  setActiveTab: (tab: 'details' | 'specs' | 'delivery') => void;
}

export const ProductInfoTabs: React.FC<ProductInfoTabsProps> = ({
    product,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="border-t border-border-token pt-6">
      <div className="flex border-b border-border-token gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
            activeTab === 'details'
              ? 'border-primary text-primary'
              : 'border-transparent text-app-muted hover:text-app-text'
          }`}
        >
          {'Overview'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
            activeTab === 'specs'
              ? 'border-primary text-primary'
              : 'border-transparent text-app-muted hover:text-app-text'
          }`}
        >
          {'Specifications & Warranty'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('delivery')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
            activeTab === 'delivery'
              ? 'border-primary text-primary'
              : 'border-transparent text-app-muted hover:text-app-text'
          }`}
        >
          {'Shipping Info'}
        </button>
      </div>

      <div className="py-4 text-xs text-app-muted leading-relaxed">
        {activeTab === 'details' && (
          <ul className="list-disc list-inside space-y-1.5">
            {((product.details) || []).map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        )}
        {activeTab === 'specs' && (
          <div className="space-y-1.5">
            <p>• {'Directly imported authentic genuine verified product.'}</p>
            <p>• {'Official brand manufacturer warranty & coverage applies.'}</p>
            <p>• {'Original factory sealed packaging with serial validation.'}</p>
          </div>
        )}
        {activeTab === 'delivery' && (
          <div className="space-y-1.5">
            <p>• {'Inside Dhaka: 24-48 Hours door-to-door express dispatch.'}</p>
            <p>• {'Outside Dhaka: 2-3 Business Days via express courier.'}</p>
            <p>• {'Cash on Delivery (COD) available across all 64 districts.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
