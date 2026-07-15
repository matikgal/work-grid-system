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
import { getOrderShopNumbers } from '../config/app';
import { AdminOrderTable } from '../components/features/orders/AdminOrderTable';
import { PrintOrderReport } from '../components/features/orders/PrintOrderReport';
import { DashboardBackground } from '../components/dashboard/DashboardBackground';
import '../components/dashboard/dashboard-modern.css';

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

    const shops = getOrderShopNumbers();

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

    if (isOrderLoading || isItemsLoading) return <div className="flex h-screen items-center justify-center bg-[#eef0fb] text-indigo-950/60 dark:bg-[#0a0a14] dark:text-indigo-100/60">Ładowanie zamówienia...</div>;
    if (orderError && !order) return <div className="flex h-screen items-center justify-center bg-[#eef0fb] text-rose-500 dark:bg-[#0a0a14]">Błąd ładowania lub brak zamówienia.</div>;

    return (
        <MainLayout pageTitle="Edycja Zamówienia">
            <div className="dash-modern">
                <DashboardBackground />
                <div className="relative z-10 flex flex-none items-center justify-between border-b border-white/40 bg-white/40 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]">
                    <div>
                        <div className="mb-2 flex items-center gap-4">
                             <Link to="/orders" className="rounded-xl border border-white/55 bg-white/55 p-2 text-indigo-950/60 transition-colors hover:bg-white hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100/60">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Edycja: <span className="dash-gradient-text">{order?.name}</span>
                            </h1>
                        </div>
                        <p className="ml-11 text-sm text-indigo-950/55 dark:text-indigo-100/60">
                            Zarządzaj strukturą tabeli – dodawaj, usuwaj produkty i edytuj ich nazwy przed udostępnieniem.
                        </p>
                    </div>
                     <div className="flex items-center gap-3">
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-2 rounded-xl border border-white/55 bg-white/55 px-3 py-2 text-sm font-medium text-indigo-950/65 transition-all hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-indigo-100/65"
                        >
                            <Clipboard className="h-4 w-4" />
                            <span className="hidden sm:inline">Kopiuj</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 rounded-xl border border-white/55 bg-white/55 px-3 py-2 text-sm font-medium text-indigo-950/65 transition-all hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-indigo-100/65"
                            title="Drukuj zamówienie jako A4"
                        >
                            <Printer className="h-4 w-4" />
                            <span className="hidden sm:inline">Drukuj</span>
                        </button>
                        {saving && <span className="animate-pulse text-sm font-medium text-indigo-600 dark:text-indigo-300">Zapisywanie...</span>}
                    </div>
                </div>

                <div className="dash-scroll relative z-10 min-h-0 flex-1 overflow-y-auto p-6">
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
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-10px_rgba(99,102,241,0.8)] transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4" />
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
