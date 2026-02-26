import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useOrder, useOrderItems, useUpsertShopResponse } from '../hooks/useOrders';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { orderKeys } from '../hooks/useOrders';
import { PublicOrderDesktopTable } from '../components/features/orders/PublicOrderDesktopTable';
import { PublicOrderMobileList } from '../components/features/orders/PublicOrderMobileList';

export const PublicOrderPage: React.FC = () => {
    const { token } = useParams<{ token: string }>(); // token is the orderId
    const queryClient = useQueryClient();

    // Queries
    const { data: order, isLoading: isOrderLoading, error: orderError } = useOrder(token || '');
    const { data: items = [], isLoading: isItemsLoading } = useOrderItems(token || '');

    // Mutations
    const upsertResponseMutation = useUpsertShopResponse();

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!token) return;

        // Subscribe to changes in the current order
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
                        queryClient.invalidateQueries({ queryKey: orderKeys.detail(token) });
                        if (newOrder.is_locked) {
                            toast.info("Zamówienie zostało zablokowane przez administratora");
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [token, queryClient]);

    const handleBlur = async (itemId: string, shopNumber: number, value: string) => {
        if (!token || order?.isLocked) return;
        
        setSaving(true);
        try {
            await upsertResponseMutation.mutateAsync({
                itemId,
                shopId: shopNumber.toString(),
                value
            });
        } catch (e: any) {
            console.error("Failed to save", e);
            toast.error("Błąd zapisu danych");
        } finally {
            setSaving(false);
        }
    };

    if (isOrderLoading || isItemsLoading) return <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-500">Ładowanie zamówienia...</div>;
    if (orderError && !order) return <div className="flex items-center justify-center h-screen bg-slate-50 text-red-500">Nie znaleziono zamówienia lub wystąpił błąd.</div>;

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
                            {isLocked && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full border border-red-200 flex items-center gap-1"><Lock className="w-3 h-3"/> ZAKOŃCZONE</span>}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {isLocked 
                                ? "Edycja została zablokowana. To zamówienie jest zakończone." 
                                : "Uzupełnij dane. Zmiany są zapisywane automatycznie."}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {saving && <span className="text-blue-600 font-medium text-sm animate-pulse">Zapisywanie...</span>}
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
