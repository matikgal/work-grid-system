export type QuoteMinResult = {
  minLabel: string;
  sourceLabel: string;
};

/** Parses a price cell; empty / non-numeric → null. */
export function parseQuotePrice(raw: string | undefined | null): number | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const num = parseFloat(trimmed.replace(',', '.'));
  return Number.isFinite(num) ? num : null;
}

/**
 * Lowest price in a row + wholesaler name.
 * Tie → sourceLabel "remis".
 */
export function computeQuoteRowMin(
  valuesByColumnId: Record<string, string | undefined>,
  columns: { id: string; name: string }[],
): QuoteMinResult {
  const priced = columns
    .map((col) => {
      const num = parseQuotePrice(valuesByColumnId[col.id]);
      return num == null ? null : { name: col.name, num };
    })
    .filter((x): x is { name: string; num: number } => x != null);

  if (priced.length === 0) {
    return { minLabel: '—', sourceLabel: '—' };
  }

  const minVal = Math.min(...priced.map((p) => p.num));
  const winners = priced.filter((p) => p.num === minVal);
  const minLabel = Number.isInteger(minVal) ? String(minVal) : String(minVal);

  if (winners.length > 1) {
    return { minLabel, sourceLabel: 'remis' };
  }

  return { minLabel, sourceLabel: winners[0].name };
}

/** Uses administrator-provided values when present; otherwise keeps the calculated result. */
export function applyQuoteRowSummaryOverrides(
  calculated: QuoteMinResult,
  overrides: { lowestPrice?: string | null; lowestWholesaler?: string | null },
): QuoteMinResult {
  return {
    minLabel: overrides.lowestPrice?.trim() || calculated.minLabel,
    sourceLabel: overrides.lowestWholesaler?.trim() || calculated.sourceLabel,
  };
}
