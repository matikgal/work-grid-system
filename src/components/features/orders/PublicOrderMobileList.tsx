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
    <div className="space-y-5 md:hidden">
        {items.length === 0 ? (
            <div className="dash-glass p-8 text-center text-indigo-950/45 dark:text-indigo-100/45">
                Brak danych zamówienia.
            </div>
        ) : (
            items.map((item, index) => {
                 let sum = 0;
                 shops.forEach(n => {
                     const shopResp = item.responses?.find((r: ShopResponse) => r.shopId === n.toString());
                     const val = shopResp?.value;
                     const num = parseFloat(val?.replace(',', '.') || '0');
                     if (!isNaN(num)) sum += num;
                 });

                return (
                    <div key={item.id} className="dash-glass overflow-hidden">
                        <div className="flex items-center justify-between border-b border-white/40 p-4 dark:border-white/10">
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-indigo-950/40 dark:text-indigo-100/45">
                                    Produkt {index + 1}
                                </label>
                                <div className="break-words text-lg font-semibold">
                                    {item.name}
                                </div>
                            </div>
                             <div className="text-right">
                                <label className="mb-1 block text-xs font-semibold uppercase text-indigo-950/40 dark:text-indigo-100/45">
                                    Suma
                                </label>
                                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-300">
                                     {sum > 0 ? Number(sum.toFixed(2)) : '-'}
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {shops.map(n => {
                                    const shopResp = item.responses?.find((r: ShopResponse) => r.shopId === n.toString());
                                    return (
                                        <div key={n} className="flex flex-col items-center rounded-xl border border-white/50 bg-white/55 p-3 transition-all focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[0.04]">
                                            <label className="mb-1 block text-center text-[10px] font-semibold uppercase text-indigo-950/40 dark:text-indigo-100/45">
                                                Sklep {n}
                                            </label>
                                            <input
                                                type="text"
                                                defaultValue={shopResp?.value || ''}
                                                onBlur={(e) => onBlurCell(item.id, n, e.target.value)}
                                                className="h-10 w-full rounded-md bg-white/70 p-2 text-center font-medium text-indigo-950 focus:bg-white focus:outline-none disabled:bg-black/[0.04] disabled:text-indigo-950/40 dark:bg-white/5 dark:text-indigo-50 dark:disabled:bg-white/[0.03] dark:disabled:text-indigo-100/40"
                                                placeholder="-"
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
