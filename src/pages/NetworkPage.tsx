import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Clipboard,
  Loader2,
  Mail,
  Printer,
  Save,
  Trash2,
} from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader } from '../components/shared/PageHeader';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { PrintNetworkReport } from '../components/features/network/PrintNetworkReport';
import { storeService, Store } from '../services/storeService';
import { auditService } from '../services/auditService';
import {
  buildStoresClipboard,
  sendStoresDirectoryMail,
  toStoreClipboardRows,
} from '../lib/storeClipboard';
import { DashboardBackground } from '../components/dashboard/DashboardBackground';
import { PageFooter } from '../components/shared/PageFooter';
import { toast } from 'sonner';
import '../components/dashboard/dashboard-modern.css';

interface NetworkPageProps {
  session: Session;
}

export const storeKeys = {
  all: (userId: string) => ['stores', userId] as const,
};

type EditableField = 'name' | 'address' | 'phone' | 'email';

export const NetworkPage: React.FC<NetworkPageProps> = ({ session }) => {
  const userId = session.user.id;
  const queryClient = useQueryClient();
  const [edits, setEdits] = useState<Record<string, Partial<Store>>>({});
  const [deleteTarget, setDeleteTarget] = useState<Store | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: storeKeys.all(userId),
    queryFn: () => storeService.ensureDefaults(userId),
    enabled: !!userId,
  });

  const { mutateAsync: saveStore, isPending: saving } = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: Partial<Pick<Store, EditableField>> }) =>
      storeService.update(id, fields),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.all(userId) }),
  });

  const { mutateAsync: deleteStore, isPending: deleting } = useMutation({
    mutationFn: (id: string) => storeService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.all(userId) }),
  });

  useEffect(() => {
    setEdits({});
  }, [stores]);

  useEffect(() => {
    if (!isPrinting) return;
    const timer = setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [isPrinting]);

  const getField = (store: Store, field: EditableField) =>
    (edits[store.id]?.[field] as string | undefined) ?? store[field] ?? '';

  const setField = (storeId: string, field: EditableField, value: string) => {
    setEdits((prev) => ({
      ...prev,
      [storeId]: { ...prev[storeId], [field]: value },
    }));
  };

  const handleSave = async (store: Store) => {
    const fields = edits[store.id];
    if (!fields) return;
    try {
      await saveStore({ id: store.id, fields });
      await auditService.log(userId, 'store_updated', 'stores', store.id, fields);
      toast.success(`${getField(store, 'name') || `Sklep ${store.number}`} zapisany`);
      setEdits((prev) => {
        const next = { ...prev };
        delete next[store.id];
        return next;
      });
    } catch {
      toast.error('Błąd zapisu sklepu');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStore(deleteTarget.id);
      await auditService.log(userId, 'store_deleted', 'stores', deleteTarget.id, {
        number: deleteTarget.number,
        name: deleteTarget.name,
      });
      toast.success('Sklep usunięty');
      setDeleteTarget(null);
    } catch {
      toast.error('Nie udało się usunąć sklepu');
    }
  };

  const handleCopy = async () => {
    try {
      const { html, text } = buildStoresClipboard(toStoreClipboardRows(stores));
      if (typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([text], { type: 'text/plain' }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      toast.success('Tabela skopiowana — wklej (Ctrl+V)');
    } catch {
      toast.error('Nie udało się skopiować');
    }
  };

  const handleMail = async () => {
    try {
      const count = await sendStoresDirectoryMail(stores);
      toast.success(`Skopiowano tabelę (${count}) — w poczcie wciśnij Ctrl+V`);
    } catch (err) {
      if (err instanceof Error && err.message === 'NO_ROWS') {
        toast.error('Brak sklepów do wysłania');
        return;
      }
      toast.error('Nie udało się przygotować wiadomości');
    }
  };

  const inputClass =
    'w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-white/12 dark:bg-white/5 dark:text-indigo-50';

  return (
    <MainLayout pageTitle="Sieć sklepów">
      <div className="dash-modern">
        <DashboardBackground />

        <div className="dash-scroll relative z-10 min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-6xl space-y-5">
            <PageHeader
              title="Sieć sklepów"
              icon={Building2}
              accent="#4f46e5"
              subtitle={`${stores.length} sklepów · Paulinka sp. z o.o.`}
              className="!mb-0"
              actions={
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleMail()}
                    disabled={stores.length === 0}
                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-45 dark:border-white/15 dark:bg-white/5 dark:text-indigo-50"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="hidden sm:inline">Wyślij e-mail</span>
                    <span className="sm:hidden">E-mail</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCopy()}
                    disabled={stores.length === 0}
                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-45 dark:border-white/15 dark:bg-white/5 dark:text-indigo-50"
                  >
                    <Clipboard className="h-4 w-4" />
                    Kopiuj
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrinting(true)}
                    disabled={stores.length === 0 || isPrinting}
                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-45 dark:border-white/15 dark:bg-white/5 dark:text-indigo-50"
                  >
                    <Printer className="h-4 w-4" />
                    Drukuj
                  </button>
                </div>
              }
            />

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            ) : stores.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-12 text-center text-slate-500">
                Brak sklepów w sieci.
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 lg:hidden">
                  {stores.map((store) => {
                    const hasEdits = !!edits[store.id];
                    return (
                      <article
                        key={store.id}
                        className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="rounded-lg bg-indigo-500/10 px-2 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                            #{String(store.number).padStart(2, '0')}
                          </span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => void handleSave(store)}
                              disabled={!hasEdits || saving}
                              className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg bg-indigo-600 px-2.5 text-xs font-semibold text-white disabled:opacity-40"
                            >
                              <Save className="h-3.5 w-3.5" /> Zapisz
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(store)}
                              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              title="Usuń sklep"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {(
                            [
                              ['name', 'Nazwa', 'Sklep 01'],
                              ['address', 'Adres', 'ul. …'],
                              ['phone', 'Telefon', '33 …'],
                              ['email', 'E-mail', 'paulinka@…'],
                            ] as const
                          ).map(([field, label, placeholder]) => (
                            <div key={field}>
                              <label className="mb-0.5 block text-[11px] font-semibold text-slate-500">
                                {label}
                              </label>
                              <input
                                value={getField(store, field)}
                                onChange={(e) => setField(store.id, field, e.target.value)}
                                placeholder={placeholder}
                                className={inputClass}
                              />
                            </div>
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm lg:block dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]">
                          <th className="w-14 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Nr
                          </th>
                          <th className="min-w-[7rem] px-2 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Nazwa
                          </th>
                          <th className="min-w-[14rem] px-2 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Adres
                          </th>
                          <th className="min-w-[11rem] px-2 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Telefon
                          </th>
                          <th className="min-w-[12rem] px-2 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            E-mail
                          </th>
                          <th className="w-28 px-2 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {stores.map((store) => {
                          const hasEdits = !!edits[store.id];
                          return (
                            <tr
                              key={store.id}
                              className="group border-b border-slate-100 last:border-0 dark:border-white/5"
                            >
                              <td className="px-3 py-2 font-bold tabular-nums text-indigo-700 transition-colors group-hover:bg-sky-50 dark:text-indigo-300 dark:group-hover:bg-indigo-500/10">
                                {String(store.number).padStart(2, '0')}
                              </td>
                              {(['name', 'address', 'phone', 'email'] as const).map((field) => (
                                <td
                                  key={field}
                                  className="px-2 py-1.5 transition-colors group-hover:bg-sky-50 dark:group-hover:bg-indigo-500/10"
                                >
                                  <input
                                    value={getField(store, field)}
                                    onChange={(e) => setField(store.id, field, e.target.value)}
                                    className={`${inputClass} bg-transparent group-hover:bg-white dark:group-hover:bg-white/5`}
                                  />
                                </td>
                              ))}
                              <td className="px-2 py-1.5 transition-colors group-hover:bg-sky-50 dark:group-hover:bg-indigo-500/10">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => void handleSave(store)}
                                    disabled={!hasEdits || saving}
                                    className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg bg-indigo-600 px-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-35"
                                    title="Zapisz"
                                  >
                                    <Save className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteTarget(store)}
                                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                    title="Usuń sklep"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <PageFooter />
      </div>

      {isPrinting && <PrintNetworkReport stores={stores} />}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title="Usuń sklep"
        message={`Czy na pewno usunąć „${deleteTarget?.name || `Sklep ${deleteTarget?.number ?? ''}`}”?`}
        confirmLabel={deleting ? 'Usuwanie…' : 'Usuń'}
        variant="danger"
      />
    </MainLayout>
  );
};
