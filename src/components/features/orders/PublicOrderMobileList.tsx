import React from 'react';
import { Item, ShopResponse } from '../../../types/schemas';

interface PublicOrderMobileListProps {
  items: Item[];
  shops: number[];
  isLocked: boolean;
  onBlurCell: (itemId: string, shopNumber: number, value: string) => void;
}

export const PublicOrderMobileList: React.FC<PublicOrderMobileListProps> = ({
  items,
  shops,
  isLocked,
  onBlurCell,
}) => {
  return (
    <div className="space-y-3 md:hidden">
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-slate-500">
          Brak danych zamówienia.
        </div>
      ) : (
        items.map((item, index) => {
          let sum = 0;
          shops.forEach((n) => {
            const shopResp = item.responses?.find((r: ShopResponse) => r.shopId === n.toString());
            const num = parseFloat(shopResp?.value?.replace(',', '.') || '0');
            if (!isNaN(num)) sum += num;
          });

          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
                <div className="min-w-0">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Produkt {index + 1}
                  </label>
                  <div className="break-words text-lg font-semibold text-slate-900">
                    {item.name}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">
                    Suma
                  </label>
                  <div className="text-lg font-bold tabular-nums text-amber-900">
                    {sum > 0 ? Number(sum.toFixed(2)) : '—'}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {shops.map((n) => {
                    const shopResp = item.responses?.find(
                      (r: ShopResponse) => r.shopId === n.toString(),
                    );
                    return (
                      <div
                        key={n}
                        className="flex flex-col items-center rounded-lg border border-slate-200 bg-slate-50 p-2.5"
                      >
                        <label className="mb-1 block text-center text-[10px] font-semibold uppercase text-slate-500">
                          Sklep {n}
                        </label>
                        <input
                          type="text"
                          defaultValue={shopResp?.value || ''}
                          onBlur={(e) => onBlurCell(item.id, n, e.target.value)}
                          className="h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-center font-medium tabular-nums text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-100 disabled:text-slate-400"
                          placeholder="—"
                          disabled={isLocked}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
