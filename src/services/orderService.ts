import { supabase } from '../lib/supabase';

export interface Order {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  name: string;
  shop1: string;
  shop2: string;
  shop3: string;
  shop4: string;
  shop5: string;
  shop6: string;
  shop7: string;
  shop8: string;
  shop9: string;
  shop10: string;
  shop11: string;
  shop12: string;
}

export const orderService = {
  // Admin functions
  async getMyOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(o => ({
      id: o.id,
      userId: o.user_id,
      name: o.name,
      createdAt: o.created_at
    } as Order));
  },

  async createOrder(name: string, userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .insert({ name, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      createdAt: data.created_at
    } as Order;
  },

  async deleteOrder(id: string) {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
  },

  // Public functions
  async getOrderById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      createdAt: data.created_at
    } as Order;
  },

  async getOrderItems(orderId: string) {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(i => ({
      id: i.id,
      orderId: i.order_id,
      name: i.name,
      shop1: i.shop_1,
      shop2: i.shop_2,
      shop3: i.shop_3,
      shop4: i.shop_4,
      shop5: i.shop_5,
      shop6: i.shop_6,
      shop7: i.shop_7,
      shop8: i.shop_8,
      shop9: i.shop_9,
      shop10: i.shop_10,
      shop11: i.shop_11,
      shop12: i.shop_12,
    } as OrderItem));
  },

  async addItem(orderId: string, name: string) {
    const { data, error } = await supabase
      .from('order_items')
      .insert({ order_id: orderId, name })
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateItem(id: string, updates: Partial<OrderItem>) {
    // Map camelCase to snake_case manually for shop fields
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.shop1 !== undefined) dbUpdates.shop_1 = updates.shop1;
    if (updates.shop2 !== undefined) dbUpdates.shop_2 = updates.shop2;
    if (updates.shop3 !== undefined) dbUpdates.shop_3 = updates.shop3;
    if (updates.shop4 !== undefined) dbUpdates.shop_4 = updates.shop4;
    if (updates.shop5 !== undefined) dbUpdates.shop_5 = updates.shop5;
    if (updates.shop6 !== undefined) dbUpdates.shop_6 = updates.shop6;
    if (updates.shop7 !== undefined) dbUpdates.shop_7 = updates.shop7;
    if (updates.shop8 !== undefined) dbUpdates.shop_8 = updates.shop8;
    if (updates.shop9 !== undefined) dbUpdates.shop_9 = updates.shop9;
    if (updates.shop10 !== undefined) dbUpdates.shop_10 = updates.shop10;
    if (updates.shop11 !== undefined) dbUpdates.shop_11 = updates.shop11;
    if (updates.shop12 !== undefined) dbUpdates.shop_12 = updates.shop12;

    const { error } = await supabase
      .from('order_items')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  },
  
  async deleteItem(id: string) {
      const { error } = await supabase.from('order_items').delete().eq('id', id);
      if (error) throw error;
  }
};
