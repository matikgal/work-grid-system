import { useCallback, useEffect, useRef, useState } from 'react';
import { quoteService, QuoteAccessError } from '../services/quoteService';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Local value + debounced autosave (blur / debounce / page hide).
 * Does not require Enter.
 */
export function useAutosaveQuoteCells(token: string, isLocked: boolean) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SaveStatus>('idle');
  const valuesRef = useRef(values);
  const dirtyRef = useRef<Set<string>>(new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastSavedRef = useRef<Record<string, string>>({});

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const flushRow = useCallback(
    async (rowId: string) => {
      if (isLocked) return;
      const timer = timersRef.current.get(rowId);
      if (timer) {
        clearTimeout(timer);
        timersRef.current.delete(rowId);
      }
      if (!dirtyRef.current.has(rowId)) return;

      const value = valuesRef.current[rowId] ?? '';
      if (lastSavedRef.current[rowId] === value) {
        dirtyRef.current.delete(rowId);
        return;
      }

      setStatus('saving');
      try {
        await quoteService.upsertPublicCell(token, rowId, value);
        lastSavedRef.current[rowId] = value;
        dirtyRef.current.delete(rowId);
        setStatus('saved');
      } catch (e) {
        if (e instanceof QuoteAccessError && e.message === 'QUOTE_LOCKED') {
          setStatus('idle');
          return;
        }
        setStatus('error');
      }
    },
    [isLocked, token],
  );

  const flushAll = useCallback(async () => {
    const ids = [...dirtyRef.current];
    await Promise.all(ids.map((id) => flushRow(id)));
  }, [flushRow]);

  const syncFromServer = useCallback((rows: { id: string; value: string }[]) => {
    setValues((prev) => {
      const next = { ...prev };
      for (const row of rows) {
        // Don't overwrite a cell the user is still editing
        if (dirtyRef.current.has(row.id)) continue;
        next[row.id] = row.value ?? '';
        lastSavedRef.current[row.id] = row.value ?? '';
      }
      return next;
    });
  }, []);

  const setCellValue = useCallback(
    (rowId: string, value: string) => {
      setValues((prev) => ({ ...prev, [rowId]: value }));
      dirtyRef.current.add(rowId);

      const existing = timersRef.current.get(rowId);
      if (existing) clearTimeout(existing);

      timersRef.current.set(
        rowId,
        setTimeout(() => {
          void flushRow(rowId);
        }, 500),
      );
    },
    [flushRow],
  );

  useEffect(() => {
    const onHide = () => {
      void flushAll();
    };
    const onVis = () => {
      if (document.visibilityState === 'hidden') void flushAll();
    };
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onVis);
      timersRef.current.forEach((t) => clearTimeout(t));
      void flushAll();
    };
  }, [flushAll]);

  return { values, setCellValue, flushRow, syncFromServer, status };
}
