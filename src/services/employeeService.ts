import { supabase } from '../lib/supabase';
import { Employee } from '../types';
import { getRandomColor } from '../utils';

export const employeeService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('id, name, role, avatar_color, order_index')
      .eq('user_id', userId)
      .order('order_index', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []).map(e => ({
      id: e.id,
      name: e.name,
      role: e.role,
      avatarColor: e.avatar_color,
      orderIndex: e.order_index
    } as Employee));
  },

  async create(name: string, role: string, userId: string, avatarColor?: string) {
    const newEmpData = { 
      name, 
      role, 
      avatar_color: avatarColor || getRandomColor(),
      user_id: userId
    };
    
    const { data, error } = await supabase
      .from('employees')
      .insert(newEmpData)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      role: data.role,
      avatarColor: data.avatar_color,
      orderIndex: data.order_index
    } as Employee;
  },

  async update(id: string, updates: Partial<Employee>) {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.avatarColor) dbUpdates.avatar_color = updates.avatarColor;
    if (updates.orderIndex !== undefined) dbUpdates.order_index = updates.orderIndex;

    const { data, error } = await supabase
      .from('employees')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      role: data.role,
      avatarColor: data.avatar_color,
      orderIndex: data.order_index
    } as Employee;
  },

  async updateOrder(employees: Employee[], userId: string) {
    const updates = employees.map((emp, index) => ({
      id: emp.id,
      name: emp.name,
      role: emp.role,
      avatar_color: emp.avatarColor,
      user_id: userId,
      order_index: index
    }));

    const { error } = await supabase.from('employees').upsert(updates);
    if (error) throw error;
  },

  async delete(id: string) {
    // Delete shifts first (if not cascading, but good to be safe/explicit if logic requires)
    await supabase.from('shifts').delete().eq('employee_id', id); 
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
  }
};
