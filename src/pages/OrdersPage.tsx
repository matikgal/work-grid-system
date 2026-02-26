import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { ShoppingCart } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { toast } from 'sonner';
import { 
  useMyOrders, 
  useDeleteOrder, 
  useUpdateOrderStatus 
} from '../hooks/useOrders';
import { Order } from '../types/schemas';
import { OrderCard } from '../components/features/orders/OrderCard';
import { NewOrderForm } from '../components/features/orders/NewOrderForm';

interface OrdersPageProps {
  session: Session;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ session }) => {
  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useMyOrders(session.user.id);
  const deleteOrder = useDeleteOrder();
  const updateStatus = useUpdateOrderStatus();

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
          toast.success('Pomyślnie usunięto zamówienie');
      } catch (e) {
          console.error("Error deleting order:", e);
          toast.error('Nie udało się usunąć zamówienia');
      }
  };

  const handleToggleLock = async (order: Order) => {
      try {
          const newStatus = !order.isLocked;
          await updateStatus.mutateAsync({ id: order.id, isLocked: newStatus });
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

  const getPublicLink = (id: string) => {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const base = import.meta.env.BASE_URL.endsWith('/') 
        ? import.meta.env.BASE_URL.slice(0, -1) 
        : import.meta.env.BASE_URL;
        
      return `${origin}${base}/order/${id}`;
  };

  return (
    <MainLayout pageTitle="Zamówienia">
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex-none">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-6 h-6 text-brand-600" />
                    Zamówienia
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Twórz i udostępniaj listy zamówień dla sklepów.</p>
            </div>

            <div className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full p-4 md:p-6 pb-0">
                <div className="flex-none mb-6 md:mb-8">
                    <NewOrderForm userId={session.user.id} />
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 min-h-0 px-1 pb-6">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 py-2">Historia zamówień</h2>
                    
                    {isLoading ? (
                        <div className="text-center p-8 text-slate-400">Ładowanie...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center p-8 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            Brak utworzonych zamówień.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {orders.map((order: any) => {
                                const link = getPublicLink(order.id);
                                const filledCount = order.items?.reduce((acc: number, item: any) => acc + (item.responses?.length || 0), 0) || 0;
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
