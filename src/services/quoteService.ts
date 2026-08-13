import { supabase } from '../lib/supabase';
import {
  Quote,
  QuoteCell,
  QuoteColumn,
  QuoteRow,
  PublicQuotePayload,
  PublicQuotePayloadSchema,
  QuoteSchema,
} from '../types/quoteSchemas';

export class QuoteAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuoteAccessError';
  }
}

interface DbCell {
  id: string;
  row_id: string;
  column_id: string;
  value: string;
  created_at: string | null;
  updated_at: string | null;
}

interface DbColumn {
  id: string;
  quote_id: string;
  name: string;
  access_token: string;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
}

interface DbRow {
  id: string;
  quote_id: string;
  name: string;
  ean?: string | null;
  shelf_price?: string | null;
  lowest_price?: string | null;
  lowest_wholesaler?: string | null;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
  quote_cells?: DbCell[];
}

interface DbQuote {
  id: string;
  user_id: string;
  name: string;
  is_locked: boolean;
  created_at: string | null;
  updated_at: string | null;
  quote_columns?: DbColumn[];
  quote_rows?: DbRow[];
}

function mapCell(c: DbCell): QuoteCell {
  return {
    id: c.id,
    rowId: c.row_id,
    columnId: c.column_id,
    value: c.value,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

function mapColumn(c: DbColumn): QuoteColumn {
  return {
    id: c.id,
    quoteId: c.quote_id,
    name: c.name,
    accessToken: c.access_token,
    sortOrder: c.sort_order,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

function mapRow(r: DbRow): QuoteRow {
  return {
    id: r.id,
    quoteId: r.quote_id,
    name: r.name,
    ean: r.ean ?? '',
    shelfPrice: r.shelf_price ?? '',
    lowestPrice: r.lowest_price ?? '',
    lowestWholesaler: r.lowest_wholesaler ?? '',
    sortOrder: r.sort_order,
    cells: (r.quote_cells || []).map(mapCell),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapQuote(q: DbQuote, includeNested = false): Quote {
  return QuoteSchema.parse({
    id: q.id,
    userId: q.user_id,
    name: q.name,
    isLocked: q.is_locked,
    createdAt: q.created_at,
    updatedAt: q.updated_at,
    columns: includeNested
      ? [...(q.quote_columns || [])].sort((a, b) => a.sort_order - b.sort_order).map(mapColumn)
      : [],
    rows: includeNested
      ? [...(q.quote_rows || [])].sort((a, b) => a.sort_order - b.sort_order).map(mapRow)
      : [],
  });
}

function isInvalidAccess(error: { message?: string }): boolean {
  return error.message?.includes('invalid_quote_access') === true;
}

function isLockedError(error: { message?: string }): boolean {
  return error.message?.includes('quote_locked') === true;
}

export const quoteService = {
  async getMyQuotes(userId: string): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select(
        `
        *,
        quote_columns (*),
        quote_rows (
          *,
          quote_cells (*)
        )
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return ((data || []) as DbQuote[]).map((q) => mapQuote(q, true));
  },

  async getQuoteById(id: string): Promise<Quote> {
    const { data, error } = await supabase
      .from('quotes')
      .select(
        `
        *,
        quote_columns (*),
        quote_rows (
          *,
          quote_cells (*)
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return mapQuote(data as DbQuote, true);
  },

  async createQuote(name: string, userId: string): Promise<Quote> {
    const { data, error } = await supabase
      .from('quotes')
      .insert({ name, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapQuote(data as DbQuote);
  },

  async renameQuote(id: string, name: string): Promise<void> {
    const { error } = await supabase
      .from('quotes')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  /** Copy structure (rows + columns) without cell prices. */
  async duplicateQuote(sourceId: string, userId: string, newName: string): Promise<Quote> {
    const source = await this.getQuoteById(sourceId);
    const created = await this.createQuote(newName, userId);

    for (const col of source.columns || []) {
      await this.addColumn(created.id, col.name);
    }
    for (const row of source.rows || []) {
      await this.addRow(created.id, row.name, row.ean);
    }

    return this.getQuoteById(created.id);
  },

  async deleteQuote(id: string): Promise<void> {
    const { error } = await supabase.from('quotes').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async setLocked(id: string, isLocked: boolean): Promise<void> {
    const { error } = await supabase
      .from('quotes')
      .update({ is_locked: isLocked, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async addColumn(quoteId: string, name: string): Promise<QuoteColumn> {
    const { count } = await supabase
      .from('quote_columns')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quoteId);

    const { data, error } = await supabase
      .from('quote_columns')
      .insert({ quote_id: quoteId, name, sort_order: count ?? 0 })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapColumn(data as DbColumn);
  },

  async renameColumn(id: string, name: string): Promise<void> {
    const { error } = await supabase
      .from('quote_columns')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async deleteColumn(id: string): Promise<void> {
    const { error } = await supabase.from('quote_columns').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async addRow(quoteId: string, name: string, ean = ''): Promise<QuoteRow> {
    const { count } = await supabase
      .from('quote_rows')
      .select('*', { count: 'exact', head: true })
      .eq('quote_id', quoteId);

    const { data, error } = await supabase
      .from('quote_rows')
      .insert({
        quote_id: quoteId,
        name,
        ean: ean.trim(),
        sort_order: count ?? 0,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapRow(data as DbRow);
  },

  async renameRow(id: string, name: string): Promise<void> {
    const { error } = await supabase
      .from('quote_rows')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async updateRowEan(id: string, ean: string): Promise<void> {
    const { error } = await supabase
      .from('quote_rows')
      .update({ ean: ean.trim(), updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async updateRowShelfPrice(id: string, shelfPrice: string): Promise<void> {
    const { error } = await supabase
      .from('quote_rows')
      .update({ shelf_price: shelfPrice.trim(), updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async updateRowSummary(
    id: string,
    values: { lowestPrice?: string; lowestWholesaler?: string },
  ): Promise<void> {
    const update: {
      lowest_price?: string;
      lowest_wholesaler?: string;
      updated_at: string;
    } = { updated_at: new Date().toISOString() };

    if (values.lowestPrice !== undefined) update.lowest_price = values.lowestPrice.trim();
    if (values.lowestWholesaler !== undefined) {
      update.lowest_wholesaler = values.lowestWholesaler.trim();
    }

    const { error } = await supabase.from('quote_rows').update(update).eq('id', id);
    if (error) throw new Error(error.message);
  },

  async deleteRow(id: string): Promise<void> {
    const { error } = await supabase.from('quote_rows').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async getPublicQuote(token: string): Promise<PublicQuotePayload> {
    const { data, error } = await supabase.rpc('get_public_quote', { p_token: token });

    if (error) {
      if (isInvalidAccess(error)) throw new QuoteAccessError('INVALID_ACCESS');
      throw new Error(error.message);
    }

    const raw = data as {
      quote: {
        id: string;
        name: string;
        is_locked: boolean;
        created_at?: string | null;
        updated_at?: string | null;
      };
      column: { id: string; name: string };
      rows: { id: string; name: string; ean?: string; sort_order: number; value: string }[];
    };

    return PublicQuotePayloadSchema.parse({
      quote: {
        id: raw.quote.id,
        name: raw.quote.name,
        isLocked: raw.quote.is_locked,
        createdAt: raw.quote.created_at ?? null,
        updatedAt: raw.quote.updated_at ?? null,
      },
      column: raw.column,
      rows: (raw.rows || []).map((r) => ({
        id: r.id,
        name: r.name,
        ean: r.ean ?? '',
        sortOrder: r.sort_order,
        value: r.value ?? '',
      })),
    });
  },

  async upsertPublicCell(token: string, rowId: string, value: string): Promise<void> {
    const { error } = await supabase.rpc('upsert_public_quote_cell', {
      p_token: token,
      p_row_id: rowId,
      p_value: value,
    });

    if (error) {
      if (isInvalidAccess(error)) throw new QuoteAccessError('INVALID_ACCESS');
      if (isLockedError(error)) throw new QuoteAccessError('QUOTE_LOCKED');
      throw new Error(error.message);
    }
  },
};
