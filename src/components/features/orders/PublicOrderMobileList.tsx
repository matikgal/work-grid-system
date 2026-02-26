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
    <div className="md:hidden space-y-8">
        {items.length === 0 ? (
            <div className="p-8 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
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
                    <div key={item.id} className="relative">
                        <div className="bg-white p-4 rounded-t-xl shadow-sm border border-gray-200 border-b-0 flex items-center justify-between">
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1 tracking-wider">
                                    Produkt {index + 1}
                                </label>
                                <div className="text-lg font-bold text-gray-900 break-words">
                                    {item.name}
                                </div>
                            </div>
                             <div className="text-right">
                                <label className="text-xs font-bold uppercase text-gray-400 block mb-1">
                                    Suma
                                </label>
                                <div className="text-lg font-bold text-blue-600">
                                     {sum > 0 ? Number(sum.toFixed(2)) : '-'}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50/50 p-4 rounded-b-xl border border-gray-200 shadow-sm">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {shops.map(n => {
                                    const shopResp = item.responses?.find((r: ShopResponse) => r.shopId === n.toString());
                                    return (
                                        <div key={n} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all flex flex-col items-center">
                                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1 text-center">
                                                Sklep {n}
                                            </label>
                                            <input 
                                                type="text" 
                                                defaultValue={shopResp?.value || ''}
                                                onBlur={(e) => onBlurCell(item.id, n, e.target.value)}
                                                className="w-full h-10 p-2 text-center bg-gray-50 rounded-md font-medium text-gray-900 focus:outline-none focus:bg-white disabled:bg-gray-100 disabled:text-gray-500"
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
