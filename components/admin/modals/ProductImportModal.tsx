/**
 * @file components/admin/modals/ProductImportModal.tsx
 * @description Advanced Bulk Product Import Modal.
 * Supports:
 * - Drag-and-drop CSV or JSON file uploads
 * - Raw CSV/JSON text pasting
 * - Immediate validation & preview table
 * - Downloadable Sample CSV Template for Excel
 * - Append vs Replace catalog mode
 */

'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  RefreshCw,
  Table as TableIcon 
} from 'lucide-react';
import { Product } from '@/types';
import { 
  parseProductsCSV, 
  parseProductsJSON, 
  generateSampleProductCSV, 
  downloadFile 
} from '@/lib/dataTransferUtils';

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (products: Product[], mode: 'append' | 'replace') => void;
  
}

export const ProductImportModal: React.FC<ProductImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  }) => {
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [inputMethod, setInputMethod] = useState<'file' | 'text'>('file');
  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const sampleCsv = generateSampleProductCSV();
    downloadFile('sample_magmati_products_template.csv', sampleCsv, 'text/csv;charset=utf-8;');
  };

  const processContent = (content: string, type: 'csv' | 'json') => {
    setIsProcessing(true);
    setErrors([]);
    setParsedProducts([]);

    try {
      let result: { products: Product[]; errors: string[] };
      if (type === 'json' || content.trim().startsWith('[') || content.trim().startsWith('{')) {
        result = parseProductsJSON(content);
      } else {
        result = parseProductsCSV(content);
      }

      setParsedProducts(result.products);
      setErrors(result.errors);
    } catch (err: any) {
      setErrors([`Failed to process file: ${err.message}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const isJson = file.name.endsWith('.json');
      processContent(content, isJson ? 'json' : 'csv');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const isJson = file.name.endsWith('.json');
      processContent(content, isJson ? 'json' : 'csv');
    };
    reader.readAsText(file);
  };

  const handleTextParse = () => {
    if (!rawText.trim()) {
      setErrors(['Please paste some CSV or JSON text.']);
      return;
    }
    const isJson = rawText.trim().startsWith('[') || rawText.trim().startsWith('{');
    processContent(rawText, isJson ? 'json' : 'csv');
  };

  const handleSubmit = () => {
    if (parsedProducts.length === 0) return;

    onImportSuccess(parsedProducts, importMode);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFileName('');
    setRawText('');
    setParsedProducts([]);
    setErrors([]);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto custom-scrollbar">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 md:p-8 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[88dvh] sm:max-h-[90dvh] overflow-y-auto custom-scrollbar text-zinc-900 font-sans">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-zinc-900">
                {'Bulk Product Import (CSV / JSON)'}
              </h3>
              <p className="text-xs text-zinc-500">
                {'Bulk upload products from spreadsheets or backup files'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLS BAR: TEMPLATE DOWNLOAD & INPUT METHOD TABS */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 pb-2">
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setInputMethod('file')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                inputMethod === 'file' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {'File Upload'}
            </button>
            <button
              type="button"
              onClick={() => setInputMethod('text')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                inputMethod === 'text' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {'Paste CSV/JSON'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>{'Download Sample CSV'}</span>
          </button>
        </div>

        {/* INPUT SECTION */}
        {inputMethod === 'file' ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-2 border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-primary bg-red-50/30'
                : fileName
                ? 'border-emerald-400 bg-emerald-50/20'
                : 'border-zinc-300 hover:border-primary/60 bg-zinc-50/50 hover:bg-zinc-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,text/csv,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 mb-3">
              {fileName ? <FileText className="w-6 h-6 text-emerald-600" /> : <Upload className="w-6 h-6 text-zinc-400" />}
            </div>
            {fileName ? (
              <div>
                <p className="text-sm font-bold text-emerald-800">{fileName}</p>
                <p className="text-xs text-zinc-500 mt-1">Click or drag another file to replace</p>
              </div>
            ) : (
              <div>
                <p className="text-xs sm:text-sm font-bold text-zinc-800">
                  {'Drag and drop your CSV or JSON file here'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {'or click to browse from computer'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste CSV rows (Name, Price, Category...) or JSON array here..."
              rows={6}
              className="w-full p-3 font-mono text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={handleTextParse}
              className="px-4 py-1.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Parse Data
            </button>
          </div>
        )}

        {/* PARSING ERRORS NOTIFICATION */}
        {errors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errors.length} Notice(s) Found:</span>
            </div>
            <ul className="text-xs text-red-700 list-disc pl-5 max-h-24 overflow-y-auto space-y-0.5">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* SUCCESSFUL PARSING PREVIEW */}
        {parsedProducts.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-zinc-900">
                  {parsedProducts.length} {'Products ready to import'}
                </span>
              </div>
              <span className="text-2xs text-zinc-500">Previewing first 3 rows:</span>
            </div>

            {/* Compact Preview Table */}
            <div className="border border-zinc-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 text-zinc-600 font-bold uppercase text-2xs tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3">Product Name</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Price</th>
                    <th className="py-2 px-3 text-center">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {parsedProducts.slice(0, 3).map((p, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-3 font-mono text-zinc-500 text-2xs">{p.sku || 'N/A'}</td>
                      <td className="py-1.5 px-3 font-bold text-zinc-900 line-clamp-1">{p.name}</td>
                      <td className="py-1.5 px-3 text-zinc-600 text-2xs">{p.category}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-zinc-900">৳{p.price}</td>
                      <td className="py-1.5 px-3 text-center font-mono text-zinc-700">{p.stockQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* IMPORT MODE SELECTION */}
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-zinc-900 block">
                  {'Import Destination Mode:'}
                </span>
                <span className="text-2xs text-zinc-500">
                  {importMode === 'append'
                    ? ('Keeps existing products and prepends these new items')
                    : ('Replaces entire existing catalog with these items')}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-primary focus:ring-primary"
                  />
                  <span>{'Append (Add)'}</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-bold text-red-600 cursor-pointer ml-3">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-red-600 focus:ring-red-600"
                  />
                  <span>{'Replace All'}</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ACTIONS */}
        <div className="flex items-center justify-between pt-5 border-t border-zinc-100 mt-6">
          <button
            type="button"
            onClick={() => { handleReset(); onClose(); }}
            className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {'Cancel'}
          </button>

          <button
            type="button"
            disabled={parsedProducts.length === 0 || isProcessing}
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Confirm Import ({parsedProducts.length})
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
