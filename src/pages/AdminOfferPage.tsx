import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Clipboard,
  Copy,
  FileSpreadsheet,
  Lock,
  Mail,
  Printer,
  Unlock,
  Plus,
  Trash2,
} from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { PrintOfferReport } from '../components/features/offers/PrintOfferReport';
import { toast } from 'sonner';
import {
  useQuote,
  useSetQuoteLocked,
  useRenameQuote,
  useAddQuoteColumn,
  useRenameQuoteColumn,
  useDeleteQuoteColumn,
  useAddQuoteRow,
  useRenameQuoteRow,
  useUpdateQuoteRowEan,
  useUpdateQuoteRowShelfPrice,
  useUpdateQuoteRowSummary,
  useDeleteQuoteRow,
} from '../hooks/useQuotes';
import { buildPublicQuoteUrl } from '../lib/quoteAccess';
import { applyQuoteRowSummaryOverrides, computeQuoteRowMin } from '../lib/quoteMinPrice';
import {
  copyEanToClipboard,
  copyOfferExcelToClipboard,
  copyOfferSummaryToClipboard,
  formatPricePl,
  sendWholesalerOrderMail,
} from '../lib/offerClipboard';

export const AdminOfferPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { data: quote, isLoading, error } = useQuote(id);

  const setLocked = useSetQuoteLocked();
  const renameQuote = useRenameQuote();
  const addColumn = useAddQuoteColumn();
  const renameColumn = useRenameQuoteColumn();
  const deleteColumn = useDeleteQuoteColumn();
  const addRow = useAddQuoteRow();
  const renameRow = useRenameQuoteRow();
  const updateEan = useUpdateQuoteRowEan();
  const updateShelfPrice = useUpdateQuoteRowShelfPrice();
  const updateSummary = useUpdateQuoteRowSummary();
  const deleteRow = useDeleteQuoteRow();

  const [newColName, setNewColName] = useState('');
  const [newRowName, setNewRowName] = useState('');
  const [newRowEan, setNewRowEan] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<null | {
    type: 'column' | 'row';
    id: string;
    label: string;
  }>(null);

  const columns = useMemo(
    () => [...(quote?.columns || [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [quote?.columns],
  );
  const rows = useMemo(
    () => [...(quote?.rows || [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [quote?.rows],
  );

  const handleAddColumn = async () => {
    if (!id || !newColName.trim()) return;
    try {
      await addColumn.mutateAsync({ quoteId: id, name: newColName.trim() });
      setNewColName('');
      toast.success('Dodano hurtownię');
    } catch {
      toast.error('Błąd dodawania hurtowni');
    }
  };

  const handleAddRow = async () => {
    if (!id || !newRowName.trim()) return;
    try {
      await addRow.mutateAsync({
        quoteId: id,
        name: newRowName.trim(),
        ean: newRowEan.trim(),
      });
      setNewRowName('');
      setNewRowEan('');
      toast.success('Dodano produkt');
    } catch {
      toast.error('Błąd dodawania produktu');
    }
  };

  const handleCopyLink = async (token: string, name: string) => {
    try {
      await navigator.clipboard.writeText(buildPublicQuoteUrl(token));
      toast.success(`Link skopiowany (${name})`);
    } catch {
      toast.error('Nie udało się skopiować linku');
    }
  };

  const handleCopyEan = async (ean: string) => {
    try {
      await copyEanToClipboard(ean);
      toast.success('EAN skopiowany');
    } catch {
      toast.error('Brak kodu EAN');
    }
  };

  const handleCopySummary = async () => {
    try {
      await copyOfferSummaryToClipboard(rows, columns);
      toast.success('Tabela skopiowana — wklej do Outlooka');
    } catch {
      toast.error('Nie udało się skopiować tabeli');
    }
  };

  const handleCopyExcel = async () => {
    try {
      await copyOfferExcelToClipboard(rows, columns);
      toast.success('Dane skopiowane — wklej do Excela');
    } catch {
      toast.error('Nie udało się skopiować do Excela');
    }
  };

  const handleMailWholesaler = async (wholesalerName: string) => {
    try {
      const count = await sendWholesalerOrderMail(rows, columns, wholesalerName, quote?.name);
      toast.success(
        `Skopiowano tabelę (${count}) — w poczcie wciśnij Ctrl+V`,
      );
    } catch (err) {
      if (err instanceof Error && err.message === 'NO_ROWS') {
        toast.error(`Brak produktów z najniższą ceną u ${wholesalerName}`);
        return;
      }
      toast.error('Nie udało się przygotować wiadomości');
    }
  };

  const handlePrint = () => setIsPrinting(true);

  useEffect(() => {
    if (!isPrinting) return;
    const timer = setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [isPrinting]);

  const handleRenameQuote = async (value: string) => {
    if (!quote) return;
    const next = value.trim();
    if (!next || next === quote.name) return;
    try {
      await renameQuote.mutateAsync({ id: quote.id, name: next });
      toast.success('Zmieniono nazwę oferty');
    } catch {
      toast.error('Nie udało się zmienić nazwy');
    }
  };

  const handleToggleLock = async () => {
    if (!quote) return;
    try {
      await setLocked.mutateAsync({ id: quote.id, isLocked: !quote.isLocked });
      toast.success(quote.isLocked ? 'Oferta odblokowana' : 'Oferta zamknięta');
    } catch {
      toast.error('Błąd zmiany statusu');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !id) return;
    try {
      if (deleteTarget.type === 'column') {
        await deleteColumn.mutateAsync({ id: deleteTarget.id, quoteId: id });
      } else {
        await deleteRow.mutateAsync({ id: deleteTarget.id, quoteId: id });
      }
      setDeleteTarget(null);
      toast.success('Usunięto');
    } catch {
      toast.error('Nie udało się usunąć');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-600">
        Ładowanie oferty…
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-rose-600">
        Nie znaleziono oferty.
      </div>
    );
  }

  return (
    <MainLayout pageTitle={quote.name}>
      <div className="flex h-full min-h-0 flex-col overflow-x-hidden bg-slate-50 text-slate-900">
        <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-3 sm:px-4 md:px-6">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-2 sm:gap-3">
              <Link
                to="/offers"
                className="mt-0.5 shrink-0 cursor-pointer rounded-lg border border-slate-300 p-2 hover:bg-slate-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <input
                key={quote.id + quote.name}
                type="text"
                defaultValue={quote.name}
                onBlur={(e) => void handleRenameQuote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-lg font-semibold outline-none hover:border-slate-300 focus:border-slate-400 focus:bg-white sm:text-xl md:text-2xl"
                title="Kliknij, aby zmienić nazwę"
              />
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto lg:flex lg:shrink-0 lg:flex-nowrap">
              <button
                type="button"
                onClick={() => void handleCopySummary()}
                disabled={rows.length === 0}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 lg:w-auto lg:px-4"
              >
                <Clipboard className="h-4 w-4" />
                <span className="sm:hidden">Tabela</span>
                <span className="hidden sm:inline">Kopiuj tabelę</span>
              </button>
              <button
                type="button"
                onClick={() => void handleCopyExcel()}
                disabled={rows.length === 0}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-emerald-300 bg-emerald-50 px-3 text-sm font-semibold text-emerald-900 shadow-sm hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-45 lg:w-auto lg:px-4"
                title="EAN · Cena półkowa · Najniższa · 1 · 1 (bez nagłówków)"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="sm:hidden">Excel</span>
                <span className="hidden sm:inline">Kopiuj do Excel</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                disabled={rows.length === 0 || isPrinting}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 lg:w-auto lg:px-4"
              >
                <Printer className="h-4 w-4" />
                Drukuj
              </button>
              <button
                type="button"
                onClick={handleToggleLock}
                disabled={setLocked.isPending}
                className={
                  quote.isLocked
                    ? 'inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto lg:px-4'
                    : 'inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white shadow-sm ring-2 ring-slate-900/20 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto lg:px-4'
                }
              >
                {quote.isLocked ? (
                  <>
                    <Unlock className="h-4 w-4" /> Odblokuj
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span className="sm:hidden">Zamknij</span>
                    <span className="hidden sm:inline">Zamknij ofertę</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:px-4 md:flex-row md:flex-wrap md:items-stretch md:px-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-stretch md:min-w-[18rem]">
            <input
              type="text"
              value={newRowName}
              onChange={(e) => setNewRowName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddRow()}
              placeholder="Nazwa produktu"
              className="min-w-0 w-full flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
            <input
              type="text"
              value={newRowEan}
              onChange={(e) => setNewRowEan(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddRow()}
              placeholder="Kod EAN"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base tabular-nums outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 sm:w-36 lg:w-40"
            />
            <button
              type="button"
              onClick={handleAddRow}
              disabled={!newRowName.trim() || addRow.isPending}
              className="inline-flex h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
            >
              <Plus className="h-4 w-4" /> Produkt
            </button>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-stretch md:min-w-[14rem] md:max-w-md">
            <input
              type="text"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
              placeholder="Nazwa hurtowni"
              className="min-w-0 w-full flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
            <button
              type="button"
              onClick={handleAddColumn}
              disabled={!newColName.trim() || addColumn.isPending}
              className="inline-flex h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
            >
              <Plus className="h-4 w-4" /> Hurtownia
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3">
            {columns.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Hurtownie — linki
                </p>
                <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {columns.map((col) => (
                    <li
                      key={col.id}
                      className="flex min-w-0 flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 sm:min-w-[15rem] sm:max-w-sm sm:flex-1 sm:flex-row sm:items-center lg:min-w-[16rem]"
                    >
                      <input
                        type="text"
                        defaultValue={col.name}
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v && v !== col.name) {
                            void renameColumn.mutateAsync({
                              id: col.id,
                              name: v,
                              quoteId: id,
                            });
                          }
                        }}
                        className="min-w-0 w-full flex-1 rounded border border-transparent bg-white px-2 py-2 text-sm font-semibold text-slate-800 outline-none hover:border-slate-300 focus:border-slate-400"
                        title="Nazwa hurtowni"
                      />
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleMailWholesaler(col.name)}
                          className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                          title={`Wyślij do ${col.name} produkty z najniższą ceną`}
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(col.accessToken, col.name)}
                          className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3 text-sm font-semibold text-white hover:bg-slate-700 sm:flex-none"
                          title="Kopiuj link dla hurtowni"
                        >
                          <Copy className="h-4 w-4" /> Link
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({ type: 'column', id: col.id, label: col.name })
                          }
                          className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Usuń hurtownię"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {rows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-slate-500">
                Dodaj pierwszy produkt powyżej — nazwa + opcjonalny EAN, potem{' '}
                <span className="font-semibold text-sky-700">+ Produkt</span>.
              </div>
            ) : (
              <>
                {/* Karty — laptopy / małe monitory (bez scrolla poziomego) */}
                <div className="flex flex-col gap-3 xl:hidden">
                  {rows.map((row) => {
                    const byCol: Record<string, string> = {};
                    for (const cell of row.cells || []) {
                      byCol[cell.columnId] = cell.value;
                    }
                    const min = computeQuoteRowMin(byCol, columns);
                    const summary = applyQuoteRowSummaryOverrides(min, row);

                    return (
                      <article
                        key={row.id}
                        className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                      >
                        <div className="mb-2 flex items-start gap-2">
                          <input
                            type="text"
                            defaultValue={row.name}
                            onBlur={(e) => {
                              const v = e.target.value.trim();
                              if (v && v !== row.name) {
                                void renameRow.mutateAsync({
                                  id: row.id,
                                  name: v,
                                  quoteId: id,
                                });
                              }
                            }}
                            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-slate-400"
                            placeholder="Nazwa produktu"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({ type: 'row', id: row.id, label: row.name })
                            }
                            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Usuń produkt"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="mb-3 flex items-center gap-2">
                          <input
                            type="text"
                            defaultValue={row.ean}
                            onBlur={(e) => {
                              const v = e.target.value.trim();
                              if (v !== (row.ean || '')) {
                                void updateEan.mutateAsync({
                                  id: row.id,
                                  ean: v,
                                  quoteId: id,
                                });
                              }
                            }}
                            placeholder="Kod EAN"
                            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm tabular-nums outline-none focus:border-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() => void handleCopyEan(row.ean)}
                            disabled={!row.ean?.trim()}
                            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
                            title="Kopiuj EAN"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>

                        {columns.length > 0 && (
                          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {columns.map((col) => (
                              <div
                                key={col.id}
                                className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-2 text-center"
                              >
                                <div className="flex items-center justify-center gap-1">
                                  <div className="truncate text-xs font-medium text-slate-500">
                                    {col.name}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => void handleMailWholesaler(col.name)}
                                    className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-slate-400 hover:bg-sky-50 hover:text-sky-700"
                                    title={`Wyślij do ${col.name} produkty z najniższą ceną`}
                                  >
                                    <Mail className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                <div className="mt-0.5 text-base font-semibold tabular-nums text-slate-900">
                                  {byCol[col.id]?.trim() ? formatPricePl(byCol[col.id]) : '—'}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <div className="rounded-lg bg-amber-50 px-2 py-1.5">
                            <div className="mb-0.5 text-center text-xs font-semibold text-amber-800">
                              Najniższa
                            </div>
                            <input
                              type="text"
                              inputMode="decimal"
                              defaultValue={
                                summary.minLabel === '—' ? '' : formatPricePl(summary.minLabel)
                              }
                              onChange={(e) => {
                                void updateSummary.mutateAsync({
                                  id: row.id,
                                  lowestPrice: e.target.value,
                                  quoteId: id,
                                });
                              }}
                              placeholder="Automatycznie"
                              title="Pozostaw puste, aby wyliczać automatycznie"
                              className="w-full rounded border border-transparent bg-white px-2 py-1.5 text-center font-bold tabular-nums text-amber-950 outline-none hover:border-amber-300 focus:border-amber-400"
                            />
                          </div>
                          <div className="rounded-lg bg-amber-50 px-2 py-1.5">
                            <div className="mb-0.5 text-center text-xs font-semibold text-amber-800">
                              Hurtownia
                            </div>
                            <input
                              type="text"
                              defaultValue={summary.sourceLabel === '—' ? '' : summary.sourceLabel}
                              onChange={(e) => {
                                void updateSummary.mutateAsync({
                                  id: row.id,
                                  lowestWholesaler: e.target.value,
                                  quoteId: id,
                                });
                              }}
                              placeholder="Automatycznie"
                              title="Pozostaw puste, aby wyliczać automatycznie"
                              className="w-full rounded border border-transparent bg-white px-2 py-1.5 text-center text-sm font-semibold text-amber-950 outline-none hover:border-amber-300 focus:border-amber-400"
                            />
                          </div>
                          <div className="rounded-lg bg-emerald-50 px-2 py-1.5">
                            <div className="mb-0.5 text-center text-xs font-semibold text-emerald-800">
                              Cena półkowa
                            </div>
                            <input
                              type="text"
                              inputMode="decimal"
                              defaultValue={row.shelfPrice}
                              onBlur={(e) => {
                                const v = e.target.value.trim();
                                if (v !== (row.shelfPrice || '')) {
                                  void updateShelfPrice.mutateAsync({
                                    id: row.id,
                                    shelfPrice: v,
                                    quoteId: id,
                                  });
                                }
                              }}
                              placeholder="0,00"
                              className="w-full rounded border border-transparent bg-white px-2 py-1.5 text-center font-semibold tabular-nums text-emerald-950 outline-none focus:border-emerald-400"
                            />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Tabela — duże ekrany */}
                <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white xl:block">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse text-left text-base">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100">
                          <th className="sticky left-0 z-10 min-w-[10rem] bg-slate-100 px-3 py-3 font-semibold text-slate-700">
                            Produkt
                          </th>
                          <th className="min-w-[9rem] bg-slate-100 px-2 py-3 font-semibold text-slate-700">
                            Kod EAN
                          </th>
                          {columns.map((col) => (
                            <th
                              key={col.id}
                              className="min-w-[6.5rem] max-w-[9rem] px-2 py-3 text-center text-sm font-semibold text-slate-800"
                              title={col.name}
                            >
                              <span className="inline-flex items-center justify-center gap-1">
                                <span className="line-clamp-2 break-words">{col.name}</span>
                                <button
                                  type="button"
                                  onClick={() => void handleMailWholesaler(col.name)}
                                  className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-500 hover:bg-sky-50 hover:text-sky-700"
                                  title={`Wyślij do ${col.name} produkty z najniższą ceną`}
                                >
                                  <Mail className="h-3.5 w-3.5" />
                                </button>
                              </span>
                            </th>
                          ))}
                          <th className="min-w-[5rem] bg-amber-50 px-2 py-3 text-center text-sm font-semibold text-amber-900">
                            Najniższa
                          </th>
                          <th className="min-w-[5.5rem] bg-amber-50 px-2 py-3 text-center text-sm font-semibold text-amber-900">
                            Hurtownia
                          </th>
                          <th className="min-w-[6.5rem] bg-emerald-50 px-2 py-3 text-center text-sm font-semibold text-emerald-900">
                            Cena półkowa
                          </th>
                          <th className="w-12 px-1 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => {
                          const byCol: Record<string, string> = {};
                          for (const cell of row.cells || []) {
                            byCol[cell.columnId] = cell.value;
                          }
                          const min = computeQuoteRowMin(byCol, columns);
                          const summary = applyQuoteRowSummaryOverrides(min, row);

                          return (
                            <tr
                              key={row.id}
                              className="group border-b border-slate-100 last:border-0"
                            >
                              <td className="sticky left-0 z-10 bg-white px-2 py-2 transition-colors group-hover:bg-sky-50">
                                <input
                                  type="text"
                                  defaultValue={row.name}
                                  onBlur={(e) => {
                                    const v = e.target.value.trim();
                                    if (v && v !== row.name) {
                                      void renameRow.mutateAsync({
                                        id: row.id,
                                        name: v,
                                        quoteId: id,
                                      });
                                    }
                                  }}
                                  className="w-full rounded border border-transparent bg-transparent px-2 py-2 font-medium hover:border-slate-300 focus:border-slate-400 focus:outline-none"
                                />
                              </td>
                              <td className="px-2 py-2 transition-colors group-hover:bg-sky-50">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    defaultValue={row.ean}
                                    onBlur={(e) => {
                                      const v = e.target.value.trim();
                                      if (v !== (row.ean || '')) {
                                        void updateEan.mutateAsync({
                                          id: row.id,
                                          ean: v,
                                          quoteId: id,
                                        });
                                      }
                                    }}
                                    placeholder="EAN"
                                    className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-2 py-2 font-mono text-sm tabular-nums hover:border-slate-300 focus:border-slate-400 focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => void handleCopyEan(row.ean)}
                                    disabled={!row.ean?.trim()}
                                    className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
                                    title="Kopiuj EAN"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                              {columns.map((col) => (
                                <td
                                  key={col.id}
                                  className="px-2 py-2 text-center tabular-nums text-slate-800 transition-colors group-hover:bg-sky-50"
                                >
                                  {byCol[col.id]?.trim() ? formatPricePl(byCol[col.id]) : '—'}
                                </td>
                              ))}
                              <td className="bg-amber-50/60 px-2 py-2 transition-colors group-hover:bg-amber-100">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  defaultValue={
                                    summary.minLabel === '—' ? '' : formatPricePl(summary.minLabel)
                                  }
                                  onChange={(e) => {
                                    void updateSummary.mutateAsync({
                                      id: row.id,
                                      lowestPrice: e.target.value,
                                      quoteId: id,
                                    });
                                  }}
                                  placeholder="Automatycznie"
                                  title="Pozostaw puste, aby wyliczać automatycznie"
                                  className="w-full rounded border border-transparent bg-transparent px-2 py-2 text-center font-semibold tabular-nums text-amber-950 hover:border-amber-300 focus:border-amber-400 focus:bg-white focus:outline-none"
                                />
                              </td>
                              <td className="bg-amber-50/60 px-2 py-2 transition-colors group-hover:bg-amber-100">
                                <input
                                  type="text"
                                  defaultValue={summary.sourceLabel === '—' ? '' : summary.sourceLabel}
                                  onChange={(e) => {
                                    void updateSummary.mutateAsync({
                                      id: row.id,
                                      lowestWholesaler: e.target.value,
                                      quoteId: id,
                                    });
                                  }}
                                  placeholder="Automatycznie"
                                  title="Pozostaw puste, aby wyliczać automatycznie"
                                  className="w-full rounded border border-transparent bg-transparent px-2 py-2 text-center text-sm font-medium text-amber-950 hover:border-amber-300 focus:border-amber-400 focus:bg-white focus:outline-none"
                                />
                              </td>
                              <td className="bg-emerald-50/70 px-2 py-2 transition-colors group-hover:bg-emerald-100">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  defaultValue={row.shelfPrice}
                                  onBlur={(e) => {
                                    const v = e.target.value.trim();
                                    if (v !== (row.shelfPrice || '')) {
                                      void updateShelfPrice.mutateAsync({
                                        id: row.id,
                                        shelfPrice: v,
                                        quoteId: id,
                                      });
                                    }
                                  }}
                                  placeholder="0,00"
                                  className="w-full rounded border border-transparent bg-transparent px-2 py-2 text-center font-semibold tabular-nums text-emerald-950 hover:border-emerald-300 focus:border-emerald-400 focus:bg-white focus:outline-none"
                                />
                              </td>
                              <td className="px-1 py-2 text-center transition-colors group-hover:bg-sky-50">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteTarget({ type: 'row', id: row.id, label: row.name })
                                  }
                                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                  title="Usuń produkt"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
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
      </div>

      {isPrinting && (
        <PrintOfferReport offerName={quote.name} rows={rows} columns={columns} />
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={deleteTarget?.type === 'column' ? 'Usuń hurtownię' : 'Usuń produkt'}
        message={`Czy na pewno usunąć „${deleteTarget?.label ?? ''}”?`}
        confirmLabel="Usuń"
        variant="danger"
      />
    </MainLayout>
  );
};
