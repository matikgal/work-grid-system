import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { applyQuoteRowSummaryOverrides, computeQuoteRowMin } from '../../../lib/quoteMinPrice';
import { formatPricePl, normalizeEan } from '../../../lib/offerClipboard';
import type { QuoteColumn, QuoteRow } from '../../../types/quoteSchemas';

interface PrintOfferReportProps {
  offerName: string;
  rows: QuoteRow[];
  columns: QuoteColumn[];
}

export const PrintOfferReport: React.FC<PrintOfferReportProps> = React.memo(
  ({ offerName, rows, columns }) => {
    const [portalNode] = useState(() => {
      const el = document.createElement('div');
      el.className = 'print-offer-portal';
      return el;
    });

    useEffect(() => {
      document.body.appendChild(portalNode);
      return () => {
        document.body.removeChild(portalNode);
      };
    }, [portalNode]);

    const tableRows = useMemo(() => {
      return rows.map((row) => {
        const byCol: Record<string, string> = {};
        for (const cell of row.cells || []) {
          byCol[cell.columnId] = cell.value;
        }
        const summary = applyQuoteRowSummaryOverrides(computeQuoteRowMin(byCol, columns), row);
        return {
          name: row.name,
          ean: normalizeEan(row.ean),
          prices: columns.map((col) => {
            const raw = byCol[col.id]?.trim();
            return raw ? formatPricePl(raw) : '—';
          }),
          minPrice: summary.minLabel === '—' ? '—' : formatPricePl(summary.minLabel),
          wholesaler: summary.sourceLabel === '—' ? '—' : summary.sourceLabel,
          shelfPrice: formatPricePl(row.shelfPrice) || '—',
        };
      });
    }, [rows, columns]);

    const today = new Date().toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const colCount = columns.length;
    const fontSize = colCount > 8 || tableRows.length > 35 ? 8 : colCount > 5 || tableRows.length > 20 ? 9 : 10;

    const thBase: React.CSSProperties = {
      border: '1.5px solid #334155',
      padding: '5px 6px',
      textAlign: 'center',
      fontWeight: 800,
      textTransform: 'uppercase',
      fontSize: `${fontSize}px`,
      letterSpacing: '0.02em',
    };

    const tdBase = (idx: number): React.CSSProperties => ({
      border: '1px solid #94a3b8',
      padding: '4px 6px',
      textAlign: 'center',
      fontWeight: 600,
      color: '#0f172a',
      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
      fontSize: `${fontSize}px`,
    });

    return createPortal(
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `
        @media print {
          @page {
            size: landscape;
            margin: 8mm;
          }

          html, body {
            width: 100%;
            height: 100%;
            margin: 0 !important;
            padding: 0 !important;
          }

          body > *:not(.print-offer-portal) {
            display: none !important;
          }

          .print-offer-portal {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            color: #0f172a;
          }

          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .offer-print-header {
            flex: 0 0 auto;
            padding-bottom: 10px;
            margin-bottom: 10px;
            border-bottom: 3px solid #0f172a;
          }

          .offer-print-table-wrapper {
            flex: 1 1 auto;
          }

          .offer-print-table-wrapper table {
            width: 100%;
            border-collapse: collapse;
          }

          .offer-print-footer {
            flex: 0 0 auto;
            border-top: 1px solid #cbd5e1;
            padding-top: 6px;
            margin-top: 10px;
          }
        }

        @media screen {
          .print-offer-portal {
            display: none;
          }
        }
      `,
          }}
        />

        <div
          className="offer-print-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#64748b',
              }}
            >
              Oferta cenowa
            </p>
            <h1
              style={{
                margin: '4px 0 0',
                fontSize: '28px',
                fontWeight: 900,
                lineHeight: 1.15,
                color: '#0f172a',
                letterSpacing: '-0.02em',
              }}
            >
              {offerName}
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{today}</div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', marginTop: 2 }}>
              {tableRows.length} produktów · {columns.length} hurtowni
            </div>
          </div>
        </div>

        <div className="offer-print-table-wrapper">
          <table>
            <thead>
              <tr>
                <th
                  style={{
                    ...thBase,
                    textAlign: 'left',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    minWidth: '140px',
                  }}
                >
                  Produkt
                </th>
                <th style={{ ...thBase, backgroundColor: '#0f172a', color: 'white', minWidth: '110px' }}>
                  Kod EAN
                </th>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    style={{ ...thBase, backgroundColor: '#f1f5f9', color: '#0f172a' }}
                  >
                    {col.name}
                  </th>
                ))}
                <th style={{ ...thBase, backgroundColor: '#fef3c7', color: '#92400e' }}>Najniższa</th>
                <th style={{ ...thBase, backgroundColor: '#fef3c7', color: '#92400e' }}>Hurtownia</th>
                <th style={{ ...thBase, backgroundColor: '#d1fae5', color: '#065f46' }}>
                  Cena półkowa
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, idx) => (
                <tr key={idx}>
                  <td
                    style={{
                      ...tdBase(idx),
                      textAlign: 'left',
                      fontWeight: 700,
                      maxWidth: '220px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {row.name}
                  </td>
                  <td style={{ ...tdBase(idx), fontFamily: 'ui-monospace, Consolas, monospace' }}>
                    {row.ean || '—'}
                  </td>
                  {row.prices.map((price, colIdx) => (
                    <td
                      key={colIdx}
                      style={{
                        ...tdBase(idx),
                        color: price === '—' ? '#cbd5e1' : '#0f172a',
                        fontWeight: price === '—' ? 400 : 600,
                      }}
                    >
                      {price}
                    </td>
                  ))}
                  <td
                    style={{
                      ...tdBase(idx),
                      backgroundColor: idx % 2 === 0 ? '#fffbeb' : '#fef3c7',
                      fontWeight: 800,
                      color: '#92400e',
                    }}
                  >
                    {row.minPrice}
                  </td>
                  <td
                    style={{
                      ...tdBase(idx),
                      backgroundColor: idx % 2 === 0 ? '#fffbeb' : '#fef3c7',
                      color: '#92400e',
                    }}
                  >
                    {row.wholesaler}
                  </td>
                  <td
                    style={{
                      ...tdBase(idx),
                      backgroundColor: idx % 2 === 0 ? '#ecfdf5' : '#d1fae5',
                      fontWeight: 800,
                      color: '#065f46',
                    }}
                  >
                    {row.shelfPrice}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="offer-print-footer"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '9px',
            color: '#94a3b8',
          }}
        >
          <span>Work Grid System</span>
          <span>Oferta · {offerName}</span>
        </div>
      </>,
      portalNode,
    );
  },
);

PrintOfferReport.displayName = 'PrintOfferReport';
