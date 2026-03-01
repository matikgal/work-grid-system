import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Clipboard, Printer } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { toast } from 'sonner';
import { 
  useOrder, 
  useOrderItems, 
  useAddItem, 
  useDeleteItem 
} from '../hooks/useOrders';
import { orderService } from '../services/orderService';
import { AdminOrderTable } from '../components/features/orders/AdminOrderTable';
import { PrintOrderReport } from '../components/features/orders/PrintOrderReport';

export const AdminOrderPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    
    // React Query
    const { data: order, isLoading: isOrderLoading, error: orderError } = useOrder(id || '');
    const { data: items = [], isLoading: isItemsLoading } = useOrderItems(id || '');
    
    // Mutations
    const addItemMutation = useAddItem();
    const deleteItemMutation = useDeleteItem();

    const [saving, setSaving] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    
    // Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const handleAddItem = async () => {
        if (!id) return;
        try {
            await addItemMutation.mutateAsync({ orderId: id, name: "Nowy Produkt" });
            toast.success("Dodano nowy produkt");
        } catch (e) {
            console.error(e);
            toast.error("Błąd dodawania produktu");
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
            toast.success("Usunięto produkt");
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (e) {
            console.error("Failed to delete", e);
            toast.error("Nie udało się usunąć produktu");
        }
    };

    const handleBlurName = async (itemId: string, value: string) => {
        if (!id) return;
        setSaving(true);
        try {
            await orderService.updateItemName(itemId, value);
        } catch (e) {
            console.error("Failed to save", e);
            toast.error("Błąd zapisu nazwy produktu");
        } finally {
            setSaving(false);
        }
    };

    const shops = Array.from({ length: 13 }, (_, i) => i + 1);

    const copyToClipboard = () => {
        const tableHtml = `
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <thead>
                    <tr>
                        <th style="background-color: #f3f4f6; padding: 8px; text-align: left; border: 1px solid #d1d5db;">Nazwa Produktu</th>
                        ${shops.map(n => `<th style="background-color: #f3f4f6; padding: 8px; text-align: center; border: 1px solid #d1d5db;">Sklep ${n}</th>`).join('')}
                        <th style="background-color: #f3f4f6; padding: 8px; text-align: center; border: 1px solid #d1d5db;">Suma</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => {
                        let sum = 0;
                        shops.forEach(n => {
                            const shopResp = item.responses?.find(r => r.shopId === n.toString());
                            const val = shopResp?.value;
                            const num = parseFloat(val?.replace(',', '.') || '0');
                            if (!isNaN(num)) sum += num;
                        });
                        return `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #d1d5db;">${item.name}</td>
                                ${shops.map(n => {
                                    const shopResp = item.responses?.find(r => r.shopId === n.toString());
                                    return `<td style="padding: 8px; text-align: center; border: 1px solid #d1d5db;">${shopResp?.value || ''}</td>`
                                }).join('')}
                                <td style="padding: 8px; text-align: center; border: 1px solid #d1d5db; font-weight: bold;">${sum > 0 ? sum : ''}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        try {
            const blobHtml = new Blob([tableHtml], { type: 'text/html' });
            const blobText = new Blob([items.map(i => i.name).join('\n')], { type: 'text/plain' });
            if (typeof ClipboardItem !== 'undefined') {
                const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
                navigator.clipboard.write(data).then(() => {
                    toast.success('Tabela skopiowana do schowka! Możesz wkleić do Outlooka/Excela.');
                }).catch(err => {
                    throw err;
                });
            } else {
                 toast.error('Twoja przeglądarka nie wspiera kopiowania Rich Text');
            }
        } catch(err) {
            console.error('Failed to copy: ', err);
            toast.error('Błąd kopiowania');
        }
    };

    const handlePrint = () => setIsPrinting(true);

    useEffect(() => {
        if (isPrinting) {
            const timer = setTimeout(() => { window.print(); setIsPrinting(false); }, 150);
            return () => clearTimeout(timer);
        }
    }, [isPrinting]);

    if (isOrderLoading || isItemsLoading) return <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-500">Ładowanie zamówienia...</div>;
    if (orderError && !order) return <div className="flex items-center justify-center h-screen bg-slate-50 text-red-500">Błąd ładowania lub brak zamówienia.</div>;

    return (
        <MainLayout pageTitle="Edycja Zamówienia">
            <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex-none flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                             <Link to="/orders" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </Link>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                                Edycja: {order?.name}
                            </h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 ml-11">
                            Zarządzaj strukturą tabeli – dodawaj, usuwaj produkty i edytuj ich nazwy przed udostępnieniem.
                        </p>
                    </div>
                     <div className="flex items-center gap-3">
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors text-sm font-medium border border-slate-200 dark:border-slate-700"
                        >
                            <Clipboard className="w-4 h-4" />
                            <span className="hidden sm:inline">Kopiuj</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors text-sm font-medium border border-slate-200 dark:border-slate-700"
                            title="Drukuj zamówienie jako A4"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="hidden sm:inline">Drukuj</span>
                        </button>
                        {saving && <span className="text-blue-600 font-medium text-sm animate-pulse">Zapisywanie...</span>}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <AdminOrderTable 
                      items={items} 
                      shops={shops} 
                      onBlurName={handleBlurName} 
                      onDeleteItem={initiateDelete} 
                    />

                    <div className="mt-6">
                         <button 
                            onClick={handleAddItem}
                            disabled={addItemMutation.isPending}
                            className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            Dodaj kolejny produkt
                        </button>
                    </div>

                    {isPrinting && (
                        <PrintOrderReport
                            orderName={order?.name || 'Zamówienie'}
                            items={items}
                            shops={shops}
                        />
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
