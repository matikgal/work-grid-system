import { supabase } from '../lib/supabase';
import { Order, Item, OrderSchema, ItemSchema, PublicOrderSchema } from '../types/schemas';

export class OrderAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderAccessError';
  }
}

interface DbShopResponse {
  id: string;
  item_id: string;
  shop_id: string;
  value: string;
  created_at: string | null;
  updated_at: string | null;
}

interface DbItemRow {
  id: string;
  order_id: string;
  name: string;
  created_at: string | null;
  updated_at: string | null;
  shop_responses?: DbShopResponse[];
}

interface DbOrderRow {
  id: string;
  user_id: string;
  name: string;
  is_locked: boolean;
  access_pin?: string | null;
  created_at: string | null;
  updated_at: string | null;
  items?: DbItemRow[];
}

function mapShopResponses(responses: DbShopResponse[] | undefined) {
  return (responses || []).map((r) => ({
    id: r.id,
    itemId: r.item_id,
    shopId: r.shop_id,
    value: r.value,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

function mapItemRow(i: DbItemRow): Item {
  return ItemSchema.parse({
    id: i.id,
    orderId: i.order_id,
    name: i.name,
    createdAt: i.created_at,
    updatedAt: i.updated_at,
    responses: mapShopResponses(i.shop_responses),
  });
}

function mapOrderRow(o: DbOrderRow, includeItems = false): Order {
  return OrderSchema.parse({
    id: o.id,
    userId: o.user_id,
    name: o.name,
    isLocked: o.is_locked,
    accessPin: o.access_pin ?? undefined,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    items: includeItems
      ? (o.items || []).map((i) => ({
          id: i.id,
          orderId: i.order_id,
          name: i.name,
          createdAt: i.created_at,
          updatedAt: i.updated_at,
          responses: mapShopResponses(i.shop_responses),
        }))
      : [],
  });
}

function isInvalidAccessError(error: { message?: string; code?: string }): boolean {
  return (
    error.message?.includes('invalid_order_access') === true ||
    error.code === 'P0001'
  );
}

export const orderService = {
  // --- ADMIN FUNCTIONS ---
  async getMyOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items (
          *,
          shop_responses (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return ((data || []) as DbOrderRow[]).map((o) => mapOrderRow(o, true));
  },

  async createOrder(name: string, userId: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert({ name, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return mapOrderRow(data as DbOrderRow);
  },

  async updateOrderStatus(id: string, isLocked: boolean): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ is_locked: isLocked })
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  async deleteOrder(id: string): Promise<void> {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- PUBLIC FUNCTIONS (legacy RPC — nieużywane w UI, kolumna access_pin zostaje w DB) ---
  async getPublicOrder(orderId: string, accessPin: string): Promise<Order> {
    const { data, error } = await supabase.rpc('get_public_order', {
      p_order_id: orderId,
      p_pin: accessPin,
    });

    if (error) {
      if (isInvalidAccessError(error)) throw new OrderAccessError('INVALID_ACCESS');
      throw new Error(error.message);
    }

    const row = data as {
      id: string;
      name: string;
      is_locked: boolean;
      created_at: string | null;
      updated_at: string | null;
    };

    const publicOrder = PublicOrderSchema.parse({
      id: row.id,
      name: row.name,
      isLocked: row.is_locked,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });

    return OrderSchema.parse({
      ...publicOrder,
      userId: '00000000-0000-0000-0000-000000000001',
      items: [],
    });
  },

  async getPublicOrderItems(orderId: string, accessPin: string): Promise<Item[]> {
    const { data, error } = await supabase.rpc('get_public_order_items', {
      p_order_id: orderId,
      p_pin: accessPin,
    });

    if (error) {
      if (isInvalidAccessError(error)) throw new OrderAccessError('INVALID_ACCESS');
      throw new Error(error.message);
    }

    return ((data || []) as DbItemRow[]).map(mapItemRow);
  },

  async upsertPublicShopResponse(
    orderId: string,
    accessPin: string,
    itemId: string,
    shopId: string,
    value: string,
  ): Promise<void> {
    const { error } = await supabase.rpc('upsert_public_shop_response', {
      p_order_id: orderId,
      p_pin: accessPin,
      p_item_id: itemId,
      p_shop_id: shopId,
      p_value: value,
    });

    if (error) {
      if (isInvalidAccessError(error)) throw new OrderAccessError('INVALID_ACCESS');
      if (error.message?.includes('order_locked')) throw new OrderAccessError('ORDER_LOCKED');
      throw new Error(error.message);
    }
  },

  // --- LEGACY (admin / wewnętrzne) ---
  async getOrderById(id: string): Promise<Order> {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();

    if (error) throw new Error(error.message);

    return mapOrderRow(data as DbOrderRow);
  },

  async getOrderItems(orderId: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*, shop_responses(*)')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    return ((data || []) as DbItemRow[]).map(mapItemRow);
  },

  async addItem(orderId: string, name: string): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .insert({ order_id: orderId, name })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return mapItemRow(data as DbItemRow);
  },

  async updateItemName(id: string, name: string): Promise<void> {
    const { error } = await supabase.from('items').update({ name }).eq('id', id);

    if (error) throw new Error(error.message);
  },

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async upsertShopResponse(itemId: string, shopId: string, value: string): Promise<void> {
    const { error } = await supabase
      .from('shop_responses')
      .upsert({ item_id: itemId, shop_id: shopId, value }, { onConflict: 'item_id,shop_id' });

    if (error) throw new Error(error.message);
  },

  async getOrderLockStatus(id: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('orders')
      .select('is_locked')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data.is_locked as boolean;
  },
};
