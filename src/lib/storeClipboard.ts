import type { Store } from '../services/storeService';

export type StoreClipboardRow = {
  name: string;
  address: string;
  phone: string;
  email: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function toStoreClipboardRows(stores: Store[]): StoreClipboardRow[] {
  return stores.map((s) => ({
    name: s.name?.trim() || `Sklep ${String(s.number).padStart(2, '0')}`,
    address: s.address?.trim() || '',
    phone: s.phone?.trim() || '',
    email: s.email?.trim() || '',
  }));
}

export function buildStoresClipboard(rows: StoreClipboardRow[]): { html: string; text: string } {
  const header = ['Sklep', 'Adres', 'Telefon', 'E-mail'];
  const body = rows.map((r) => [r.name, r.address, r.phone, r.email]);

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
        .map(
          (c) =>
            `<td style="padding:5px 10px;border:1px solid #cbd5e1;text-align:left;background-color:${bg};white-space:nowrap;">${escapeHtml(c)}</td>`,
        )
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('');

  const html = `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:auto;font-family:'Segoe UI',Arial,sans-serif;font-size:13px;line-height:1.35;"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
  const text = [header.join('\t'), ...body.map((r) => r.join('\t'))].join('\n');
  return { html, text };
}

async function copyHtmlAndText(html: string, text: string): Promise<void> {
  if (typeof ClipboardItem !== 'undefined') {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      }),
    ]);
    return;
  }
  await navigator.clipboard.writeText(text);
}

export function openMailWithBody(subject: string, body: string): void {
  const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const link = document.createElement('a');
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Copy compact HTML store table and open mail client (paste with Ctrl+V). */
export async function sendStoresDirectoryMail(stores: Store[]): Promise<number> {
  const rows = toStoreClipboardRows(stores);
  if (rows.length === 0) throw new Error('NO_ROWS');

  const { html, text } = buildStoresClipboard(rows);
  await copyHtmlAndText(html, text);

  openMailWithBody(
    'Sieć sklepów Paulinka',
    'Dzień dobry,\n\nPoniżej lista sklepów (wklej tabelę: Ctrl+V):\n\n',
  );
  return rows.length;
}
