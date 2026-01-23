import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { orderService, Order, OrderItem } from '../services/orderService';
import { cn } from '../utils';

export const PublicOrderPage: React.FC = () => {
    const { token } = useParams<{ token: string }>(); // token is the orderId
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingRow, setAddingRow] = useState(false);

    useEffect(() => {
        if (token) fetchData(token);
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
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async () => {
        if (!token) return;
        setAddingRow(true);
        try {
            const newItem = await orderService.addItem(token, "Nowy produkt");
            // Refresh explicitly or just push to state. 
            // Since we need the full object with defaults (nulls), easier to refresh or construct.
            // But Supabase insert returns the object. We need to map it to CamelCase if not auto.
            // orderService.addItem returns the raw DB object or mapped?
            // Checking service... "return data". It's raw.
            // We need to fetch again to be safe with types or map manually.
            await fetchData(token); 
        } catch (e) {
            console.error(e);
        } finally {
            setAddingRow(false);
        }
    };

    const handleUpdateItem = async (id: string, field: string, value: string) => {
        // Optimistic update
        setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

        try {
            // Debounce could be good here, but for now simple onBlur or similar logic.
            // This function is intended to be called onBlur or periodic save.
            await orderService.updateItem(id, { [field]: value });
        } catch (e) {
            console.error("Failed to save", e);
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm("Usunąć ten wiersz?")) return;
        try {
            await orderService.deleteItem(id);
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (e) {
            console.error("Failed to delete", e);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-500">Ładowanie zamówienia...</div>;
    if (error || !order) return <div className="flex items-center justify-center h-screen bg-slate-50 text-red-500">{error || "Błąd"}</div>;

    const shops = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1920px] mx-auto p-4 md:p-8">
                {/* Minimal Header */}
                <div className="mb-6 border-b border-gray-200 pb-4 flex items-baseline justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{order.name}</h1>
                        <p className="text-gray-500 mt-1">Lista zamówień - Sklepy 1-12</p>
                    </div>
                    <div className="text-xs text-gray-400">
                        Stan: Online
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="sticky left-0 z-10 bg-gray-50 p-3 min-w-[200px] text-xs font-bold uppercase text-gray-600 border-r border-gray-200">
                                    Nazwa Produktu
                                </th>
                                {shops.map(n => (
                                    <th key={n} className="p-3 min-w-[80px] text-xs font-bold uppercase text-center text-gray-600 border-r border-gray-200 last:border-0">
                                        Sklep {n}
                                    </th>
                                ))}
                                <th className="p-3 w-10 bg-gray-50"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <tr key={item.id} className="group hover:bg-gray-50">
                                    <td className="sticky left-0 z-10 bg-white p-0 border-r border-gray-200 group-hover:bg-gray-50 transition-colors">
                                        <input 
                                            type="text" 
                                            defaultValue={item.name}
                                            onBlur={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                                            className="w-full h-full p-3 bg-transparent focus:outline-none focus:bg-blue-50 font-medium text-gray-900"
                                            placeholder="Nazwa produktu..."
                                        />
                                    </td>
                                    {shops.map(n => {
                                        const key = `shop${n}` as keyof OrderItem;
                                        return (
                                            <td key={n} className="p-0 border-r border-gray-200 last:border-0">
                                                <input 
                                                    type="text" 
                                                    defaultValue={item[key] || ''}
                                                    onBlur={(e) => handleUpdateItem(item.id, key, e.target.value)}
                                                    className="w-full h-full p-3 text-center bg-transparent focus:outline-none focus:bg-blue-50 text-gray-800"
                                                    placeholder="-"
                                                />
                                            </td>
                                        );
                                    })}
                                    <td className="p-0 text-center bg-white">
                                        <button 
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="p-3 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Usuń wiersz"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {/* Empty State / Add Row helper if empty */}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={14} className="p-8 text-center text-gray-400">
                                        Brak pozycji. Kliknij "Dodaj produkt" poniżej.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                     <button 
                        onClick={handleAddItem}
                        disabled={addingRow}
                        className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" />
                        Dodaj produkt
                    </button>
                </div>
            </div>
        </div>
    );
};
