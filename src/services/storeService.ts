import { supabase } from '../lib/supabase';
import { APP_CONFIG, getOrderShopNumbers } from '../config/app';

export interface Store {
  id: string;
  userId: string;
  number: number;
  name: string | null;
  address: string | null;
  managerName: string | null;
}

export const storeService = {
  async getAll(userId: string): Promise<Store[]> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', userId)
      .order('number', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapStore);
  },

  /** Uzupełnia brakujące sklepy wg ORDER_SHOP_COUNT */
  async ensureDefaults(userId: string): Promise<Store[]> {
    const existing = await this.getAll(userId);
    const existingNumbers = new Set(existing.map((s) => s.number));
    const missing = getOrderShopNumbers().filter((n) => !existingNumbers.has(n));

    if (missing.length > 0) {
      const rows = missing.map((n) => ({
        user_id: userId,
        number: n,
        name: `Sklep ${n}`,
      }));
      await supabase.from('stores').insert(rows);
    }

    return this.getAll(userId);
  },

  async update(
    id: string,
    fields: Partial<Pick<Store, 'name' | 'address' | 'managerName'>>,
  ) {
    const { data, error } = await supabase
      .from('stores')
      .update({
        name: fields.name,
        address: fields.address,
        manager_name: fields.managerName,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapStore(data);
  },

  getShopCount() {
    return APP_CONFIG.ORDER_SHOP_COUNT;
  },
};

function mapStore(row: Record<string, unknown>): Store {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    number: row.number as number,
    name: row.name as string | null,
    address: row.address as string | null,
    managerName: row.manager_name as string | null,
  };
}
