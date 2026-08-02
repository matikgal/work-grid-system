import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useOrder, useOrderItems, useUpsertShopResponse, orderKeys } from '../hooks/useOrders';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { PublicOrderDesktopTable } from '../components/features/orders/PublicOrderDesktopTable';
import { PublicOrderMobileList } from '../components/features/orders/PublicOrderMobileList';
import { getOrderShopNumbers } from '../config/app';
import { APP_CONFIG } from '../config/app';

export const PublicOrderPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const orderId = token || '';

  const queryClient = useQueryClient();
  const { data: order, isLoading: isOrderLoading, error: orderError } = useOrder(orderId);
  const { data: items = [], isLoading: isItemsLoading } = useOrderItems(orderId);
  const upsertResponseMutation = useUpsertShopResponse();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order?.name) {
      document.title = `${order.name} · ${APP_CONFIG.APP_NAME}`;
    } else {
      document.title = `Zamówienie · ${APP_CONFIG.APP_NAME}`;
    }
  }, [order?.name]);

  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order_updates_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newOrder = payload.new as { is_locked?: boolean };
          queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
          if (newOrder.is_locked) {
            toast.info('Zamówienie zostało zablokowane przez administratora');
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, queryClient]);

  const handleBlur = async (itemId: string, shopNumber: number, value: string) => {
    if (!orderId || order?.isLocked) return;

    setSaving(true);
    try {
      await upsertResponseMutation.mutateAsync({
        itemId,
        shopId: shopNumber.toString(),
        value,
      });
    } catch (e) {
      console.error('Failed to save', e);
      toast.error('Błąd zapisu danych');
    } finally {
      setSaving(false);
    }
  };

  if (!orderId) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-rose-600">
        Nieprawidłowy link zamówienia.
      </div>
    );
  }

  if (isOrderLoading || isItemsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-600">
        Ładowanie zamówienia…
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-rose-600">
        Nie znaleziono zamówienia lub wystąpił błąd.
      </div>
    );
  }

  const shops = getOrderShopNumbers();
  const isLocked = order.isLocked;

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1920px] p-3 sm:p-4 md:p-8">
        <header className="mb-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
                <span className="break-words">{order.name}</span>
                {isLocked && (
                  <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                    <Lock className="h-3 w-3" /> Zakończone
                  </span>
                )}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {isLocked
                  ? 'Edycja została zablokowana. To zamówienie jest zakończone.'
                  : 'Uzupełnij dane. Zmiany zapisują się po zejściu z pola.'}
              </p>
            </div>
            {saving && <span className="text-sm font-medium text-slate-500">Zapisywanie…</span>}
          </div>
        </header>

        <PublicOrderDesktopTable
          items={items}
          shops={shops}
          isLocked={isLocked}
          onBlurCell={handleBlur}
        />

        <PublicOrderMobileList
          items={items}
          shops={shops}
          isLocked={isLocked}
          onBlurCell={handleBlur}
        />
      </div>
    </div>
  );
};
