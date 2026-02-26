import { supabase } from '../lib/supabase';
import { Order, Item, ShopResponse, OrderSchema, ItemSchema } from '../types/schemas';

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

    // Map and validate with Zod
    return (data || []).map((o: any) => {
      // Calculate filled responses across all items
      let filledCount = 0;
      let totalCount = 0;

      if (o.items && o.items.length > 0) {
        // Example logic: number of total responses
        filledCount = o.items.reduce((acc: number, item: any) => acc + (item.shop_responses?.length || 0), 0);
        // Assuming 13 shops are expected to fill each item
        totalCount = o.items.length * 13;
      }

      return OrderSchema.parse({
        id: o.id,
        userId: o.user_id,
        name: o.name,
        isLocked: o.is_locked,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        items: (o.items || []).map((i: any) => ({
          id: i.id,
          orderId: i.order_id,
          name: i.name,
          createdAt: i.created_at,
          updatedAt: i.updated_at,
          responses: (i.shop_responses || []).map((r: any) => ({
            id: r.id,
            itemId: r.item_id,
            shopId: r.shop_id,
            value: r.value,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }))
        }))
      });
    });
  },

  async createOrder(name: string, userId: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert({ name, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return OrderSchema.parse({
      id: data.id,
      userId: data.user_id,
      name: data.name,
      isLocked: data.is_locked,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
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

  // --- PUBLIC FUNCTIONS ---
  async getOrderById(id: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    
    return OrderSchema.parse({
      id: data.id,
      userId: data.user_id,
      name: data.name,
      isLocked: data.is_locked,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      items: []
    });
  },

  async getOrderItems(orderId: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*, shop_responses(*)')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []).map((i: any) => ItemSchema.parse({
      id: i.id,
      orderId: i.order_id,
      name: i.name,
      createdAt: i.created_at,
      updatedAt: i.updated_at,
      responses: (i.shop_responses || []).map((r: any) => ({
        id: r.id,
        itemId: r.item_id,
        shopId: r.shop_id,
        value: r.value,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    }));
  },

  async addItem(orderId: string, name: string): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .insert({ order_id: orderId, name })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return ItemSchema.parse({
      id: data.id,
      orderId: data.order_id,
      name: data.name,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      responses: []
    });
  },

  async updateItemName(id: string, name: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .update({ name })
      .eq('id', id);

    if (error) throw new Error(error.message);
  },
  
  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async upsertShopResponse(itemId: string, shopId: string, value: string): Promise<void> {
    // We use upsert to insert or update the response
    const { error } = await supabase
      .from('shop_responses')
      .upsert(
        { item_id: itemId, shop_id: shopId, value },
        { onConflict: 'item_id,shop_id' }
      );

    if (error) throw new Error(error.message);
  },

  async getOrderLockStatus(id: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('orders')
      .select('is_locked')
      .eq('id', id)
      .single();
      
    if (error) throw new Error(error.message);
    return data.is_locked;
  }
};
