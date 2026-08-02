import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { APP_CONFIG } from '../config/app';
import { usePublicQuote, QuoteAccessError } from '../hooks/useQuotes';
import { useAutosaveQuoteCells } from '../hooks/useAutosaveQuoteCells';

export const PublicOfferPage: React.FC = () => {
  const { token = '' } = useParams<{ token: string }>();
  const { data, isLoading, error, isFetching } = usePublicQuote(token);
  const isLocked = data?.quote.isLocked ?? false;
  const { values, setCellValue, flushRow, syncFromServer, status } = useAutosaveQuoteCells(
    token,
    isLocked,
  );

  useEffect(() => {
    if (data?.quote.name) {
      document.title = `${data.quote.name} · ${APP_CONFIG.APP_NAME}`;
    }
  }, [data?.quote.name]);

  useEffect(() => {
    if (data?.rows) {
      syncFromServer(data.rows);
    }
  }, [data?.rows, syncFromServer]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-rose-600">
        Nieprawidłowy link.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Ładowanie…
      </div>
    );
  }

  if (error || !data) {
    const msg =
      error instanceof QuoteAccessError || (error as Error)?.message?.includes('INVALID')
        ? 'Nieprawidłowy lub nieaktualny link.'
        : 'Nie udało się załadować oferty.';
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-rose-600">
        {msg}
      </div>
    );
  }

  const dateLabel = data.quote.createdAt
    ? new Date(data.quote.createdAt).toLocaleDateString('pl-PL')
    : new Date().toLocaleDateString('pl-PL');

  const statusLabel =
    status === 'saving'
      ? 'Zapisywanie…'
      : status === 'saved'
        ? 'Zapisano'
        : status === 'error'
          ? 'Błąd zapisu'
          : isFetching
            ? 'Aktualizacja…'
            : '';

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-4 sm:py-6">
        <header className="mb-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="break-words text-xl font-semibold sm:text-2xl">{data.quote.name}</h1>
              <p className="mt-1 text-sm text-slate-500">{dateLabel}</p>
            </div>
            <div className="text-right text-sm text-slate-500">
              {isLocked && (
                <span className="mb-1 inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                  <Lock className="h-3 w-3" /> Zamknięta
                </span>
              )}
              {statusLabel && <div className="mt-1">{statusLabel}</div>}
            </div>
          </div>
        </header>

        {/* Mobile cards */}
        <div className="flex flex-col gap-3 sm:hidden">
          {data.rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-slate-500">
              Brak produktów — poczekaj, aż zostaną dodane.
            </div>
          ) : (
            data.rows.map((row) => (
              <div key={row.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="font-semibold leading-snug text-slate-900">{row.name}</div>
                <div className="mt-1 font-mono text-sm tabular-nums text-slate-500">
                  {row.ean?.trim() ? row.ean : '—'}
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  disabled={isLocked}
                  value={values[row.id] ?? ''}
                  onChange={(e) => setCellValue(row.id, e.target.value)}
                  onBlur={() => void flushRow(row.id)}
                  placeholder="Cena"
                  className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-center text-lg tabular-nums outline-none focus:border-slate-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            ))
          )}
        </div>

        {/* Desktop / tablet table */}
        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white sm:block">
          <table className="w-full border-collapse text-left text-base">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="px-4 py-3 font-semibold text-slate-700">Produkt</th>
                <th className="px-3 py-3 font-semibold text-slate-700">Kod EAN</th>
                <th className="w-32 px-4 py-3 text-center font-semibold text-slate-700 sm:w-40">
                  Cena
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-slate-500">
                    Brak produktów — poczekaj, aż zostaną dodane.
                  </td>
                </tr>
              ) : (
                data.rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium leading-snug">{row.name}</td>
                    <td className="px-3 py-3 font-mono text-sm tabular-nums text-slate-600">
                      {row.ean?.trim() ? row.ean : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        disabled={isLocked}
                        value={values[row.id] ?? ''}
                        onChange={(e) => setCellValue(row.id, e.target.value)}
                        onBlur={() => void flushRow(row.id)}
                        placeholder="0,00"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-center text-lg tabular-nums outline-none focus:border-slate-500 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
