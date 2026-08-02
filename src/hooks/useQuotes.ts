import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { quoteService, QuoteAccessError } from '../services/quoteService';

export const quoteKeys = {
  all: ['quotes'] as const,
  lists: () => [...quoteKeys.all, 'list'] as const,
  list: (userId: string) => [...quoteKeys.lists(), userId] as const,
  detail: (id: string) => [...quoteKeys.all, 'detail', id] as const,
  public: (token: string) => [...quoteKeys.all, 'public', token] as const,
};

export { QuoteAccessError };

export function useMyQuotes(userId: string) {
  return useQuery({
    queryKey: quoteKeys.list(userId),
    queryFn: () => quoteService.getMyQuotes(userId),
    enabled: !!userId,
  });
}

export function useQuote(quoteId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: quoteKeys.detail(quoteId),
    queryFn: () => quoteService.getQuoteById(quoteId),
    enabled: !!quoteId,
  });

  useEffect(() => {
    if (!quoteId) return;

    const channel = supabase
      .channel(`quote_live_${quoteId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quotes', filter: `id=eq.${quoteId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: quoteKeys.detail(quoteId) });
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quote_columns', filter: `quote_id=eq.${quoteId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: quoteKeys.detail(quoteId) });
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quote_rows', filter: `quote_id=eq.${quoteId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: quoteKeys.detail(quoteId) });
        },
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quote_cells' }, () => {
        // Cells have no quote_id — refresh detail; cheap for single open offer
        queryClient.invalidateQueries({ queryKey: quoteKeys.detail(quoteId) });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [quoteId, queryClient]);

  return query;
}

export function usePublicQuote(token: string) {
  return useQuery({
    queryKey: quoteKeys.public(token),
    queryFn: () => quoteService.getPublicQuote(token),
    enabled: !!token,
    retry: false,
    refetchInterval: 3000,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, userId }: { name: string; userId: string }) =>
      quoteService.createQuote(name, userId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.list(vars.userId) });
    },
  });
}

export function useRenameQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => quoteService.renameQuote(id, name),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(vars.id) });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
}

export function useDuplicateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sourceId,
      userId,
      newName,
    }: {
      sourceId: string;
      userId: string;
      newName: string;
    }) => quoteService.duplicateQuote(sourceId, userId, newName),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.list(vars.userId) });
    },
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quoteService.deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
}

export function useSetQuoteLocked() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isLocked }: { id: string; isLocked: boolean }) =>
      quoteService.setLocked(id, isLocked),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(vars.id) });
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
}

export function useAddQuoteColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quoteId, name }: { quoteId: string; name: string }) =>
      quoteService.addColumn(quoteId, name),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(vars.quoteId) });
    },
  });
}

export function useRenameQuoteColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, quoteId }: { id: string; name: string; quoteId: string }) =>
      quoteService.renameColumn(id, name),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(vars.quoteId) });
    },
  });
}

export function useDeleteQuoteColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quoteId }: { id: string; quoteId: string }) => quoteService.deleteColumn(id),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(vars.quoteId) });
    },
  });
}

export function useAddQuoteRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quoteId, name, ean = '' }: { quoteId: string; name: string; ean?: string }) =>
      quoteService.addRow(quoteId, name, ean),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(vars.quoteId) });
    },
  });
}

export function useRenameQuoteRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, quoteId }: { id: string; name: string; quoteId: string }) =>
      quoteService.renameRow(id, name),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(vars.quoteId) });
    },
  });
}

export function useUpdateQuoteRowEan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ean, quoteId }: { id: string; ean: string; quoteId: string }) =>
      quoteService.updateRowEan(id, ean),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(vars.quoteId) });
    },
  });
}

export function useUpdateQuoteRowShelfPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      shelfPrice,
      quoteId,
    }: {
      id: string;
      shelfPrice: string;
      quoteId: string;
    }) => quoteService.updateRowShelfPrice(id, shelfPrice),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(vars.quoteId) });
    },
  });
}

export function useDeleteQuoteRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quoteId }: { id: string; quoteId: string }) => quoteService.deleteRow(id),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.detail(vars.quoteId) });
    },
  });
}

export function useUpsertPublicQuoteCell(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rowId, value }: { rowId: string; value: string }) =>
      quoteService.upsertPublicCell(token, rowId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.public(token) });
    },
  });
}
