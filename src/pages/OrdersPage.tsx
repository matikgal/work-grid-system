import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { Plus, ShoppingCart, Trash2, Lock, Unlock, Copy, ExternalLink, Edit2 } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { toast } from 'sonner';
import {
  useMyOrders,
  useCreateOrder,
  useDeleteOrder,
  useUpdateOrderStatus,
} from '../hooks/useOrders';
import { buildPublicOrderUrl } from '../lib/orderAccess';
import { Order } from '../types/schemas';
import { APP_CONFIG } from '../config/app';

interface OrdersPageProps {
  session: Session;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ session }) => {
  const [newName, setNewName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useMyOrders(session.user.id);
  const createOrder = useCreateOrder();
  const deleteOrder = useDeleteOrder();
  const updateStatus = useUpdateOrderStatus();

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createOrder.mutateAsync({ name: newName.trim(), userId: session.user.id });
      setNewName('');
      toast.success('Utworzono nowe zamówienie');
    } catch {
      toast.error('Błąd tworzenia zamówienia');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteOrder.mutateAsync(deleteId);
      setDeleteId(null);
      toast.success('Zamówienie usunięte');
    } catch {
      toast.error('Nie udało się usunąć zamówienia');
    }
  };

  const handleToggleLock = async (order: Order) => {
    try {
      const newStatus = !order.isLocked;
      await updateStatus.mutateAsync({ id: order.id, isLocked: newStatus });
      toast.success(newStatus ? 'Zamówienie zablokowane' : 'Zamówienie odblokowane');
    } catch {
      toast.error('Błąd zmiany statusu');
    }
  };

  const handleCopyLink = async (order: Order) => {
    try {
      await navigator.clipboard.writeText(buildPublicOrderUrl(order.id));
      toast.success('Link skopiowany do schowka!');
    } catch {
      toast.error('Nie udało się skopiować linku');
    }
  };

  const handleOpenPublic = (order: Order) => {
    window.open(buildPublicOrderUrl(order.id), '_blank', 'noopener,noreferrer');
  };

  const actionBtn =
    'inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border px-2 py-1.5 text-xs font-semibold';

  return (
    <MainLayout pageTitle="Zamówienia">
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-4 overflow-hidden p-4 md:p-6">
          <div className="shrink-0">
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <ShoppingCart className="h-6 w-6 text-slate-700" />
              Zamówienia
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Masz <span className="font-semibold text-slate-800">{orders.length}</span> zamówień w
              systemie.
            </p>
          </div>

          <div className="flex shrink-0 items-stretch gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Nazwa np. nabiał 28.02"
              maxLength={80}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newName.trim() || createOrder.isPending}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Plus className="h-4 w-4" />
              {createOrder.isPending ? 'Tworzenie…' : 'Utwórz'}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <p className="py-12 text-center text-slate-500">Ładowanie…</p>
            ) : orders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <p className="text-lg font-medium text-slate-700">Brak zamówień</p>
                <p className="mt-1 text-sm text-slate-500">
                  Wpisz nazwę u góry i kliknij <span className="font-semibold">Utwórz</span>.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {orders.map((order: Order) => {
                  const filledCount =
                    order.items?.reduce(
                      (acc: number, item) => acc + (item.responses?.length || 0),
                      0,
                    ) || 0;
                  const totalCount = (order.items?.length || 0) * APP_CONFIG.ORDER_SHOP_COUNT;
                  const isComplete = filledCount === totalCount && totalCount > 0;

                  return (
                    <li
                      key={order.id}
                      className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-4"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/orders/${order.id}`}
                            className="cursor-pointer truncate text-lg font-semibold text-slate-900 hover:underline"
                          >
                            {order.name}
                          </Link>
                          {order.isLocked ? (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              <Lock className="h-3 w-3" /> Zamknięte
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                              <Unlock className="h-3 w-3" /> Otwarte
                            </span>
                          )}
                          <span
                            className={
                              isComplete
                                ? 'rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700'
                                : 'rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600'
                            }
                          >
                            Uzupełniono: {filledCount}/{totalCount}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('pl-PL')
                            : '—'}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-nowrap items-center gap-1.5 overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => handleToggleLock(order)}
                          disabled={updateStatus.isPending}
                          className={
                            order.isLocked
                              ? `${actionBtn} border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50`
                              : `${actionBtn} border-slate-800 bg-slate-800 text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50`
                          }
                        >
                          {order.isLocked ? (
                            <>
                              <Unlock className="h-3.5 w-3.5" /> Odblokuj
                            </>
                          ) : (
                            <>
                              <Lock className="h-3.5 w-3.5" /> Zamknij
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(order)}
                          className={`${actionBtn} border-slate-300 bg-white text-slate-800 hover:bg-slate-50`}
                          title="Kopiuj link"
                        >
                          <Copy className="h-3.5 w-3.5" /> Link
                        </button>
                        <Link
                          to={`/orders/${order.id}`}
                          className={`${actionBtn} border-slate-300 bg-white text-slate-800 hover:bg-slate-50`}
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Edytuj
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenPublic(order)}
                          className={`${actionBtn} border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Otwórz
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(order.id)}
                          className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Usuń"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Usuń zamówienie"
        message="Czy na pewno chcesz bezpowrotnie usunąć to zamówienie? Ta operacja usunie również wszystkie dane wprowadzone przez sklepy."
        confirmLabel="Usuń"
        variant="danger"
      />
    </MainLayout>
  );
};
