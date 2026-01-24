import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { ShoppingCart, ExternalLink, Calendar, Trash2, Copy, Lock, Unlock, CheckCircle, Edit2 } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { orderService, Order } from '../services/orderService';
import { cn } from '../utils';

import { toast } from 'sonner';

interface OrdersPageProps {
  session: Session;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ session }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

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
      toast.error('Nie udało się pobrać listy zamówień');
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
        toast.success('Utworzono nowe zamówienie');
    } catch (e) {
        console.error("Error creating order:", e);
        setError("Wystąpił błąd podczas tworzenia zamówienia. Upewnij się, że tabele w bazie danych zostały utworzone.");
        toast.error('Błąd tworzenia zamówienia');
    } finally {
        setIsCreating(false);
    }
  };

  const initiateDelete = (id: string) => {
      setOrderToDelete(id);
      setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
      if (!orderToDelete) return;
      try {
          await orderService.deleteOrder(orderToDelete);
          setOrders(prev => prev.filter(o => o.id !== orderToDelete));
          setIsDeleteModalOpen(false);
          setOrderToDelete(null);
          toast.success('Pomyślnie usunięto zamówienie');
      } catch (e) {
          console.error("Error deleting order:", e);
          toast.error('Nie udało się usunąć zamówienia');
      }
  };

  const handleToggleLock = async (order: Order) => {
      try {
          const newStatus = !order.isLocked;
          await orderService.updateOrderStatus(order.id, newStatus);
          setOrders(prev => prev.map(o => o.id === order.id ? { ...o, isLocked: newStatus } : o));
          toast.success(newStatus ? 'Zamówienie zablokowane' : 'Zamówienie odblokowane');
      } catch (e) {
          console.error("Error updating lock status:", e);
          toast.error('Błąd zmiany statusu');
      }
  };

  const handleCopyLink = async (link: string) => {
      try {
          await navigator.clipboard.writeText(link);
          toast.success('Link skopiowany do schowka!');
      } catch (e) {
          console.error("Failed to copy", e);
          toast.error('Nie udało się skopiować linku');
      }
  };

  const getPublicLink = (id: string, name: string) => {
      const origin = window.location.origin;
      const base = import.meta.env.BASE_URL.endsWith('/') 
        ? import.meta.env.BASE_URL.slice(0, -1) 
        : import.meta.env.BASE_URL;
        
      return `${origin}${base}/order/${id}`;
  };

  return (
    <MainLayout>
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Header - Fixed */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex-none">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-6 h-6 text-brand-600" />
                    Zamówienia
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Twórz i udostępniaj listy zamówień dla sklepów.</p>
            </div>

            <div className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full p-4 md:p-6 pb-0">
                {/* Create Section - Fixed at top of content area */}
                <div className="flex-none mb-6 md:mb-8">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Nowe zamówienie</h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input 
                                type="text" 
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="Nazwa zamówienia"
                                className="w-full sm:flex-1 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                            />
                            <button 
                                onClick={handleCreate}
                                disabled={!newName.trim() || isCreating}
                                className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                            >
                                {isCreating ? 'Tworzenie...' : 'Utwórz'}
                            </button>
                        </div>
                        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
                    </div>
                </div>

                {/* History List - Scrollable */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 min-h-0 px-1 pb-6">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 py-2">Historia zamówień</h2>
                    
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
                                    <div key={order.id} className={cn(
                                        "bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border flex flex-col md:flex-row md:items-center gap-4 group transition-colors",
                                        order.isLocked 
                                            ? "border-green-200 dark:border-green-900/30 bg-green-50/30 dark:bg-green-900/10" 
                                            : "border-slate-200 dark:border-slate-800"
                                    )}>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg text-slate-800 dark:text-white break-all">{order.name}</h3>
                                                {order.isLocked && <CheckCircle className="w-5 h-5 text-green-600" />}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 mt-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </div>
                                                {typeof order.filledCount !== 'undefined' && (
                                                    <div className={`text-xs font-bold px-2 py-1 rounded-full ${order.filledCount === order.totalCount ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                        Uzupełniono: {order.filledCount}/{order.totalCount}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                                            <button 
                                                onClick={() => handleCopyLink(link)}
                                                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                                                title="Kopiuj link"
                                            >
                                                <Copy className="w-5 h-5" />
                                            </button>

                                            <Link 
                                                to={`/orders/${order.id}`}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="Edytuj strukturę"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </Link>
                                            
                                            <a 
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Otwórz
                                            </a>
                                            
                                            <button 
                                                onClick={() => handleToggleLock(order)}
                                                className={cn(
                                                    "p-2 rounded-lg transition-colors",
                                                    order.isLocked 
                                                        ? "text-green-600 hover:bg-green-100" 
                                                        : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                                )}
                                                title={order.isLocked ? "Odblokuj" : "Zakończ/Zablokuj"}
                                            >
                                                {order.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                                            </button>

                                            <button 
                                                onClick={() => initiateDelete(order.id)}
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

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Usuń zamówienie"
                message="Czy na pewno chcesz bezpowrotnie usunąć to zamówienie? Ta operacja usunie również wszystkie wprowadzone dane przez sklepy."
                confirmLabel="Usuń"
                variant="danger"
            />
        </div>
    </MainLayout>
  );
};
