import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Plus, ShoppingCart } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader } from '../components/shared/PageHeader';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { toast } from 'sonner';
import { 
  useMyOrders, 
  useCreateOrder,
  useDeleteOrder, 
  useUpdateOrderStatus 
} from '../hooks/useOrders';
import { OrderCard } from '../components/features/orders/OrderCard';
import { DashboardBackground } from '../components/dashboard/DashboardBackground';
import { PageFooter } from '../components/shared/PageFooter';
import '../components/dashboard/dashboard-modern.css';
import { buildPublicOrderUrl } from '../lib/orderAccess';
import { Order } from '../types/schemas';
import { APP_CONFIG } from '../config/app';

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

  const handleCopyLink = async (order: Order) => {
    try {
      const link = buildPublicOrderUrl(order.id);
      await navigator.clipboard.writeText(link);
      toast.success('Link skopiowany do schowka!');
    } catch {
      toast.error('Nie udało się skopiować linku');
    }
  };

  const handleOpenPublic = (order: Order) => {
    window.open(buildPublicOrderUrl(order.id), '_blank', 'noopener,noreferrer');
  };

  return (
<MainLayout pageTitle="Zamówienia">
      <div className="dash-modern">
        <DashboardBackground />

        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col p-4 md:p-6">

            {/* Page Header */}
            <PageHeader
              title="Zamówienia"
              icon={ShoppingCart}
              accent="#d97706"
              subtitle={
                <>
                  Masz <span className="font-semibold text-indigo-600 dark:text-indigo-300">{orders.length}</span> zamówień w systemie.
                </>
              }
              actions={
                <>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Nazwa np. nabiał 28.02"
                    maxLength={80}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    className="dash-search__input w-full !pl-4 sm:w-64"
                  />
                  <button
                    onClick={handleCreate}
                    disabled={!newName.trim() || createOrder.isPending}
                    className="dash-btn"
                  >
                    <Plus className="h-4 w-4" />
                    {createOrder.isPending ? 'Tworzenie...' : 'Utwórz'}
                  </button>
                </>
              }
            />

            {createError && <p className="mb-4 shrink-0 text-sm font-medium text-rose-500">{createError}</p>}

            <div className="dash-scroll -mx-2 min-h-0 flex-1 overflow-y-auto px-3 pb-5 pt-1">
                {isLoading ? (
                    <div className="flex h-40 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500"></div>
                    </div>
                ) : orders.length > 0 ? (
                    <div className="flex flex-col gap-2.5">
                        {orders.map((order: Order) => {
                            const filledCount = order.items?.reduce((acc: number, item) => acc + (item.responses?.length || 0), 0) || 0;
                            const totalCount = (order.items?.length || 0) * APP_CONFIG.ORDER_SHOP_COUNT;
                            
                            return (
                                <OrderCard 
                                    key={order.id}
                                    order={order}
                                    filledCount={filledCount}
                                    totalCount={totalCount}
                                    onCopyLink={() => handleCopyLink(order)}
                                    onOpenPublic={() => handleOpenPublic(order)}
                                    onToggleLock={handleToggleLock}
                                    onDelete={initiateDelete}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="dash-glass mt-8 flex h-64 flex-col items-center justify-center border-dashed text-indigo-950/50 dark:text-indigo-100/50">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10 text-indigo-600 shadow-sm dark:text-indigo-300">
                            <ShoppingCart className="h-8 w-8 opacity-90" />
                        </div>
                        <h3 className="text-lg font-semibold text-indigo-950/70 dark:text-indigo-100/70">Brak zamówień</h3>
                        <p className="mt-1 max-w-sm text-center text-sm">Strumień jest pusty. Wpisz nazwę u góry i utwórz pierwsze zamówienie w zaledwie kilka sekund.</p>
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
