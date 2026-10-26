import React from 'react';
import Image from 'next/image';
import { Eye, Trash, Truck, Package } from 'lucide-react';
import type { ReturnRequest } from '@/store/useReturnStore';
import { ResponsiveTableContainer } from '@/components/ui/ResponsiveTableContainer';
import { TH, TD, TR } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { formatBDT } from '@/lib/formatCurrency';
import { getReturnItemName, getReturnItemImage } from '@/lib/returns/returnItemDisplay';
import { getReturnShippingDetails } from '../returns/returnCalc';

export interface ReturnsTableProps {
  returns: ReturnRequest[];
  onSelectReturn: (req: ReturnRequest) => void;
  onDeleteReturn: (req: ReturnRequest) => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export const ReturnsTable: React.FC<ReturnsTableProps> = ({
  returns,
  onSelectReturn,
  onDeleteReturn,
  hasMore,
  isLoadingMore,
  onLoadMore,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col font-sans">
      <ResponsiveTableContainer>
        <div className="min-w-[950px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="px-3 py-2.5 text-left">Return ID / Order</th>
                <th className="px-3 py-2.5 text-left">Customer</th>
                <th className="px-3 py-2.5 text-left">Item Preview</th>
                <th className="px-3 py-2.5 text-left">Reason</th>
                <th className="px-3 py-2.5 text-left">Shipping Review</th>
                <th className="px-3 py-2.5 text-left">Net Refund</th>
                <th className="px-3 py-2.5 text-left">Status</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-zinc-400 text-xs">
                    No return requests found matching the current filter.
                  </td>
                </tr>
              ) : (
                returns.map((req) => {
                  const firstItem = req.items?.[0];
                  const itemName = firstItem ? getReturnItemName(firstItem) : 'Returned Item';
                  const itemImage = firstItem ? getReturnItemImage(firstItem) : null;
                  const { netRefund } = getReturnShippingDetails(req);
                  const isPending = req.status === 'Pending';
                  const isApproved = req.status === 'Approved';
                  const isCompleted = req.status === 'Completed';

                  return (
                    <TR key={req.id}>
                      <TD>
                        <div>
                          <span className="font-bold text-zinc-900 font-mono text-xs">#{req.id.slice(0, 8)}</span>
                          <p className="text-2xs text-zinc-400 font-mono">Order: #{req.orderId.slice(0, 8)}</p>
                        </div>
                      </TD>
                      <TD>
                        <div>
                          <p className="font-bold text-zinc-800 text-xs">{req.customerName}</p>
                          <p className="text-2xs text-zinc-500 font-mono">{req.phone}</p>
                        </div>
                      </TD>
                      <TD>
                        <div className="flex items-center gap-2 max-w-[200px]">
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 relative overflow-hidden shrink-0 border border-zinc-200">
                            {itemImage ? (
                              <Image
                                src={itemImage}
                                alt={itemName}
                                fill
                                className="object-cover"
                                sizes="36px"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <span className="text-2xs font-bold text-zinc-800 truncate" title={itemName}>
                            {itemName}
                          </span>
                        </div>
                      </TD>
                      <TD>
                        <span className="text-2xs font-semibold text-zinc-700 truncate max-w-[150px] block" title={req.reason}>
                          {req.reason}
                        </span>
                      </TD>
                      <TD>
                        <span className={`px-2 py-0.5 rounded-lg text-2xs font-bold inline-flex items-center gap-1 ${
                          req.shippingReview === 'waived'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.shippingReview === 'applied'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          <Truck className="w-3 h-3" />
                          {req.shippingReview === 'waived' ? 'Waived' : req.shippingReview === 'applied' ? 'Applied' : 'Pending Review'}
                        </span>
                      </TD>
                      <TD>
                        <span className="font-bold font-mono text-emerald-600 text-xs">
                          {formatBDT(netRefund)}
                        </span>
                      </TD>
                      <TD>
                        <span className={`px-2 py-0.5 rounded-full text-2xs font-black ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isApproved
                            ? 'bg-blue-100 text-blue-800'
                            : isPending
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {req.status}
                        </span>
                      </TD>
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectReturn(req)}
                            className="h-7 w-7 p-0 rounded-lg text-zinc-600 hover:text-primary hover:bg-primary/10"
                            title="Inspect & Process Return"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteReturn(req)}
                            className="h-7 w-7 p-0 rounded-lg text-zinc-600 hover:text-red-600 hover:bg-red-50"
                            title="Delete Return Record"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </ResponsiveTableContainer>

      {hasMore && (
        <div className="p-4 text-center border-t border-zinc-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="text-xs font-bold rounded-xl"
          >
            {isLoadingMore ? 'Loading more returns...' : 'Load More Returns'}
          </Button>
        </div>
      )}
    </div>
  );
};
