import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { ShoppingCart, ExternalLink, Calendar, Trash2 } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { orderService, Order } from '../services/orderService';
import { cn } from '../utils';

interface OrdersPageProps {
  session: Session;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ session }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [session.user.id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders(session.user.id);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    setError(null);
    try {
        const order = await orderService.createOrder(newName, session.user.id);
        setOrders(prev => [order, ...prev]);
        setNewName('');
    } catch (e) {
        console.error("Error creating order:", e);
        setError("Wystąpił błąd podczas tworzenia zamówienia. Upewnij się, że tabele w bazie danych zostały utworzone.");
    } finally {
        setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
      if (!confirm('Czy na pewno chcesz usunąć to zamówienie?')) return;
      try {
          await orderService.deleteOrder(id);
          setOrders(prev => prev.filter(o => o.id !== id));
      } catch (e) {
          console.error("Error deleting order:", e);
      }
  };

  const getPublicLink = (id: string, name: string) => {
      // In development: http://localhost:5173/order/:id
      // In production: https://matikgal.github.io/work-grid-system/#/order/:id
      // Since using HashRouter or similar, check usage. Assuming HashRouter based on previous gh-pages deploy.
      // But standard Vite + React Router might be History API.
      // Let's use window.location.origin + pathname
      
      const baseUrl = window.location.href.split('#')[0]; // simple hack if hash router
      const hashPart = `#/order/${id}`;
      return `${baseUrl}${hashPart}`;
  };

  return (
    <MainLayout>
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-6 h-6 text-brand-600" />
                    Zamówienia
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Twórz i udostępniaj listy zamówień dla sklepów.</p>
            </div>

            <div className="p-6 max-w-4xl mx-auto w-full">
                {/* Create New */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
                    <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Nowe zamówienie</h2>
                    <div className="flex gap-4">
                        <input 
                            type="text" 
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Nazwa zamówienia"
                            className="flex-1 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            onKeyDown={e => e.key === 'Enter' && handleCreate()}
                        />
                        <button 
                            onClick={handleCreate}
                            disabled={!newName.trim() || isCreating}
                            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            {isCreating ? 'Tworzenie...' : 'Utwórz'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
                </div>

                {/* List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Historia zamówień</h2>
                    
                    {loading ? (
                        <div className="text-center p-8 text-slate-400">Ładowanie...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center p-8 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            Brak utworzonych zamówień.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {orders.map(order => {
                                const link = getPublicLink(order.id, order.name);
                                return (
                                    <div key={order.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center gap-4 group">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{order.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <a 
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Otwórz
                                            </a>
                                            <button 
                                                onClick={() => handleDelete(order.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Usuń"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </MainLayout>
  );
};
