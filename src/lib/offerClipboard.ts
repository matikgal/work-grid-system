import { computeQuoteRowMin } from './quoteMinPrice';
import type { QuoteColumn, QuoteRow } from '../types/quoteSchemas';

/** Digits only — avoids Excel scientific notation / stray separators. */
export function normalizeEan(raw: string | undefined | null): string {
  return (raw ?? '').replace(/\D/g, '');
}

/** Decimal separator for paste into PL Excel / programs: comma. */
export function formatPricePl(raw: string | undefined | null): string {
  const t = (raw ?? '').trim();
  if (!t || t === '—') return '';
  return t.replace(/\./g, ',');
}

/** HTML + plain text summary for Outlook */
export function buildOfferSummaryClipboard(
  rows: QuoteRow[],
  columns: QuoteColumn[],
): { html: string; text: string } {
  const header = ['Produkt', 'Kod EAN', 'Cena', 'Hurtownia', 'Cena półkowa'];
  const body = rows.map((row) => {
    const byCol: Record<string, string> = {};
    for (const cell of row.cells || []) {
      byCol[cell.columnId] = cell.value;
    }
    const min = computeQuoteRowMin(byCol, columns);
    return [
      row.name,
      normalizeEan(row.ean),
      min.minLabel === '—' ? '' : formatPricePl(min.minLabel),
      min.sourceLabel === '—' ? '' : min.sourceLabel,
      formatPricePl(row.shelfPrice),
    ];
  });

  const th = header
    .map(
      (h) =>
        `<th style="background-color:#f3f4f6;padding:8px;text-align:left;border:1px solid #d1d5db;">${escapeHtml(h)}</th>`,
    )
    .join('');

  const trs = body
    .map((cells) => {
      const tds = cells
        .map(
          (c, i) =>
            `<td style="padding:8px;border:1px solid #d1d5db;${i >= 2 ? 'text-align:center;' : ''}">${escapeHtml(c)}</td>`,
        )
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('');

  const html = `<table border="1" style="border-collapse:collapse;width:100%;"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
  const text = [header.join('\t'), ...body.map((r) => r.join('\t'))].join('\n');
  return { html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function copyOfferSummaryToClipboard(
  rows: QuoteRow[],
  columns: QuoteColumn[],
): Promise<void> {
  const { html, text } = buildOfferSummaryClipboard(rows, columns);
  if (typeof ClipboardItem !== 'undefined') {
    const data = [
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      }),
    ];
    await navigator.clipboard.write(data);
    return;
  }
  await navigator.clipboard.writeText(text);
}

/**
 * Raw TSV for Excel / program paste (no headers):
 * EAN | Cena półkowa | Najniższa | 1 | 1
 * EAN = digits only; prices use comma decimal.
 */
export function buildOfferExcelClipboard(rows: QuoteRow[], columns: QuoteColumn[]): string {
  return rows
    .map((row) => {
      const byCol: Record<string, string> = {};
      for (const cell of row.cells || []) {
        byCol[cell.columnId] = cell.value;
      }
      const min = computeQuoteRowMin(byCol, columns);
      const minPrice = min.minLabel === '—' ? '' : formatPricePl(min.minLabel);
      return [normalizeEan(row.ean), formatPricePl(row.shelfPrice), minPrice, '1', '1'].join('\t');
    })
    .join('\n');
}

export async function copyOfferExcelToClipboard(
  rows: QuoteRow[],
  columns: QuoteColumn[],
): Promise<void> {
  const text = buildOfferExcelClipboard(rows, columns);
  await navigator.clipboard.writeText(text);
}

export async function copyEanToClipboard(ean: string): Promise<void> {
  const digits = normalizeEan(ean);
  if (!digits) throw new Error('EMPTY_EAN');
  await navigator.clipboard.writeText(digits);
}
