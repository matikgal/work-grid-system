import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  useOrder,
  useOrderItems,
  useUpsertShopResponse,
  orderKeys,
} from '../hooks/useOrders';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { PublicOrderDesktopTable } from '../components/features/orders/PublicOrderDesktopTable';
import { PublicOrderMobileList } from '../components/features/orders/PublicOrderMobileList';
import { DashboardBackground } from '../components/dashboard/DashboardBackground';
import { getOrderShopNumbers } from '../config/app';
import { APP_CONFIG } from '../config/app';
import '../components/dashboard/dashboard-modern.css';

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
      <div className="flex h-screen items-center justify-center bg-[#eef0fb] text-rose-500 dark:bg-[#0a0a14]">
        Nieprawidłowy link zamówienia.
      </div>
    );
  }

  if (isOrderLoading || isItemsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#eef0fb] text-indigo-950/60 dark:bg-[#0a0a14] dark:text-indigo-100/60">
        Ładowanie zamówienia...
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#eef0fb] text-rose-500 dark:bg-[#0a0a14]">
        Nie znaleziono zamówienia lub wystąpił błąd.
      </div>
    );
  }

  const shops = getOrderShopNumbers();
  const isLocked = order.isLocked;

  return (
    <div className="login-aurora min-h-screen">
      <DashboardBackground />
      <div className="relative z-10 mx-auto max-w-[1920px] p-4 md:p-8">
        <div className="dash-glass sticky top-3 z-20 mb-6 flex items-center justify-between gap-4 p-5">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight md:text-2xl">
              <span className="dash-gradient-text">{order.name}</span>
              {isLocked && (
                <span className="flex items-center gap-1 rounded-full border border-rose-300/50 bg-rose-500/12 px-2 py-1 text-xs font-semibold text-rose-600 dark:text-rose-300">
                  <Lock className="h-3 w-3" /> ZAKOŃCZONE
                </span>
              )}
            </h1>
            <p className="mt-1 text-sm text-indigo-950/55 dark:text-indigo-100/60">
              {isLocked
                ? 'Edycja została zablokowana. To zamówienie jest zakończone.'
                : 'Uzupełnij dane. Zmiany są zapisywane automatycznie.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {saving && (
              <span className="animate-pulse text-sm font-medium text-indigo-600 dark:text-indigo-300">
                Zapisywanie...
              </span>
            )}
          </div>
        </div>

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
