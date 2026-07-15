import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService, OrderAccessError } from '../services/orderService';
import { CreateOrderDTO } from '../types/schemas';

// Keys for RQ
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (userId: string) => [...orderKeys.lists(), userId] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  items: (orderId: string) => [...orderKeys.detail(orderId), 'items'] as const,
  public: (orderId: string, accessPin: string) =>
    [...orderKeys.all, 'public', orderId, accessPin] as const,
  publicItems: (orderId: string, accessPin: string) =>
    [...orderKeys.public(orderId, accessPin), 'items'] as const,
};

// --- CUSTOM HOOKS ---

export function useMyOrders(userId: string) {
  return useQuery({
    queryKey: orderKeys.list(userId),
    queryFn: () => orderService.getMyOrders(userId),
    enabled: !!userId,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
  });
}

export function useOrderItems(orderId: string) {
  return useQuery({
    queryKey: orderKeys.items(orderId),
    queryFn: () => orderService.getOrderItems(orderId),
    enabled: !!orderId,
  });
}

export function usePublicOrder(orderId: string, accessPin: string) {
  return useQuery({
    queryKey: orderKeys.public(orderId, accessPin),
    queryFn: () => orderService.getPublicOrder(orderId, accessPin),
    enabled: !!orderId && !!accessPin,
    retry: false,
  });
}

export function usePublicOrderItems(orderId: string, accessPin: string) {
  return useQuery({
    queryKey: orderKeys.publicItems(orderId, accessPin),
    queryFn: () => orderService.getPublicOrderItems(orderId, accessPin),
    enabled: !!orderId && !!accessPin,
    retry: false,
  });
}

export { OrderAccessError };

export function useOrderLockStatus(orderId: string) {
  return useQuery({
    queryKey: [...orderKeys.detail(orderId), 'lockStatus'],
    queryFn: () => orderService.getOrderLockStatus(orderId),
    enabled: !!orderId,
    refetchInterval: 10000, // optionally auto-refresh lock status every 10s
  });
}

// --- MUTATIONS ---

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, userId }: CreateOrderDTO) => orderService.createOrder(name, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.list(variables.userId) });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderService.deleteOrder(id),
    onSuccess: () => {
      // Invalidate all orders to refresh the list 
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isLocked }: { id: string; isLocked: boolean }) => 
      orderService.updateOrderStatus(id, isLocked),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function useAddItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, name }: { orderId: string; name: string }) => 
      orderService.addItem(orderId, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.items(variables.orderId) });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, orderId }: { id: string; orderId: string }) => 
      orderService.deleteItem(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.items(variables.orderId) });
    },
  });
}

export function useUpsertShopResponse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, shopId, value }: { itemId: string; shopId: string; value: string }) =>
      orderService.upsertShopResponse(itemId, shopId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

export function useUpsertPublicShopResponse(orderId: string, accessPin: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      shopId,
      value,
    }: {
      itemId: string;
      shopId: string;
      value: string;
    }) => orderService.upsertPublicShopResponse(orderId, accessPin, itemId, shopId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.publicItems(orderId, accessPin) });
    },
  });
}
