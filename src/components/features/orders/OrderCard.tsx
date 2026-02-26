import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Copy, ExternalLink, Lock, Unlock, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import { Order } from '../../../types/schemas';
import { cn } from '../../../utils';

interface OrderCardProps {
  order: Order;
  publicLink: string;
  filledCount: number;
  totalCount: number;
  onCopyLink: (link: string) => void;
  onToggleLock: (order: Order) => void;
  onDelete: (id: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  publicLink,
  filledCount,
  totalCount,
  onCopyLink,
  onToggleLock,
  onDelete
}) => {
  return (
    <div className={cn(
        "bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border flex flex-col md:flex-row md:items-center gap-4 group transition-colors",
        order.isLocked 
            ? "border-green-200 dark:border-green-900/30 bg-green-50/30 dark:bg-green-900/10" 
            : "border-slate-200 dark:border-slate-800"
    )}>
        <div className="flex-1">
            <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white break-all">{order.name}</h3>
                {order.isLocked && <CheckCircle className="w-5 h-5 text-green-600" />}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-1">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                </div>
                <div className={cn(
                    "text-xs font-bold px-2 py-1 rounded-full",
                    filledCount === totalCount && totalCount > 0 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                )}>
                    Uzupełniono: {filledCount}/{totalCount}
                </div>
            </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto mt-2 md:pt-0 pt-2 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
            <button 
                onClick={() => onCopyLink(publicLink)}
                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                title="Kopiuj link"
            >
                <Copy className="w-5 h-5" />
            </button>

            <Link 
                to={`/orders/${order.id}`}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Edytuj strukturę"
            >
                <Edit2 className="w-5 h-5" />
            </Link>
            
            <a 
                href={publicLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
                <ExternalLink className="w-4 h-4" />
                Otwórz
            </a>
            
            <button 
                onClick={() => onToggleLock(order)}
                className={cn(
                    "p-2 rounded-lg transition-colors",
                    order.isLocked 
                        ? "text-green-600 hover:bg-green-100" 
                        : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                )}
                title={order.isLocked ? "Odblokuj" : "Zakończ/Zablokuj"}
            >
                {order.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </button>

            <button 
                onClick={() => onDelete(order.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Usuń"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
    </div>
  );
};
