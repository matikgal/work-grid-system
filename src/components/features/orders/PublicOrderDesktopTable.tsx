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
    <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="sticky left-0 z-10 bg-gray-50 p-3 min-w-[200px] text-xs font-bold uppercase text-gray-600 border-r border-gray-200">
                        Nazwa Produktu
                    </th>
                    {shops.map(n => (
                        <th key={n} className="p-3 min-w-[100px] text-xs font-bold uppercase text-center text-gray-600 border-r border-gray-200 last:border-0">
                            Sklep {n}
                        </th>
                    ))}
                    <th className="p-3 bg-gray-50 text-center font-bold text-xs uppercase text-gray-800 border-l border-gray-200">
                        Suma
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {items.map(item => {
                    let sum = 0;
                    shops.forEach(n => {
                        const shopResp = item.responses?.find((r: ShopResponse) => r.shopId === n.toString());
                        const val = shopResp?.value;
                        const num = parseFloat(val?.replace(',', '.') || '0');
                        if (!isNaN(num)) sum += num;
                    });

                    return (
                        <tr key={item.id} className="group hover:bg-gray-50">
                            <td className="sticky left-0 z-10 bg-white p-3 border-r border-gray-200 font-bold text-gray-900 border-b border-gray-100">
                                {item.name}
                            </td>
                            
                            {shops.map(n => {
                                const shopResp = item.responses?.find((r: ShopResponse) => r.shopId === n.toString());
                                return (
                                    <td key={n} className="p-0 border-r border-gray-200 last:border-0">
                                        <input 
                                            type="text" 
                                            defaultValue={shopResp?.value || ''}
                                            onBlur={(e) => onBlurCell(item.id, n, e.target.value)}
                                            className="w-full h-full p-3 text-center bg-transparent focus:outline-none focus:bg-blue-50 text-gray-800 disabled:text-gray-500 disabled:bg-gray-50/50"
                                            placeholder="-"
                                            disabled={isLocked}
                                        />
                                    </td>
                                );
                            })}
                            
                            <td className="p-3 text-center font-bold text-blue-600 bg-gray-50 border-l border-gray-200">
                                {sum > 0 ? Number(sum.toFixed(2)) : '-'}
                            </td>
                        </tr>
                    );
                })}
                
                {items.length === 0 && (
                    <tr>
                        <td colSpan={15} className="p-8 text-center text-gray-400">
                            Brak danych zamówienia.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
  );
};
