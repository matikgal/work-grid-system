import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { Plus, Tags, Trash2, Lock, Unlock, Copy } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { toast } from 'sonner';
import {
  useMyQuotes,
  useCreateQuote,
  useDeleteQuote,
  useSetQuoteLocked,
  useDuplicateQuote,
} from '../hooks/useQuotes';
import { appendOfferDate } from '../lib/offerName';
import { Quote } from '../types/quoteSchemas';

interface OffersPageProps {
  session: Session;
}

export const OffersPage: React.FC<OffersPageProps> = ({ session }) => {
  const [newName, setNewName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: quotes = [], isLoading } = useMyQuotes(session.user.id);
  const createQuote = useCreateQuote();
  const deleteQuote = useDeleteQuote();
  const setLocked = useSetQuoteLocked();
  const duplicateQuote = useDuplicateQuote();

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createQuote.mutateAsync({
        name: appendOfferDate(newName),
        userId: session.user.id,
      });
      setNewName('');
      toast.success('Utworzono ofertę');
    } catch {
      toast.error('Nie udało się utworzyć oferty');
    }
  };

  const handleDuplicate = async (q: Quote) => {
    try {
      await duplicateQuote.mutateAsync({
        sourceId: q.id,
        userId: session.user.id,
        newName: appendOfferDate(q.name),
      });
      toast.success('Skopiowano czystą ofertę (bez cen)');
    } catch {
      toast.error('Nie udało się skopiować oferty');
    }
  };

  const handleToggleLock = async (q: Quote) => {
    try {
      await setLocked.mutateAsync({ id: q.id, isLocked: !q.isLocked });
      toast.success(q.isLocked ? 'Oferta odblokowana' : 'Oferta zamknięta');
    } catch {
      toast.error('Błąd zmiany statusu');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteQuote.mutateAsync(deleteId);
      setDeleteId(null);
      toast.success('Oferta usunięta');
    } catch {
      toast.error('Nie udało się usunąć oferty');
    }
  };

  return (
    <MainLayout pageTitle="Oferty">
      <div className="flex h-full min-h-0 flex-col bg-slate-50 text-slate-900">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-4 md:p-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Tags className="h-6 w-6 text-slate-700" />
              Oferty
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Porównanie cen od hurtowni. Każda hurtownia dostaje własny link i widzi tylko swoją
              kolumnę.
            </p>
          </div>

          <div className="flex items-stretch gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Nazwa oferty, np. nabiał"
              maxLength={80}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newName.trim() || createQuote.isPending}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Plus className="h-4 w-4" />
              Utwórz
            </button>
          </div>
          <p className="-mt-2 text-xs text-slate-500">
            Do nazwy automatycznie dopisze się dzisiejsza data.
          </p>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <p className="py-12 text-center text-slate-500">Ładowanie…</p>
            ) : quotes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <p className="text-lg font-medium text-slate-700">Brak ofert</p>
                <p className="mt-1 text-sm text-slate-500">
                  Wpisz nazwę u góry i kliknij <span className="font-semibold">Utwórz</span>.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {quotes.map((q: Quote) => (
                  <li
                    key={q.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/offers/${q.id}`}
                          className="cursor-pointer truncate text-lg font-semibold text-slate-900 hover:underline"
                        >
                          {q.name}
                        </Link>
                        {q.isLocked ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                            <Lock className="h-3 w-3" /> Zamknięta
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                            <Unlock className="h-3 w-3" /> Otwarta
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {q.columns?.length || 0} hurtowni · {q.rows?.length || 0} produktów
                        {q.createdAt
                          ? ` · ${new Date(q.createdAt).toLocaleDateString('pl-PL')}`
                          : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleLock(q)}
                        disabled={setLocked.isPending}
                        className={
                          q.isLocked
                            ? 'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50'
                            : 'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50'
                        }
                      >
                        {q.isLocked ? (
                          <>
                            <Unlock className="h-4 w-4" /> Odblokuj
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" /> Zamknij
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(q)}
                        disabled={duplicateQuote.isPending}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Skopiuj strukturę bez cen"
                      >
                        <Copy className="h-4 w-4" /> Kopiuj
                      </button>
                      <Link
                        to={`/offers/${q.id}`}
                        className="cursor-pointer rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
                      >
                        Otwórz
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteId(q.id)}
                        className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Usuń"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Usuń ofertę"
        message="Czy na pewno chcesz usunąć tę ofertę wraz z wszystkimi cenami od hurtowni?"
        confirmLabel="Usuń"
        variant="danger"
      />
    </MainLayout>
  );
};
