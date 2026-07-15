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
    <div className="dash-glass dash-scroll hidden overflow-x-auto md:block">
        <table className="dash-table">
            <thead className="dash-thead">
                <tr>
                    <th className="dash-th dash-th--sticky-left min-w-[200px]">
                        Nazwa Produktu
                    </th>
                    {shops.map(n => (
                        <th key={n} className="dash-th dash-th--center min-w-[100px]">
                            Sklep {n}
                        </th>
                    ))}
                    <th className="dash-th dash-th--sum">
                        Suma
                    </th>
                </tr>
            </thead>
            <tbody>
                {items.map(item => {
                    let sum = 0;
                    shops.forEach(n => {
                        const shopResp = item.responses?.find((r: ShopResponse) => r.shopId === n.toString());
                        const val = shopResp?.value;
                        const num = parseFloat(val?.replace(',', '.') || '0');
                        if (!isNaN(num)) sum += num;
                    });

                    return (
                        <tr key={item.id} className="group dash-trow">
                            <td className="dash-td dash-td--sticky-left font-semibold text-indigo-950 dark:text-indigo-50">
                                {item.name}
                            </td>

                            {shops.map(n => {
                                const shopResp = item.responses?.find((r: ShopResponse) => r.shopId === n.toString());
                                return (
                                    <td key={n} className="dash-td !p-0 border-r border-indigo-950/[0.06] dark:border-white/[0.06]">
                                        <input
                                            type="text"
                                            defaultValue={shopResp?.value || ''}
                                            onBlur={(e) => onBlurCell(item.id, n, e.target.value)}
                                            className="h-full w-full bg-transparent p-3 text-center text-indigo-950 transition-colors focus:bg-indigo-500/10 focus:outline-none disabled:bg-black/[0.03] disabled:text-indigo-950/40 dark:text-indigo-50 dark:disabled:bg-white/[0.03] dark:disabled:text-indigo-100/40"
                                            placeholder="-"
                                            disabled={isLocked}
                                        />
                                    </td>
                                );
                            })}

                            <td className="dash-td dash-td--sum font-bold text-indigo-700 dark:text-indigo-300">
                                {sum > 0 ? Number(sum.toFixed(2)) : '-'}
                            </td>
                        </tr>
                    );
                })}

                {items.length === 0 && (
                    <tr>
                        <td colSpan={15} className="p-8 text-center text-indigo-950/45 dark:text-indigo-100/45">
                            Brak danych zamówienia.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
  );
};
