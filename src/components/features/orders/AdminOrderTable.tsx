import React from 'react';
import { Trash2 } from 'lucide-react';
import { Item, ShopResponse } from '../../../types/schemas';

interface AdminOrderTableProps {
  items: Item[];
  shops: number[];
  onBlurName: (itemId: string, value: string) => void;
  onDeleteItem: (itemId: string) => void;
}

export const AdminOrderTable: React.FC<AdminOrderTableProps> = ({ items, shops, onBlurName, onDeleteItem }) => {
  return (
    <div className="max-w-[1920px] mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                        <th className="p-4 min-w-[300px] text-xs font-bold uppercase text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">
                            Nazwa Produktu (Edycja)
                        </th>
                        {shops.map(n => (
                            <th key={n} className="p-4 min-w-[80px] text-xs font-bold uppercase text-center text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 last:border-0 opacity-50">
                                Sklep {n}
                            </th>
                        ))}
                         <th className="p-4 min-w-[80px] text-xs font-bold uppercase text-center text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                            Suma
                        </th>
                        <th className="p-4 w-16 bg-slate-50 dark:bg-slate-950 text-center">
                            Usuń
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map(item => {
                        let sum = 0;
                        shops.forEach(n => {
                            const shopResp = item.responses?.find((r: ShopResponse) => r.shopId === n.toString());
                            const val = shopResp?.value;
                            const num = parseFloat(val?.replace(',', '.') || '0');
                            if (!isNaN(num)) sum += num;
                        });

                        return (
                            <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="p-0 border-r border-slate-200 dark:border-slate-800">
                                    <input 
                                        type="text" 
                                        defaultValue={item.name}
                                        onBlur={e => onBlurName(item.id, e.target.value)}
                                        className="w-full h-full p-4 bg-transparent focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20 font-bold text-slate-800 dark:text-white placeholder-slate-300"
                                        placeholder="Wpisz nazwę produktu..."
                                    />
                                </td>
                                {shops.map(n => {
                                    const shopResp = item.responses?.find((r: ShopResponse) => r.shopId === n.toString());
                                    return (
                                        <td key={n} className="p-4 text-center border-r border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
                                            {shopResp?.value || '-'}
                                        </td>
                                    );
                                })}
                                <td className="p-4 text-center font-bold text-slate-800 dark:text-white bg-slate-50/50 dark:bg-slate-900/50">
                                    {sum > 0 ? sum : '-'}
                                </td>
                                <td className="p-0 text-center">
                                    <button 
                                        onClick={() => onDeleteItem(item.id)}
                                        className="p-4 text-slate-300 hover:text-red-500 transition-colors w-full h-full flex items-center justify-center"
                                        title="Usuń wiersz"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
  );
};
