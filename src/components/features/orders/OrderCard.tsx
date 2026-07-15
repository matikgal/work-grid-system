import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Copy, ExternalLink, Lock, Unlock, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import { Order } from '../../../types/schemas';
import { cn } from '../../../utils';

interface OrderCardProps {
  order: Order;
  filledCount: number;
  totalCount: number;
  onCopyLink: () => void;
  onOpenPublic: () => void;
  onToggleLock: (order: Order) => void;
  onDelete: (id: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  filledCount,
  totalCount,
  onCopyLink,
  onOpenPublic,
  onToggleLock,
  onDelete,
}) => {
  const isComplete = filledCount === totalCount && totalCount > 0;

  return (
    <div
      className={cn(
        'dash-glass group flex flex-col gap-4 p-5 transition-all hover:-translate-y-0.5 md:flex-row md:items-center',
        order.isLocked && 'ring-1 ring-emerald-400/40',
      )}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="break-all text-lg font-semibold tracking-tight">{order.name}</h3>
          {order.isLocked && <CheckCircle className="h-5 w-5 text-emerald-500" />}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-indigo-950/50 dark:text-indigo-100/55">
            <Calendar className="h-4 w-4" />
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
          </div>
          <div
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-semibold',
              isComplete
                ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400'
                : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
            )}
          >
            Uzupełniono: {filledCount}/{totalCount}
          </div>
        </div>
      </div>

      <div className="mt-2 flex w-full items-center justify-between gap-2 border-t border-white/40 pt-3 dark:border-white/10 md:mt-0 md:w-auto md:justify-end md:border-t-0 md:pt-0">
        <button
          onClick={onCopyLink}
          className="rounded-xl p-2 text-indigo-950/45 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 dark:text-indigo-100/50"
          title="Kopiuj link"
        >
          <Copy className="h-5 w-5" />
        </button>

        <Link
          to={`/orders/${order.id}`}
          className="rounded-xl p-2 text-indigo-950/45 transition-colors hover:bg-sky-500/10 hover:text-sky-600 dark:text-indigo-100/50"
          title="Edytuj strukturę"
        >
          <Edit2 className="h-5 w-5" />
        </Link>

        <button
          type="button"
          onClick={onOpenPublic}
          className="dash-btn dash-btn--ghost flex-1 md:flex-none"
        >
          <ExternalLink className="h-4 w-4" />
          Otwórz
        </button>

        <button
          onClick={() => onToggleLock(order)}
          className={cn(
            'rounded-xl p-2 transition-colors',
            order.isLocked
              ? 'text-emerald-600 hover:bg-emerald-500/12'
              : 'text-indigo-950/45 hover:bg-amber-500/12 hover:text-amber-600 dark:text-indigo-100/50',
          )}
          title={order.isLocked ? 'Odblokuj' : 'Zakończ/Zablokuj'}
        >
          {order.isLocked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
        </button>

        <button
          onClick={() => onDelete(order.id)}
          className="rounded-xl p-2 text-indigo-950/45 transition-colors hover:bg-rose-500/12 hover:text-rose-500 dark:text-indigo-100/50"
          title="Usuń"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
