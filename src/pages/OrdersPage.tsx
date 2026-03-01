import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Plus, ShoppingCart } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { toast } from 'sonner';
import { 
  useMyOrders, 
  useCreateOrder,
  useDeleteOrder, 
  useUpdateOrderStatus 
} from '../hooks/useOrders';
import { Order } from '../types/schemas';
import { OrderCard } from '../components/features/orders/OrderCard';
import { PageBackgroundPattern } from '../components/shared/PageBackgroundPattern';
import { PageFooter } from '../components/shared/PageFooter';

interface OrdersPageProps {
  session: Session;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ session }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  // Inline create state
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useMyOrders(session.user.id);
  const createOrder = useCreateOrder();
  const deleteOrder = useDeleteOrder();
  const updateStatus = useUpdateOrderStatus();

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreateError(null);
    try {
      await createOrder.mutateAsync({ name: newName, userId: session.user.id });
      setNewName('');
      toast.success('Utworzono nowe zamówienie');
    } catch (e) {
      setCreateError('Błąd połączenia z serwerem.');
      toast.error('Błąd tworzenia zamówienia');
    }
  };

  const initiateDelete = (id: string) => {
    setOrderToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await deleteOrder.mutateAsync(orderToDelete);
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
      toast.success('Zamówienie usunięte');
    } catch (e) {
      toast.error('Nie udało się usunąć zamówienia');
    }
  };

  const handleToggleLock = async (order: Order) => {
    try {
      const newStatus = !order.isLocked;
      await updateStatus.mutateAsync({ id: order.id, isLocked: newStatus });
      toast.success(newStatus ? 'Zamówienie zablokowane' : 'Zamówienie odblokowane');
    } catch (e) {
      toast.error('Błąd zmiany statusu');
    }
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link skopiowany do schowka!');
    } catch (e) {
      toast.error('Nie udało się skopiować linku');
    }
  };

  const getPublicLink = (id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const base = import.meta.env.BASE_URL.endsWith('/') 
      ? import.meta.env.BASE_URL.slice(0, -1) 
      : import.meta.env.BASE_URL;
    return `${origin}${base}/order/${id}`;
  };

  return (
<MainLayout pageTitle="Zamówienia">
      <div className="relative h-full w-full bg-[#FAFAFA] dark:bg-slate-950 overflow-hidden flex flex-col">
        <PageBackgroundPattern />

        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col min-h-0 relative z-10">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
                <div className="hidden md:block">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Zamówienia</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">Masz <span className="font-bold text-brand-600 dark:text-brand-400">{orders.length}</span> zamówień w systemie.</p>
                </div>
                
                {/* Inline Create Form */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <input 
                        type="text" 
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Nazwa np. nabiał 28.02"
                        onKeyDown={e => e.key === 'Enter' && handleCreate()}
                        className="w-full sm:w-64 pl-4 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder:text-slate-400 font-medium shadow-sm"
                    />
                    <button 
                        onClick={handleCreate}
                        disabled={!newName.trim() || createOrder.isPending}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-md active:scale-95 whitespace-nowrap disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" />
                        {createOrder.isPending ? 'Tworzenie...' : 'Utwórz'}
                    </button>
                </div>
            </div>

            {createError && <p className="text-red-500 text-sm font-medium mb-4 shrink-0">{createError}</p>}

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2 md:pb-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                    </div>
                ) : orders.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        {orders.map((order: Order) => {
                            const link = getPublicLink(order.id);
                            const filledCount = order.items?.reduce((acc: number, item) => acc + (item.responses?.length || 0), 0) || 0;
                            const totalCount = (order.items?.length || 0) * 13;
                            
                            return (
                                <OrderCard 
                                    key={order.id}
                                    order={order}
                                    publicLink={link}
                                    filledCount={filledCount}
                                    totalCount={totalCount}
                                    onCopyLink={handleCopyLink}
                                    onToggleLock={handleToggleLock}
                                    onDelete={initiateDelete}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 mt-8 shadow-sm">
                        <ShoppingCart className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Brak zamówień</h3>
                        <p className="text-sm mt-1">Utwórz nowe zamówienie powyżej.</p>
                    </div>
                )}
            </div>
        </div>

        <ConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDelete}
            title="Usuń zamówienie"
            message="Czy na pewno chcesz bezpowrotnie usunąć to zamówienie? Ta operacja usunie również wszystkie dane wprowadzone przez sklepy."
            confirmLabel="Usuń"
            variant="danger"
        />
        <PageFooter />
      </div>
    </MainLayout>
  );
};
