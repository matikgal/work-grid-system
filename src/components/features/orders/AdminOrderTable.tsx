import React from "react";
import { Trash2 } from "lucide-react";
import { Item, ShopResponse } from "../../../types/schemas";

interface AdminOrderTableProps {
  items: Item[];
  shops: number[];
  onBlurName: (itemId: string, value: string) => void;
  onDeleteItem: (itemId: string) => void;
}

export const AdminOrderTable: React.FC<AdminOrderTableProps> = ({
  items,
  shops,
  onBlurName,
  onDeleteItem,
}) => {
  return (
    <div className="dash-glass mx-auto max-w-[1920px] overflow-hidden">
      <div className="dash-scroll overflow-x-auto">
        <table className="dash-table">
          <thead className="dash-thead">
            <tr>
              <th className="dash-th min-w-[300px]">
                Nazwa Produktu (Edycja)
              </th>
              {shops.map((n) => (
                <th key={n} className="dash-th dash-th--center min-w-[80px]">
                  Sklep {n}
                </th>
              ))}
              <th className="dash-th dash-th--sum min-w-[80px]">
                Suma
              </th>
              <th className="dash-th dash-th--center w-16">
                Usuń
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
                const val = shopResp?.value;
                const num = parseFloat(val?.replace(",", ".") || "0");
                if (!isNaN(num)) sum += num;
              });

              return (
                <tr key={item.id} className="group dash-trow last:border-0">
                  <td className="dash-td !p-0 border-r border-indigo-950/[0.06] dark:border-white/[0.06]">
                    <input
                      type="text"
                      defaultValue={
                        item.name === "Nowy Produkt" ? "" : item.name
                      }
                      onFocus={(e) => e.target.select()}
                      onBlur={(e) => onBlurName(item.id, e.target.value)}
                      className="h-full w-full bg-transparent p-4 font-semibold text-indigo-950 placeholder:font-normal placeholder:text-indigo-950/30 focus:bg-indigo-500/10 focus:outline-none dark:text-indigo-50 dark:placeholder:text-indigo-100/30"
                      placeholder="Nowy Produkt"
                    />
                  </td>
                  {shops.map((n) => {
                    const shopResp = item.responses?.find(
                      (r: ShopResponse) => r.shopId === n.toString(),
                    );
                    return (
                      <td
                        key={n}
                        className="dash-td dash-td--center border-r border-indigo-950/[0.06] text-sm text-indigo-950/40 dark:border-white/[0.06] dark:text-indigo-100/40"
                      >
                        {shopResp?.value || "-"}
                      </td>
                    );
                  })}
                  <td className="dash-td dash-td--sum font-bold text-indigo-700 dark:text-indigo-300">
                    {sum > 0 ? sum : "-"}
                  </td>
                  <td className="dash-td !p-0 dash-td--center">
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="flex h-full w-full items-center justify-center p-4 text-indigo-950/25 transition-colors hover:text-rose-500 dark:text-indigo-100/25"
                      title="Usuń wiersz"
                    >
                      <Trash2 className="h-4 w-4" />
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
