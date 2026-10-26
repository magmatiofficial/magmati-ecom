'use client';

import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Plus, 
  X, 
  Search, 
  Eye, 
  EyeOff,
  Copy,
  Check,
  FileCode
} from 'lucide-react';
import { useSiteSettingsStore, QuickDealTab } from '@/store/useSiteSettingsStore';
import { useProductStore } from '@/store/useProductStore';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function QuickDealsManager() {
  const {
    quickDeals,
    setQuickDealsTitle,
    addQuickDealTab,
    updateQuickDealTab,
    removeQuickDealTab,
    moveQuickDealTab,
    setQuickDealTabProducts,
  } = useSiteSettingsStore();

  const { products } = useProductStore();

  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<'products' | 'combos' | 'b1g1'>('products');
  const [searchQueryMap, setSearchQueryMap] = useState<Record<string, string>>({});
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const tabs = quickDeals?.tabs || [];

  const productMap = useMemo(() => {
    const map = new Map<string, (typeof products)[0]>();
    (products || []).forEach((p) => {
      map.set(p.id, p);
    });
    return map;
  }, [products]);

  const handleAddTab = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    addQuickDealTab(trimmed, newType);
    setNewLabel('');
    setNewType('products');
  };

  const handleDeleteTab = (tab: QuickDealTab) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Quick Deal Tab',
      message: `Are you sure you want to permanently delete the "${tab.label}" tab?`,
      onConfirm: () => {
        removeQuickDealTab(tab.id);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const buildExportSnippet = (): string => {
    const title = JSON.stringify(quickDeals?.title || 'Quick Deal');
    const tabsLines = (quickDeals?.tabs || [])
      .map((tab) => {
        const effectiveType = tab.type ?? (tab.id === 'b1g1' ? 'b1g1' : tab.id === 'combo' ? 'combos' : 'products');
        const pids = (tab.productIds || []).map((id) => JSON.stringify(id)).join(', ');
        return `    { id: ${JSON.stringify(tab.id)}, label: ${JSON.stringify(tab.label)}, type: ${JSON.stringify(effectiveType)}, enabled: ${tab.enabled ? 'true' : 'false'}, productIds: [${pids}] },`;
      })
      .join('\n');

    return `import type { QuickDealsConfig } from '@/store/useSiteSettingsStore';\n\nexport const QUICK_DEALS_DEFAULT: QuickDealsConfig = {\n  title: ${title},\n  tabs: [\n${tabsLines}\n  ],\n};`;
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-6 space-y-6">
      {/* 1. Card heading + title input + note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 gap-3">
        <div>
          <h4 className="text-base font-bold text-zinc-900">Quick Deals (Tabbed Section)</h4>
          <p className="text-xs text-zinc-500 mt-0.5">Flash Deals is a separate section and is not affected.</p>
        </div>
        <div className="w-full sm:w-72">
          <label className="block text-xs font-semibold text-zinc-600 mb-1">Section Title</label>
          <input
            type="text"
            value={quickDeals?.title || ''}
            onChange={(e) => setQuickDealsTitle(e.target.value)}
            placeholder="Quick Deal"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => setShowExport((prev) => !prev)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold hover:bg-zinc-50"
          >
            <FileCode className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {showExport && (
        <div className="bg-zinc-50 rounded-xl p-3 sm:p-4 border border-zinc-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-zinc-800">Export current Quick Deals</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(buildExportSnippet());
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  // on failure do nothing
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-zinc-50"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-zinc-500">Paste this into data/quickDealsConfig.ts to make it the first-paint default.</p>
          <textarea
            readOnly
            value={buildExportSnippet()}
            rows={Math.min(16, tabs.length + 8)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs text-zinc-800"
            onFocus={(e) => e.currentTarget.select()}
          />
        </div>
      )}

      {/* 2. Add Tab Row */}
      <div className="bg-zinc-50 rounded-xl p-3 sm:p-4 border border-zinc-200/80">
        <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Add New Tab</h5>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTab();
            }}
            placeholder="Tab label (e.g. Best Deals)"
            className="w-full sm:flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as 'products' | 'combos' | 'b1g1')}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white sm:w-44 cursor-pointer"
          >
            <option value="products">Products</option>
            <option value="combos">Combo Deals</option>
            <option value="b1g1">Buy 1 Get 1</option>
          </select>
          <button
            type="button"
            onClick={handleAddTab}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tab</span>
          </button>
        </div>
      </div>

      {/* 3. List of tabs */}
      <div className="space-y-4">
        {tabs.length === 0 ? (
          <div className="text-center py-6 text-sm text-zinc-500 italic bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
            No tabs yet. Add one above.
          </div>
        ) : (
          tabs.map((tab, index) => {
            const effectiveType = tab.type ?? (tab.id === 'b1g1' ? 'b1g1' : tab.id === 'combo' ? 'combos' : 'products');
            const query = (searchQueryMap[tab.id] || '').trim().toLowerCase();
            const selectedSet = new Set(tab.productIds || []);
            const selectedProducts = (tab.productIds || [])
              .map((id) => productMap.get(id))
              .filter((p): p is (typeof products)[0] => Boolean(p));

            const searchResults = query
              ? (products || [])
                  .filter((p) => !selectedSet.has(p.id) && p.name.toLowerCase().includes(query))
                  .slice(0, 8)
              : [];

            return (
              <div
                key={tab.id}
                className="bg-white rounded-xl border border-zinc-200 p-3 sm:p-4 space-y-3 shadow-2xs"
              >
                {/* Tab header / controls */}
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveQuickDealTab(tab.id, 'up')}
                      disabled={index === 0}
                      title="Move Up"
                      className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-600 cursor-pointer"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveQuickDealTab(tab.id, 'down')}
                      disabled={index === tabs.length - 1}
                      title="Move Down"
                      className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-600 cursor-pointer"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateQuickDealTab(tab.id, { enabled: !tab.enabled })}
                      title={tab.enabled ? 'Enabled (Click to disable)' : 'Disabled (Click to enable)'}
                      className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                        tab.enabled
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-zinc-100 border-zinc-300 text-zinc-400 hover:bg-zinc-200'
                      }`}
                    >
                      {tab.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  <input
                    type="text"
                    value={tab.label}
                    onChange={(e) => updateQuickDealTab(tab.id, { label: e.target.value })}
                    placeholder="Tab label"
                    className="w-full sm:flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-primary bg-white"
                  />

                  <select
                    value={effectiveType}
                    onChange={(e) =>
                      updateQuickDealTab(tab.id, {
                        type: e.target.value as 'products' | 'combos' | 'b1g1',
                      })
                    }
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:outline-none focus:border-primary bg-white sm:w-40 cursor-pointer"
                  >
                    <option value="products">Products</option>
                    <option value="combos">Combo Deals</option>
                    <option value="b1g1">Buy 1 Get 1</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDeleteTab(tab)}
                    title="Delete Tab"
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer shrink-0 self-end sm:self-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Tab content area */}
                {effectiveType === 'combos' || effectiveType === 'b1g1' ? (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900 font-medium">
                    Cards come from the Combo Products / Buy 1 Get 1 admin section below.
                  </div>
                ) : (
                  <div className="space-y-2 pt-1 border-t border-zinc-100">
                    {/* Selected chips and count */}
                    <div className="flex items-center justify-between text-xs text-zinc-600 font-semibold">
                      <span>{(tab.productIds || []).length} products selected</span>
                    </div>

                    {selectedProducts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProducts.map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1 text-xs text-zinc-800"
                          >
                            <span className="max-w-[200px] truncate">{p.name}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setQuickDealTabProducts(
                                  tab.id,
                                  (tab.productIds || []).filter((pid) => pid !== p.id)
                                )
                              }
                              className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Remove"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Search & add input */}
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={searchQueryMap[tab.id] || ''}
                        onChange={(e) =>
                          setSearchQueryMap((prev) => ({
                            ...prev,
                            [tab.id]: e.target.value,
                          }))
                        }
                        placeholder="Search products by name to add..."
                        className="w-full rounded-lg border border-zinc-300 pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-primary bg-white"
                      />
                    </div>

                    {/* Search results */}
                    {query && searchResults.length > 0 && (
                      <div className="border border-zinc-200 rounded-lg bg-white divide-y divide-zinc-100 max-h-52 overflow-y-auto">
                        {searchResults.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-2 hover:bg-zinc-50 gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {product.images?.[0] && (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-8 h-8 rounded object-cover shrink-0 border border-zinc-200"
                                />
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-zinc-800 truncate">
                                  {product.name}
                                </p>
                                <p className="text-2xs text-zinc-500">৳{product.price}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setQuickDealTabProducts(tab.id, [
                                  ...(tab.productIds || []),
                                  product.id,
                                ]);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-primary text-white text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {query && searchResults.length === 0 && (
                      <p className="text-xs text-zinc-400 italic">No matching products found.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
