import React from 'react';
import { Item, ShopResponse } from '../../../types/schemas';

interface PublicOrderDesktopTableProps {
  items: Item[];
  shops: number[];
  isLocked: boolean;
  onBlurCell: (itemId: string, shopNumber: number, value: string) => void;
}

export const PublicOrderDesktopTable: React.FC<PublicOrderDesktopTableProps> = ({
  items,
  shops,
  isLocked,
  onBlurCell,
}) => {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-base">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100">
              <th className="sticky left-0 z-10 min-w-[12rem] bg-slate-100 px-3 py-3 font-semibold text-slate-700">
                Nazwa produktu
              </th>
              {shops.map((n) => (
                <th
                  key={n}
                  className="min-w-[5rem] px-2 py-3 text-center text-sm font-semibold text-slate-700"
                >
                  Sklep {n}
                </th>
              ))}
              <th className="min-w-[5rem] bg-amber-50 px-2 py-3 text-center text-sm font-semibold text-amber-900">
                Suma
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              let sum = 0;
              shops.forEach((n) => {
                const shopResp = item.responses?.find(
                  (r: ShopResponse) => r.shopId === n.toString(),
                );
                const num = parseFloat(shopResp?.value?.replace(',', '.') || '0');
                if (!isNaN(num)) sum += num;
              });

              return (
                <tr key={item.id} className="border-b border-slate-100 last:border-0">
                  <td className="sticky left-0 z-10 bg-white px-3 py-3 font-semibold text-slate-900">
                    {item.name}
                  </td>
                  {shops.map((n) => {
                    const shopResp = item.responses?.find(
                      (r: ShopResponse) => r.shopId === n.toString(),
                    );
                    return (
                      <td key={n} className="border-r border-slate-100 px-0 py-0">
                        <input
                          type="text"
                          defaultValue={shopResp?.value || ''}
                          onBlur={(e) => onBlurCell(item.id, n, e.target.value)}
                          className="h-full w-full bg-transparent px-2 py-3 text-center tabular-nums text-slate-900 outline-none focus:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400"
                          placeholder="—"
                          disabled={isLocked}
                        />
                      </td>
                    );
                  })}
                  <td className="bg-amber-50/60 px-2 py-3 text-center font-bold tabular-nums text-amber-950">
                    {sum > 0 ? Number(sum.toFixed(2)) : '—'}
                  </td>
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td colSpan={shops.length + 2} className="px-4 py-10 text-center text-slate-500">
                  Brak danych zamówienia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
