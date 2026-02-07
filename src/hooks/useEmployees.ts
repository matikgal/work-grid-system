import { useState, useCallback, useEffect } from 'react';
import { Employee } from '../types';
import { employeeService } from '../services/employeeService';
import { Session } from '@supabase/supabase-js';

export function useEmployees(session: Session) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll(session.user.id);
      setEmployees(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [session.user.id]);

  const addEmployee = async (name: string, role: string, avatarColor?: string, isSeparator = false, rowColor?: string, isVisibleInSchedule = true, isVisibleInVacations = true) => {
    try {
      const newEmp = await employeeService.create({
        name, 
        role, 
        userId: session.user.id, 
        avatarColor,
        isSeparator,
        rowColor,
        isVisibleInSchedule,
        isVisibleInVacations
      });
      setEmployees(prev => [...prev, newEmp]);
      return newEmp;
    } catch (err) {
      console.error('Error adding employee:', err);
      throw err;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const updated = await employeeService.update(id, updates);
      setEmployees(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err) {
      console.error('Error updating employee:', err);
      throw err;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await employeeService.delete(id);
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting employee:', err);
      throw err;
    }
  };

  const reorderEmployees = async (newOrder: Employee[]) => {
      // Optimistic update
      setEmployees(newOrder);
      try {
          await employeeService.updateOrder(newOrder, session.user.id);
      } catch (err) {
          console.error("Error reordering employees:", err);
          fetchEmployees(); 
      }
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    loading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    reorderEmployees,
    refreshEmployees: fetchEmployees
  };
}
