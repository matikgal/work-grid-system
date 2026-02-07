import { supabase } from '../lib/supabase';
import { Employee } from '../types';
import { getRandomColor } from '../utils';

interface CreateEmployeeParams {
  name: string;
  role: string;
  userId: string;
  avatarColor?: string;
  isSeparator?: boolean;
  rowColor?: string;
  isVisibleInSchedule?: boolean;
  isVisibleInVacations?: boolean;
}

export const employeeService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []).map(e => ({
      id: e.id,
      name: e.name,
      role: e.role,
      avatarColor: e.avatar_color,
      orderIndex: e.order_index,
      isSeparator: e.is_separator,
      rowColor: e.row_color,
      isVisibleInSchedule: e.is_visible_in_schedule,
      isVisibleInVacations: e.is_visible_in_vacations
    } as Employee));
  },

  async create({ name, role, userId, avatarColor, isSeparator = false, rowColor, isVisibleInSchedule = true, isVisibleInVacations = true }: CreateEmployeeParams) {
    const newEmpData = { 
      name, 
      role, 
      avatar_color: avatarColor || getRandomColor(),
      user_id: userId,
      is_separator: isSeparator,
      row_color: rowColor,
      is_visible_in_schedule: isVisibleInSchedule,
      is_visible_in_vacations: isVisibleInVacations
    };
    
    // We try to insert. If columns don't exist, this might fail unless we assume user has migrated DB.
    // Since I cannot migrate DB reliably without SQL access, I assume the user handles DB or I should instruct them.
    // However, I will proceed assuming the DB schema matches the code.
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
      orderIndex: data.order_index,
      isSeparator: data.is_separator,
      rowColor: data.row_color
    } as Employee;
  },

  async update(id: string, updates: Partial<Employee>) {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.avatarColor !== undefined) dbUpdates.avatar_color = updates.avatarColor;
    if (updates.orderIndex !== undefined) dbUpdates.order_index = updates.orderIndex;
    if (updates.isSeparator !== undefined) dbUpdates.is_separator = updates.isSeparator;
    if (updates.rowColor !== undefined) dbUpdates.row_color = updates.rowColor;
    if (updates.isVisibleInSchedule !== undefined) dbUpdates.is_visible_in_schedule = updates.isVisibleInSchedule;
    if (updates.isVisibleInVacations !== undefined) dbUpdates.is_visible_in_vacations = updates.isVisibleInVacations;

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
      orderIndex: data.order_index,
      isSeparator: data.is_separator,
      rowColor: data.row_color,
      isVisibleInSchedule: data.is_visible_in_schedule,
      isVisibleInVacations: data.is_visible_in_vacations
    } as Employee;
  },

  async updateOrder(employees: Employee[], userId: string) {
    const updates = employees.map((emp, index) => ({
      id: emp.id,
      name: emp.name,
      role: emp.role,
      avatar_color: emp.avatarColor,
      user_id: userId,
      order_index: index,
      is_separator: emp.isSeparator,
      row_color: emp.rowColor,
      is_visible_in_schedule: emp.isVisibleInSchedule,
      is_visible_in_vacations: emp.isVisibleInVacations
    }));

    const { error } = await supabase.from('employees').upsert(updates);
    if (error) throw error;
  },

  async delete(id: string) {
    await supabase.from('shifts').delete().eq('employee_id', id); 
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
  }
};
