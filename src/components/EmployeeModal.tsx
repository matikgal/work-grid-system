import React from 'react';
import { X, UserPlus, Shield, ShoppingCart, Beef, Croissant, Carrot, Trash2, Edit } from 'lucide-react';
import { cn } from '../utils';
import { Employee } from '../types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, role: string) => void;
  employee?: Employee | null;
}

const ROLES = [
  { id: 'kierownik', label: 'Kierownik', icon: Shield },
  { id: 'kasa', label: 'Kasa', icon: ShoppingCart },
  { id: 'mieso', label: 'Mięso', icon: Beef },
  { id: 'mieso_kasa', label: 'Mięso/Kasa', icon: Beef },
  { id: 'pieczywo', label: 'Pieczywo', icon: Croissant },
  { id: 'pieczywo_kasa', label: 'Pieczywo/Kasa', icon: Croissant },
  { id: 'warzywa', label: 'Warzywa', icon: Carrot },
  { id: 'sprzataczka', label: 'Sprzątaczka', icon: Trash2 },
];

const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onAdd, employee }) => {
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState(ROLES[1].label);

  React.useEffect(() => {
    if (employee && isOpen) {
      const names = employee.name.split(' ');
      setFirstName(names[0] || '');
      setLastName(names.slice(1).join(' ') || '');
      setSelectedRole(employee.role);
    } else if (isOpen) {
      setFirstName('');
      setLastName('');
      setSelectedRole(ROLES[1].label);
    }
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName) return;
    const fullName = lastName ? `${firstName} ${lastName}` : firstName;
    onAdd(fullName, selectedRole);
    setFirstName('');
    setLastName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-brand-100 p-2 rounded-lg">
              {employee ? <Edit className="w-5 h-5 text-brand-600" /> : <UserPlus className="w-5 h-5 text-brand-600" />}
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {employee ? 'Edytuj pracownika' : 'Nowy pracownik'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Imię</label>
              <input
                autoFocus
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jan"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none text-slate-700 bg-slate-50/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Nazwisko <span className="text-slate-400 font-normal text-xs">(opcjonalne)</span></label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Kowalski"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none text-slate-700 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Stanowisko</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.label;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.label)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                      isSelected 
                        ? "bg-brand-50 border-brand-500 text-brand-700 ring-2 ring-brand-500/20" 
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isSelected ? "text-brand-600" : "text-slate-400")} />
                    <span className="text-sm font-medium">{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-brand-600/20 transition-all active:scale-[0.98]"
            >
              {employee ? 'Zapisz zmiany' : 'Dodaj pracownika'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
