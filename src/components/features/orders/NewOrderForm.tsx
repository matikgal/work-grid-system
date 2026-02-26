import React, { useState } from 'react';
import { useCreateOrder } from '../../../hooks/useOrders';
import { toast } from 'sonner';

interface NewOrderFormProps {
  userId: string;
}

export const NewOrderForm: React.FC<NewOrderFormProps> = ({ userId }) => {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createOrder = useCreateOrder();

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setError(null);
    try {
        await createOrder.mutateAsync({ name: newName, userId });
        setNewName('');
        toast.success('Utworzono nowe zamówienie');
    } catch (e) {
        console.error("Error creating order:", e);
        setError("Wystąpił błąd podczas tworzenia zamówienia. Sprawdź połączenie.");
        toast.error('Błąd tworzenia zamówienia');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Nowe zamówienie</h2>
        <div className="flex flex-col sm:flex-row gap-4">
            <input 
                type="text" 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nazwa zamówienia np. nabiał 28.02"
                className="w-full sm:flex-1 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <button 
                onClick={handleCreate}
                disabled={!newName.trim() || createOrder.isPending}
                className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
            >
                {createOrder.isPending ? 'Tworzenie...' : 'Utwórz'}
            </button>
        </div>
        {error && <p className="text-red-500 mt-2 text-sm font-medium">{error}</p>}
    </div>
  );
};
