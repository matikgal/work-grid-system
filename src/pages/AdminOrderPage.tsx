import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Clipboard, Printer, Trash2 } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { toast } from 'sonner';
import { useOrder, useOrderItems, useAddItem, useDeleteItem } from '../hooks/useOrders';
import { orderService } from '../services/orderService';
import { getOrderShopNumbers } from '../config/app';
import { PrintOrderReport } from '../components/features/orders/PrintOrderReport';
import { Item, ShopResponse } from '../types/schemas';

export const AdminOrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading: isOrderLoading, error: orderError } = useOrder(id || '');
  const { data: items = [], isLoading: isItemsLoading } = useOrderItems(id || '');

  const addItemMutation = useAddItem();
  const deleteItemMutation = useDeleteItem();

  const [saving, setSaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleAddItem = async () => {
    if (!id) return;
    try {
      await addItemMutation.mutateAsync({ orderId: id, name: 'Nowy Produkt' });
      toast.success('Dodano nowy produkt');
    } catch (e) {
      console.error(e);
      toast.error('Błąd dodawania produktu');
    }
  };

  const initiateDelete = (itemId: string) => {
    setItemToDelete(itemId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete || !id) return;
    try {
      await deleteItemMutation.mutateAsync({ id: itemToDelete, orderId: id });
      toast.success('Usunięto produkt');
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (e) {
      console.error('Failed to delete', e);
      toast.error('Nie udało się usunąć produktu');
    }
  };

  const handleBlurName = async (itemId: string, value: string) => {
    if (!id) return;
    setSaving(true);
    try {
      await orderService.updateItemName(itemId, value);
    } catch (e) {
      console.error('Failed to save', e);
      toast.error('Błąd zapisu nazwy produktu');
    } finally {
      setSaving(false);
    }
  };

  const shops = getOrderShopNumbers();

  const copyToClipboard = () => {
    const tableHtml = `
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <thead>
                    <tr>
                        <th style="background-color: #f3f4f6; padding: 8px; text-align: left; border: 1px solid #d1d5db;">Nazwa Produktu</th>
                        ${shops.map((n) => `<th style="background-color: #f3f4f6; padding: 8px; text-align: center; border: 1px solid #d1d5db;">Sklep ${n}</th>`).join('')}
                        <th style="background-color: #f3f4f6; padding: 8px; text-align: center; border: 1px solid #d1d5db;">Suma</th>
                    </tr>
                </thead>
                <tbody>
                    ${items
                      .map((item) => {
                        let sum = 0;
                        shops.forEach((n) => {
                          const shopResp = item.responses?.find((r) => r.shopId === n.toString());
                          const val = shopResp?.value;
                          const num = parseFloat(val?.replace(',', '.') || '0');
                          if (!isNaN(num)) sum += num;
                        });
                        return `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #d1d5db;">${item.name}</td>
                                ${shops
                                  .map((n) => {
                                    const shopResp = item.responses?.find(
                                      (r) => r.shopId === n.toString(),
                                    );
                                    return `<td style="padding: 8px; text-align: center; border: 1px solid #d1d5db;">${shopResp?.value || ''}</td>`;
                                  })
                                  .join('')}
                                <td style="padding: 8px; text-align: center; border: 1px solid #d1d5db; font-weight: bold;">${sum > 0 ? sum : ''}</td>
                            </tr>
                        `;
                      })
                      .join('')}
                </tbody>
            </table>
        `;

    try {
      const blobHtml = new Blob([tableHtml], { type: 'text/html' });
      const blobText = new Blob([items.map((i) => i.name).join('\n')], { type: 'text/plain' });
      if (typeof ClipboardItem !== 'undefined') {
        const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
        navigator.clipboard
          .write(data)
          .then(() => {
            toast.success('Tabela skopiowana do schowka! Możesz wkleić do Outlooka/Excela.');
          })
          .catch((err) => {
            throw err;
          });
      } else {
        toast.error('Twoja przeglądarka nie wspiera kopiowania Rich Text');
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('Błąd kopiowania');
    }
  };

  const handlePrint = () => setIsPrinting(true);

  useEffect(() => {
    if (isPrinting) {
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isPrinting]);

  if (isOrderLoading || isItemsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-600">
        Ładowanie zamówienia…
      </div>
    );
  }

  if (orderError && !order) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-rose-600">
        Błąd ładowania lub brak zamówienia.
      </div>
    );
  }

  return (
    <MainLayout pageTitle="Edycja Zamówienia">
      <div className="flex h-full min-h-0 flex-col overflow-x-hidden bg-slate-50 text-slate-900">
        <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-3 sm:px-4 md:px-6">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-2 sm:gap-3">
              <Link
                to="/orders"
                className="mt-0.5 shrink-0 cursor-pointer rounded-lg border border-slate-300 p-2 hover:bg-slate-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold sm:text-xl md:text-2xl">
                  Edycja: {order?.name}
                </h1>
                <p className="mt-0.5 text-sm text-slate-600">
                  Dodawaj produkty i edytuj nazwy przed udostępnieniem.
                </p>
              </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-nowrap">
              <button
                type="button"
                onClick={copyToClipboard}
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Clipboard className="h-4 w-4" />
                <span className="hidden sm:inline">Kopiuj</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                title="Drukuj zamówienie jako A4"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Drukuj</span>
              </button>
              {saving && (
                <span className="col-span-2 self-center text-center text-sm font-medium text-slate-500 sm:col-span-1">
                  Zapisywanie…
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <div className="mx-auto max-w-[1600px]">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-base">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100">
                      <th className="sticky left-0 z-10 min-w-[12rem] bg-slate-100 px-3 py-3 font-semibold text-slate-700">
                        Nazwa produktu
                      </th>
                      {shops.map((n) => (
                        <th
                          key={n}
                          className="min-w-[4.5rem] px-2 py-3 text-center text-sm font-semibold text-slate-700"
                        >
                          Sklep {n}
                        </th>
                      ))}
                      <th className="min-w-[5rem] bg-amber-50 px-2 py-3 text-center text-sm font-semibold text-amber-900">
                        Suma
                      </th>
                      <th className="w-12 px-1 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={shops.length + 3}
                          className="px-4 py-10 text-center text-slate-500"
                        >
                          Brak produktów — dodaj pierwszy poniżej.
                        </td>
                      </tr>
                    ) : (
                      items.map((item: Item) => {
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
                            <td className="sticky left-0 z-10 bg-white px-0 py-0">
                              <input
                                type="text"
                                defaultValue={item.name === 'Nowy Produkt' ? '' : item.name}
                                onFocus={(e) => e.target.select()}
                                onBlur={(e) => handleBlurName(item.id, e.target.value)}
                                className="h-full w-full bg-transparent px-3 py-3 font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 focus:bg-slate-50"
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
                                  className="px-2 py-3 text-center text-sm tabular-nums text-slate-500"
                                >
                                  {shopResp?.value || '—'}
                                </td>
                              );
                            })}
                            <td className="bg-amber-50/60 px-2 py-3 text-center font-bold tabular-nums text-amber-950">
                              {sum > 0 ? sum : '—'}
                            </td>
                            <td className="px-1 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => initiateDelete(item.id)}
                                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                title="Usuń wiersz"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddItem}
                disabled={addItemMutation.isPending}
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-sky-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Dodaj kolejny produkt
              </button>
            </div>
          </div>

          {isPrinting && (
            <PrintOrderReport orderName={order?.name || 'Zamówienie'} items={items} shops={shops} />
          )}

          <ConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDelete}
            title="Usuń wiersz"
            message="Czy na pewno chcesz usunąć ten produkt z tabeli? Usunięte zostaną również wszystkie dane wprowadzone przez sklepy dla tego produktu."
            confirmLabel="Usuń"
            variant="danger"
          />
        </div>
      </div>
    </MainLayout>
  );
};
