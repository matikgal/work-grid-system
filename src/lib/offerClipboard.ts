import { computeQuoteRowMin, applyQuoteRowSummaryOverrides } from './quoteMinPrice';
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
    const summary = applyQuoteRowSummaryOverrides(computeQuoteRowMin(byCol, columns), row);
    return [
      row.name,
      normalizeEan(row.ean),
      summary.minLabel === '—' ? '' : formatPricePl(summary.minLabel),
      summary.sourceLabel === '—' ? '' : summary.sourceLabel,
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

async function copyHtmlAndText(html: string, text: string): Promise<void> {
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

export async function copyOfferSummaryToClipboard(
  rows: QuoteRow[],
  columns: QuoteColumn[],
): Promise<void> {
  const { html, text } = buildOfferSummaryClipboard(rows, columns);
  await copyHtmlAndText(html, text);
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
      const summary = applyQuoteRowSummaryOverrides(computeQuoteRowMin(byCol, columns), row);
      const minPrice = summary.minLabel === '—' ? '' : formatPricePl(summary.minLabel);
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

export type WholesalerOrderLine = {
  name: string;
  ean: string;
  price: string;
};

function rowValuesByColumn(row: QuoteRow): Record<string, string> {
  const byCol: Record<string, string> = {};
  for (const cell of row.cells || []) {
    byCol[cell.columnId] = cell.value;
  }
  return byCol;
}

function sameWholesalerName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Products where this wholesaler has the lowest price (Hurtownia column). */
export function collectWholesalerWinningRows(
  rows: QuoteRow[],
  columns: QuoteColumn[],
  wholesalerName: string,
): WholesalerOrderLine[] {
  const column = columns.find((c) => sameWholesalerName(c.name, wholesalerName));
  const lines: WholesalerOrderLine[] = [];

  for (const row of rows) {
    const byCol = rowValuesByColumn(row);
    const summary = applyQuoteRowSummaryOverrides(computeQuoteRowMin(byCol, columns), row);
    if (!sameWholesalerName(summary.sourceLabel, wholesalerName)) continue;

    const cellPrice = column ? byCol[column.id] : '';
    const priceRaw = cellPrice?.trim() || (summary.minLabel === '—' ? '' : summary.minLabel);
    lines.push({
      name: row.name,
      ean: normalizeEan(row.ean),
      price: formatPricePl(priceRaw),
    });
  }

  return lines;
}

export function buildWholesalerOrderClipboard(lines: WholesalerOrderLine[]): {
  html: string;
  text: string;
} {
  const header = ['Produkt', 'Kod EAN', 'Cena'];
  const body = lines.map((line) => [line.name, line.ean, line.price]);

  const th = header
    .map(
      (h) =>
        `<th style="background-color:#1e293b;color:#ffffff;padding:6px 10px;text-align:left;border:1px solid #334155;font-weight:700;white-space:nowrap;">${escapeHtml(h)}</th>`,
    )
    .join('');

  const trs = body
    .map((cells, rowIdx) => {
      const bg = rowIdx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const tds = cells
        .map((c, i) => {
          const align = i === 2 ? 'center' : 'left';
          const mono = i === 1 ? 'font-family:Consolas,monospace;' : '';
          return `<td style="padding:5px 10px;border:1px solid #cbd5e1;text-align:${align};background-color:${bg};white-space:nowrap;${mono}">${escapeHtml(c)}</td>`;
        })
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('');

  // width:auto — Outlook/Gmail stretch width:100% across the whole message pane
  const html = `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:auto;font-family:'Segoe UI',Arial,sans-serif;font-size:13px;line-height:1.35;"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
  const text = [header.join('\t'), ...body.map((r) => r.join('\t'))].join('\n');
  return { html, text };
}

export function openMailWithBody(subject: string, body: string): void {
  const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const link = document.createElement('a');
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Copy a compact HTML order table and open the mail client for one wholesaler. */
export async function sendWholesalerOrderMail(
  rows: QuoteRow[],
  columns: QuoteColumn[],
  wholesalerName: string,
  offerName?: string,
): Promise<number> {
  const lines = collectWholesalerWinningRows(rows, columns, wholesalerName);
  if (lines.length === 0) throw new Error('NO_ROWS');

  const { html, text } = buildWholesalerOrderClipboard(lines);
  await copyHtmlAndText(html, text);

  const subject = offerName?.trim()
    ? `${offerName.trim()} — ${wholesalerName}`
    : `Zamówienie — ${wholesalerName}`;
  // mailto supports only plain text — leave a short prompt; user pastes the HTML table (Ctrl+V)
  openMailWithBody(
    subject,
    'Dzień dobry,\n\nPoniżej zamówienie (wklej tabelę: Ctrl+V):\n\n',
  );
  return lines.length;
}
