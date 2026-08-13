import { z } from 'zod';

export const QuoteCellSchema = z.object({
  id: z.string().uuid(),
  rowId: z.string().uuid(),
  columnId: z.string().uuid(),
  value: z.string(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export const QuoteColumnSchema = z.object({
  id: z.string().uuid(),
  quoteId: z.string().uuid(),
  name: z.string(),
  accessToken: z.string(),
  sortOrder: z.number().int().default(0),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export const QuoteRowSchema = z.object({
  id: z.string().uuid(),
  quoteId: z.string().uuid(),
  name: z.string(),
  ean: z.string().default(''),
  shelfPrice: z.string().default(''),
  lowestPrice: z.string().default(''),
  lowestWholesaler: z.string().default(''),
  sortOrder: z.number().int().default(0),
  cells: z.array(QuoteCellSchema).optional().default([]),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export const QuoteSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  isLocked: z.boolean().default(false),
  columns: z.array(QuoteColumnSchema).optional().default([]),
  rows: z.array(QuoteRowSchema).optional().default([]),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export const PublicQuoteRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  ean: z.string().default(''),
  sortOrder: z.number().int().default(0),
  value: z.string().default(''),
});

export const PublicQuotePayloadSchema = z.object({
  quote: z.object({
    id: z.string().uuid(),
    name: z.string(),
    isLocked: z.boolean(),
    createdAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
  }),
  column: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  rows: z.array(PublicQuoteRowSchema),
});

export type QuoteCell = z.infer<typeof QuoteCellSchema>;
export type QuoteColumn = z.infer<typeof QuoteColumnSchema>;
export type QuoteRow = z.infer<typeof QuoteRowSchema>;
export type Quote = z.infer<typeof QuoteSchema>;
export type PublicQuotePayload = z.infer<typeof PublicQuotePayloadSchema>;
