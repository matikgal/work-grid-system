import React, { useState, useEffect } from 'react';
import { X, Trash2, Clock, Calendar } from 'lucide-react';
import { ModalState, Shift } from '../types';
import { calculateDuration } from '../utils';
import { SHIFT_TYPES } from '../constants';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shift: Omit<Shift, 'id'> | Shift) => void;
  onDelete: (id: string) => void;
  data: ModalState;
  employeeName: string;
}

const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, onSave, onDelete, data, employeeName }) => {
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [error, setError] = useState('');

  useEffect(() => {
    if (data.existingShift) {
      setStartTime(data.existingShift.startTime);
      setEndTime(data.existingShift.endTime);
    } else {
      setStartTime('08:00');
      setEndTime('16:00');
    }
    setError('');
  }, [data]);

  if (!isOpen) return null;

  const duration = calculateDuration(startTime, endTime);

  const handleSave = () => {
    if (!startTime || !endTime) {
      setError('Wprowadź godziny.');
      return;
    }

    if (data.existingShift) {
      onSave({
        ...data.existingShift,
        startTime,
        endTime,
        duration,
        // Type preserved
      });
    } else if (data.employeeId && data.date) {
      onSave({
        employeeId: data.employeeId,
        date: data.date,
        startTime,
        endTime,
        duration,
        // Default type for manual creation via this modal
        type: SHIFT_TYPES.WORK_OFFICE, 
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {data.existingShift ? 'Edytuj Zmianę' : 'Nowa Zmiana'}
            </h3>
            <p className="text-sm text-slate-500">{employeeName}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="flex items-center gap-3 text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="font-medium">{data.date}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Początek</label>
              <div className="relative">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-slate-700 font-medium"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Koniec</label>
              <div className="relative">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-slate-700 font-medium"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
             <span className="text-sm text-slate-500 font-medium">Czas trwania:</span>
             <span className="text-xl font-bold text-slate-800">{duration}h</span>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-3 md:py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          {data.existingShift && (
            <button
              onClick={() => {
                if (data.existingShift) onDelete(data.existingShift.id);
                onClose();
              }}
              className="flex items-center justify-center p-2.5 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors"
              title="Usuń zmianę"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg shadow-sm shadow-brand-500/30 transition-all active:scale-[0.98]"
          >
            Zapisz zmianę
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftModal;
