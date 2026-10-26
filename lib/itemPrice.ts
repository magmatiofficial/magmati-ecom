export function getItemUnitPrice(item: any): number {
  const candidates = [
    item?.customPrice,
    item?.product?.price,
    item?.price,
    item?.itemRefundTotal && item?.quantity ? item.itemRefundTotal / item.quantity : undefined
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

export function getItemLineTotal(item: any): number {
  const qty = Math.max(1, Number(item?.quantity) || 1);
  return getItemUnitPrice(item) * qty;
}
