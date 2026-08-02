/** Append today's date (pl-PL) to an offer name; replaces a trailing date if present. */
export function appendOfferDate(name: string, date = new Date()): string {
  const label = date.toLocaleDateString('pl-PL');
  const trimmed = name.trim();
  if (!trimmed) return label;
  if (trimmed.endsWith(label)) return trimmed;
  const withoutOld = trimmed.replace(/\s+\d{1,2}\.\d{1,2}\.\d{4}$/, '').trim();
  return `${withoutOld || trimmed} ${label}`;
}
