import { supabase } from '../lib/supabase';

export interface Order {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  isLocked: boolean;
  // Progress
  filledCount?: number;
  totalCount?: number;
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
      // Fetch orders plus their items to calc progress
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map((o: any) => {
        let filled = 0;
        const total = 12;

        if (o.order_items && o.order_items.length > 0) {
            // Calculate total filled across ALL items? 
            // Previous logic was only checking first item. 
            // But now we have multiple items.
            // If we want "progress" of the whole order, maybe we check if ALL shops in ALL items are filled?
            // Or just stick to the first item for now?
            // User requirement: "ile jest uzupełnionych juz rubryk".
            // Let's sum up all filled cells in all items.
            
            // Wait, "to be safe", let's sum all items.
            // But Total would be 12 * items.length.
            
            // For now, let's keep it simple: Just count the FIRST item for the badge if multiple exist, 
            // OR if the user meant "how many shops have responded", we check per column?
            // "13 kolmun... w pierwszej nazwa... dane ktore wpisuja ludzie".
            // If shops respond, they fill their column.
            // So if Shop 1 fills Item 1, Column 1 is filled.
            // If Shop 1 fills Item 2...
            // Usually, a shop fills "their column" for ALL rows.
            // So "Filled" usually means "How many shops have completed their part?"
            // A shop is "complete" if they filled at least one cell? Or all?
            // Let's stick to the previous simple metric: Count non-empty shop cells in the first row. 
            // It's a heuristic.
            
            const item = o.order_items[0];
            // Check shop_1 through shop_13
            for (let i = 1; i <= 13; i++) {
                const val = item[`shop_${i}`];
                if (val && val.trim() !== '') filled++;
            }
        }

        return {
          id: o.id,
          userId: o.user_id,
          name: o.name,
          createdAt: o.created_at,
          isLocked: o.is_locked,
          filledCount: filled,
          totalCount: total
        } as Order;
    });
  },

  async createOrder(name: string, userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .insert({ name, user_id: userId })
      .select()
      .single();

    if (error) throw error;

    // NO auto-create item. User wants to add manually.
    
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      createdAt: data.created_at,
      isLocked: data.is_locked || false
    } as Order;
  },

  async updateOrderStatus(id: string, isLocked: boolean) {
      const { error } = await supabase
        .from('orders')
        .update({ is_locked: isLocked })
        .eq('id', id);
        
      if (error) throw error;
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
      createdAt: data.created_at,
      isLocked: data.is_locked
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
      shop13: i.shop_13,
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
    if (updates.shop13 !== undefined) dbUpdates.shop_13 = updates.shop13;

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
