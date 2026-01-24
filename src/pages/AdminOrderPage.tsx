import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Home } from 'lucide-react';
import { orderService, Order, OrderItem } from '../services/orderService';
import { MainLayout } from '../components/layout/MainLayout';

import { ConfirmModal } from '../components/ConfirmModal';
import { toast } from 'sonner';

export const AdminOrderPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingRow, setAddingRow] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    
    // Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchData(id);
    }, [id]);

    const fetchData = async (orderId: string) => {
        try {
            setLoading(true);
            const orderData = await orderService.getOrderById(orderId);
            if (!orderData) throw new Error("Order not found");
            setOrder(orderData);
            
            const itemsData = await orderService.getOrderItems(orderId);
            setItems(itemsData);
        } catch (e) {
            console.error(e);
            setError("Nie znaleziono zamówienia lub wystąpił błąd.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async () => {
        if (!id) return;
        setAddingRow(true);
        try {
            await orderService.addItem(id, "");
            await fetchData(id);
            toast.success("Dodano nowy produkt");
        } catch (e) {
            console.error(e);
            toast.error("Błąd dodawania produktu");
        } finally {
            setAddingRow(false);
        }
    };

    const initiateDelete = (itemId: string) => {
        setItemToDelete(itemId);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await orderService.deleteItem(itemToDelete);
            setItems(prev => prev.filter(i => i.id !== itemToDelete));
            toast.success("Usunięto produkt");
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (e) {
            console.error("Failed to delete", e);
            toast.error("Nie udało się usunąć produktu");
        }
    };

    const handleBlur = async (itemId: string, field: keyof OrderItem, value: string) => {
        if (!id) return;
        setSaving(true);
        try {
            await orderService.updateItem(itemId, { [field]: value });
            // Optional: toast.success("Zapisano"); - maybe too noisy for auto-save, let's keep it silent or minimal
        } catch (e) {
            console.error("Failed to save", e);
            toast.error("Błąd zapisu");
        } finally {
            setSaving(false);
        }
    };

    const handleLocalChange = (itemId: string, field: keyof OrderItem, value: string) => {
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, [field]: value } : item));
        if (error) setError('');
    }

    if (loading) return <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-500">Ładowanie zamówienia...</div>;
    if (error && !order) return <div className="flex items-center justify-center h-screen bg-slate-50 text-red-500">{error || "Błąd"}</div>;

    const shops = Array.from({ length: 13 }, (_, i) => i + 1);

    return (
        <MainLayout>
            <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
                {/* Header */}
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
                            Tutaj możesz zarządzać strukturą zamówienia (dodawać/usuwać produkty i zmieniać ich nazwy).
                        </p>
                    </div>
                     <div className="flex items-center gap-4">
                        {saving && <span className="text-blue-600 font-medium text-sm animate-pulse">Zapisywanie...</span>}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
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
                                        {/* Sum Column Header - Placeholder since values are read-only here for context */}
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
                                         // Mock calc sum for display context
                                        let sum = 0;
                                        shops.forEach(n => {
                                            const val = item[`shop${n}` as keyof OrderItem] as string;
                                            const num = parseFloat(val?.replace(',', '.') || '0');
                                            if (!isNaN(num)) sum += num;
                                        });

                                        return (
                                            <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="p-0 border-r border-slate-200 dark:border-slate-800">
                                                    <input 
                                                        type="text" 
                                                        value={item.name}
                                                        onChange={e => handleLocalChange(item.id, 'name', e.target.value)}
                                                        onBlur={e => handleBlur(item.id, 'name', e.target.value)}
                                                        className="w-full h-full p-4 bg-transparent focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20 font-bold text-slate-800 dark:text-white placeholder-slate-300"
                                                        placeholder="Wpisz nazwę produktu..."
                                                    />
                                                </td>
                                                {shops.map(n => (
                                                    <td key={n} className="p-4 text-center border-r border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
                                                        {item[`shop${n}` as keyof OrderItem] || '-'}
                                                    </td>
                                                ))}
                                                <td className="p-4 text-center font-bold text-slate-800 dark:text-white bg-slate-50/50 dark:bg-slate-900/50">
                                                    {sum > 0 ? sum : '-'}
                                                </td>
                                                <td className="p-0 text-center">
                                                    <button 
                                                        onClick={() => initiateDelete(item.id)}
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

                    <div className="mt-6">
                         <button 
                            onClick={handleAddItem}
                            disabled={addingRow}
                            className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            Dodaj kolejny produkt
                        </button>
                    </div>

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
