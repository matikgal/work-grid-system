import { supabase } from '../lib/supabase';
import { NETWORK_STORE_DEFAULTS } from '../config/networkStores';

export interface Store {
  id: string;
  userId: string;
  number: number;
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  managerName: string | null;
}

export type StoreContactFields = Partial<
  Pick<Store, 'name' | 'address' | 'phone' | 'email' | 'managerName'>
>;

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

  /**
   * Seeds the official list only when the user has no stores yet.
   * Never re-inserts deleted numbers. Fills empty phone/email on existing rows.
   */
  async ensureDefaults(userId: string): Promise<Store[]> {
    const existing = await this.getAll(userId);

    if (existing.length === 0) {
      const rows = NETWORK_STORE_DEFAULTS.map((d) => ({
        user_id: userId,
        number: d.number,
        name: d.name,
        address: d.address,
        phone: d.phone,
        email: d.email,
      }));
      const { error } = await supabase.from('stores').insert(rows);
      if (error) throw error;
      return this.getAll(userId);
    }

    const needsSeed = existing.filter(
      (s) => (s.phone == null || s.phone === '') && (s.email == null || s.email === ''),
    );

    for (const store of needsSeed) {
      const d = NETWORK_STORE_DEFAULTS.find((x) => x.number === store.number);
      if (!d) continue;
      await this.update(store.id, {
        name: d.name,
        address: d.address,
        phone: d.phone,
        email: d.email,
      });
    }

    return needsSeed.length > 0 ? this.getAll(userId) : existing;
  },

  /** Force-replace contact fields from the official network list (existing rows only). */
  async replaceWithDefaults(userId: string): Promise<Store[]> {
    const existing = await this.ensureDefaults(userId);
    for (const store of existing) {
      const d = NETWORK_STORE_DEFAULTS.find((x) => x.number === store.number);
      if (!d) continue;
      await this.update(store.id, {
        name: d.name,
        address: d.address,
        phone: d.phone,
        email: d.email,
      });
    }
    return this.getAll(userId);
  },

  async update(id: string, fields: StoreContactFields) {
    const update: Record<string, string | null | undefined> = {};
    if (fields.name !== undefined) update.name = fields.name;
    if (fields.address !== undefined) update.address = fields.address;
    if (fields.phone !== undefined) update.phone = fields.phone;
    if (fields.email !== undefined) update.email = fields.email;
    if (fields.managerName !== undefined) update.manager_name = fields.managerName;

    const { data, error } = await supabase
      .from('stores')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapStore(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('stores').delete().eq('id', id);
    if (error) throw error;
  },
};

function mapStore(row: Record<string, unknown>): Store {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    number: row.number as number,
    name: row.name as string | null,
    address: row.address as string | null,
    phone: (row.phone as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    managerName: row.manager_name as string | null,
  };
}
