export interface ImportEmployeeRow {
  name: string;
  role: string;
  phone?: string;
}

function normalizeEmployeeRow(raw: Record<string, unknown>): ImportEmployeeRow | null {
  const name = String(raw.name ?? raw.nazwa ?? '').trim();
  if (!name) return null;
  return {
    name,
    role: String(raw.role ?? raw.rola ?? '').trim(),
    phone: String(raw.phone ?? raw.telefon ?? '').trim(),
  };
}

export function parseEmployeeCsv(text: string): ImportEmployeeRow[] {
  const lines = text.trim().split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return [];

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const firstLower = lines[0].toLowerCase();
  const hasHeader =
    firstLower.includes('nazw') || firstLower.includes('name') || firstLower.includes('imię');

  return lines
    .slice(hasHeader ? 1 : 0)
    .map((line) => {
      const parts = line.split(delimiter).map((part) => part.trim().replace(/^"|"$/g, ''));
      return normalizeEmployeeRow({
        name: parts[0],
        role: parts[1] ?? '',
        phone: parts[2] ?? '',
      });
    })
    .filter((row): row is ImportEmployeeRow => row !== null);
}

export function parseEmployeeJson(text: string): ImportEmployeeRow[] {
  const parsed: unknown = JSON.parse(text);
  const list = Array.isArray(parsed)
    ? parsed
    : (parsed as { data?: { employees?: unknown[] } })?.data?.employees;

  if (!Array.isArray(list)) {
    throw new Error('Nieprawidłowy format JSON — oczekiwano tablicy pracowników lub backupu.');
  }

  return list
    .map((item) => normalizeEmployeeRow(item as Record<string, unknown>))
    .filter((row): row is ImportEmployeeRow => row !== null);
}

export function parseEmployeeImportFile(text: string, fileName: string): ImportEmployeeRow[] {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.json')) return parseEmployeeJson(text);
  return parseEmployeeCsv(text);
}
