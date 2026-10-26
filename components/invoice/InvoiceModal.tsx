/**
 * @file components/invoice/InvoiceModal.tsx
 * @description Universal, production-ready Printable Invoice Modal for MAGMATI.
 * Serves both Admin Order Fulfillment and Customer Order Receipts.
 * Formatted to fit standard A4 or 80mm thermal receipt paper cleanly when printed.
 */

'use client';

import React from 'react';
import { X, Printer } from 'lucide-react';
import { Order } from '@/store/useOrderStore';

import { directPrintInvoice, getInvoiceContentOnly } from '@/lib/invoicePrintUtils';

interface InvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    directPrintInvoice(order);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto custom-scrollbar print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Container - Styled as Paper Invoice */}
      <div 
        id="invoice-printable-area"
        className="invoice-printable-area printable-invoice bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 md:p-10 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[88dvh] sm:max-h-[90dvh] overflow-y-auto custom-scrollbar print:shadow-none print:border-none print:m-0 print:p-8 print:w-full print:max-w-none text-zinc-900 font-sans"
      >
        
        {/* TOP CONTROLS: Print / Save as PDF, Close (X) (Hidden during printing) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-zinc-200 gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-bold font-mono">
              TAX INVOICE #{order.id}
            </span>
            <span className="text-xs text-zinc-500 hidden sm:inline">
              {'Official Purchase Receipt'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE BODY */}
        <div 
          id="invoice-printable-body" 
          className="pt-6 bg-white text-zinc-900"
          dangerouslySetInnerHTML={{ __html: getInvoiceContentOnly(order) }}
        />

        {/* BOTTOM CLOSE (Hidden in print) */}
        <div className="mt-8 pt-4 border-t border-zinc-200 flex justify-end print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {'Close Invoice'}
          </button>
        </div>

      </div>
    </div>
  );
};
