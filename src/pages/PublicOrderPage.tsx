import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { orderService, Order, OrderItem } from '../services/orderService';
import { supabase } from '../lib/supabase';
import { cn } from '../utils';
import { toast } from 'sonner';

export const PublicOrderPage: React.FC = () => {
    const { token } = useParams<{ token: string }>(); // token is the orderId
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            fetchData(token);

            // 1. Realtime Subscription (Fastest)
            const channel = supabase
                .channel(`order_updates_${token}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'orders',
                        filter: `id=eq.${token}`,
                    },
                    (payload) => {
                        const newOrder = payload.new as any; 
                        if (newOrder) {
                            setOrder((prev) => {
                                if (prev?.isLocked !== newOrder.is_locked) {
                                    if (newOrder.is_locked) toast.info("Zamówienie zostało zablokowane przez administratora");
                                    return prev ? { ...prev, isLocked: newOrder.is_locked } : null;
                                }
                                return prev;
                            });
                        }
                    }
                )
                .subscribe();

            // 2. Polling Fallback (Reliable)
            // Checks every 2 seconds to ensure state is synced even if Realtime fails
            const intervalId = setInterval(async () => {
                try {
                    const isLocked = await orderService.getOrderLockStatus(token);
                    setOrder(prev => {
                        if (prev && prev.isLocked !== isLocked) {
                            if (isLocked) toast.info("Zamówienie zostało zablokowane.");
                            return { ...prev, isLocked };
                        }
                        return prev;
                    });
                } catch (error) {
                    console.error("Error polling order status", error);
                }
            }, 2000);

            return () => {
                supabase.removeChannel(channel);
                clearInterval(intervalId);
            };
        }
    }, [token]);

    const fetchData = async (id: string) => {
        try {
            setLoading(true);
            const orderData = await orderService.getOrderById(id);
            if (!orderData) throw new Error("Order not found");
            setOrder(orderData);
            
            const itemsData = await orderService.getOrderItems(id);
            setItems(itemsData);
        } catch (e) {
            console.error(e);
            setError("Nie znaleziono zamówienia lub wystąpił błąd.");
            toast.error("Nie znaleziono zamówienia");
        } finally {
            setLoading(false);
        }
    };

    const handleBlur = async (id: string, field: keyof OrderItem, value: string) => {
        if (!token || order?.isLocked) return;
        
        setSaving(true);
        try {
            await orderService.updateItem(id, { [field]: value });
            // For auto-save, we don't spam toasts, maybe just the indicator is enough OR a very subtle toast.
            // But user asked to remove "alerts".
            // Let's rely on the "Zapisywanie..." indicator which is cleaner for auto-save.
        } catch (e: any) {
            console.error("Failed to save", e);
            if (e.message?.includes("zablokowanego") || e.message?.includes("locked")) {
                 setError("Błąd: Zamówienie zostało zablokowane.");
                 toast.error("Błąd: Zamówienie zablokowane!");
                 // Force update local state if not already done by realtime
                 setOrder(prev => prev ? { ...prev, isLocked: true } : null);
            } else {
                 setError("Błąd zapisu");
                 toast.error("Nie udało się zapisać zmian");
            }
        } finally {
            setSaving(false);
        }
    };

    // Update local state immediately for responsiveness
    const handleLocalChange = (id: string, field: keyof OrderItem, value: string) => {
        if (order?.isLocked) return; // Prevent typing if locked
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
        if (error) setError('');
    }

    if (loading) return <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-500">Ładowanie zamówienia...</div>;
    if (error && !order) return <div className="flex items-center justify-center h-screen bg-slate-50 text-red-500">{error || "Błąd"}</div>;

    const shops = Array.from({ length: 13 }, (_, i) => i + 1);
    const isLocked = order?.isLocked || false;

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1920px] mx-auto p-4 md:p-8">
                {/* Header */}
                <div className="mb-6 border-b border-gray-200 pb-4 flex items-center justify-between sticky top-0 bg-white z-20 py-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {order?.name}
                            {isLocked && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full border border-red-200 flex items-center gap-1 animate-in zoom-in"><Lock className="w-3 h-3"/> ZAKOŃCZONE</span>}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {isLocked 
                                ? "Edycja została zablokowana. To zamówienie jest zakończone." 
                                : "Uzupełnij dane. Zmiany są zapisywane automatycznie."}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {saving && <span className="text-blue-600 font-medium text-sm animate-pulse">Zapisywanie...</span>}
                        {error && <span className="text-red-600 font-medium text-sm">{error}</span>}
                    </div>
                </div>

                {/* Desktop View: Table */}
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
                                // Calculate Sum
                                let sum = 0;
                                shops.forEach(n => {
                                    const val = item[`shop${n}` as keyof OrderItem] as string;
                                    // Try to parse number, handle kommas if user types 1,5
                                    const num = parseFloat(val?.replace(',', '.') || '0');
                                    if (!isNaN(num)) sum += num;
                                });

                                return (
                                    <tr key={item.id} className="group hover:bg-gray-50">
                                        {/* Name Column - Read Only */}
                                        <td className="sticky left-0 z-10 bg-white p-3 border-r border-gray-200 font-bold text-gray-900 border-b border-gray-100">
                                            {item.name}
                                        </td>
                                        
                                        {/* Shop Columns - Editable */}
                                        {shops.map(n => {
                                            const key = `shop${n}` as keyof OrderItem;
                                            return (
                                                <td key={n} className="p-0 border-r border-gray-200 last:border-0">
                                                    <input 
                                                        type="text" 
                                                        value={item[key] || ''}
                                                        onChange={(e) => handleLocalChange(item.id, key, e.target.value)}
                                                        onBlur={(e) => handleBlur(item.id, key, e.target.value)}
                                                        className="w-full h-full p-3 text-center bg-transparent focus:outline-none focus:bg-blue-50 text-gray-800 disabled:text-gray-500 disabled:bg-gray-50/50"
                                                        placeholder="-"
                                                        disabled={isLocked}
                                                    />
                                                </td>
                                            );
                                        })}
                                        
                                        {/* Sum Column */}
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

                {/* Mobile View: Cards/Grid */}
                <div className="md:hidden space-y-8">
                    {items.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
                            Brak danych zamówienia.
                        </div>
                    ) : (
                        items.map((item, index) => {
                             let sum = 0;
                             shops.forEach(n => {
                                 const val = item[`shop${n}` as keyof OrderItem] as string;
                                 const num = parseFloat(val?.replace(',', '.') || '0');
                                 if (!isNaN(num)) sum += num;
                             });

                            return (
                                <div key={item.id} className="relative">
                                    {/* Product Name Card */}
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

                                    {/* Shops Grid */}
                                    <div className="bg-gray-50/50 p-4 rounded-b-xl border border-gray-200 shadow-sm">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {shops.map(n => {
                                                const key = `shop${n}` as keyof OrderItem;
                                                return (
                                                    <div key={n} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                                                        <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1 text-center">
                                                            Sklep {n}
                                                        </label>
                                                        <input 
                                                            type="text" 
                                                            value={item[key] || ''}
                                                            onChange={(e) => handleLocalChange(item.id, key, e.target.value)}
                                                            onBlur={(e) => handleBlur(item.id, key, e.target.value)}
                                                            className="w-full p-2 text-center bg-gray-50 rounded-md font-medium text-gray-900 focus:outline-none focus:bg-white disabled:bg-gray-100 disabled:text-gray-500"
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
            </div>
        </div>
    );
};
