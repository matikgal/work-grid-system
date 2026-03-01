import React, { useMemo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Item, ShopResponse } from '../../../types/schemas';

interface PrintOrderReportProps {
  orderName: string;
  items: Item[];
  shops: number[];
}

export const PrintOrderReport: React.FC<PrintOrderReportProps> = React.memo(({ orderName, items, shops }) => {
  const [portalNode] = useState(() => {
    const el = document.createElement('div');
    el.className = 'print-order-portal';
    return el;
  });

  useEffect(() => {
    document.body.appendChild(portalNode);
    return () => {
      document.body.removeChild(portalNode);
    };
  }, [portalNode]);

  const tableData = useMemo(() => {
    return items.filter(item => item.name && item.name.trim() !== '' && item.name.trim() !== 'Nowy Produkt').map(item => {
      let rowSum = 0;
      const shopValues = shops.map(n => {
        const resp = item.responses?.find((r: ShopResponse) => r.shopId === n.toString());
        const raw = resp?.value || '';
        const num = parseFloat(raw.replace(',', '.') || '0');
        if (!isNaN(num)) rowSum += num;
        return raw;
      });
      return { name: item.name, shopValues, sum: rowSum };
    });
  }, [items, shops]);

  const grandTotals = useMemo(() => {
    return shops.map((_, colIdx) => {
      return tableData.reduce((acc, row) => {
        const num = parseFloat(row.shopValues[colIdx]?.replace(',', '.') || '0');
        return acc + (isNaN(num) ? 0 : num);
      }, 0);
    });
  }, [tableData, shops]);

  const grandTotal = grandTotals.reduce((a, b) => a + b, 0);

  const today = new Date().toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Dynamic font sizing based on item count
  const itemCount = items.length;
  const fontSize = itemCount > 30 ? 8 : itemCount > 20 ? 9 : 10;

  return createPortal(
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: landscape;
            margin: 6mm;
          }

          html, body {
            width: 100%;
            height: 100%;
            margin: 0 !important;
            padding: 0 !important;
          }

          body > *:not(.print-order-portal) {
            display: none !important;
          }

          .print-order-portal {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          }

          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .order-print-header {
            flex: 0 0 auto;
            padding-bottom: 6px;
            margin-bottom: 6px;
            border-bottom: 2px solid #1e293b;
          }

          .order-print-table-wrapper {
            flex: 1 1 auto;
            position: relative;
          }

          .order-print-table-wrapper table {
            width: 100%;
            border-collapse: collapse;
          }

          .order-print-footer {
            flex: 0 0 auto;
            border-top: 1px solid #cbd5e1;
            padding-top: 4px;
            margin-top: 6px;
          }
        }

        @media screen {
          .print-order-portal {
            display: none;
          }
        }
      `}} />

      {/* Header */}
      <div className="order-print-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px', color: 'black' }}>
            Zamówienie
          </h1>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#334155', margin: '2px 0 0' }}>
            {orderName}
          </p>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
          Wygenerowano: {today}
        </span>
      </div>

      {/* Table */}
      <div className="order-print-table-wrapper">
        <table style={{ fontSize: `${fontSize}px` }}>
          <thead>
            <tr>
              <th style={{
                border: '1.5px solid #334155',
                padding: '4px 6px',
                textAlign: 'left',
                fontWeight: 800,
                textTransform: 'uppercase',
                backgroundColor: '#1e293b',
                color: 'white',
                fontSize: `${fontSize + 1}px`,
                minWidth: '160px',
              }}>
                Nazwa Produktu
              </th>
              {shops.map(n => (
                <th key={n} style={{
                  border: '1.5px solid #334155',
                  padding: '3px 2px',
                  textAlign: 'center',
                  fontWeight: 700,
                  backgroundColor: '#f1f5f9',
                  color: '#1e293b',
                  fontSize: `${fontSize}px`,
                }}>
                  S.{n}
                </th>
              ))}
              <th style={{
                border: '1.5px solid #334155',
                padding: '3px 4px',
                textAlign: 'center',
                fontWeight: 800,
                backgroundColor: '#1e293b',
                color: 'white',
                fontSize: `${fontSize + 1}px`,
                minWidth: '48px',
              }}>
                Suma
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx}>
                <td style={{
                  border: '1px solid #94a3b8',
                  padding: '3px 6px',
                  fontWeight: 700,
                  color: '#1e293b',
                  backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '220px',
                }}>
                  {row.name}
                </td>
                {row.shopValues.map((val, colIdx) => (
                  <td key={colIdx} style={{
                    border: '1px solid #cbd5e1',
                    padding: '3px 2px',
                    textAlign: 'center',
                    fontWeight: val ? 600 : 400,
                    color: val ? '#0f172a' : '#cbd5e1',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                  }}>
                    {val || '-'}
                  </td>
                ))}
                <td style={{
                  border: '1px solid #64748b',
                  padding: '3px 4px',
                  textAlign: 'center',
                  fontWeight: 800,
                  color: '#0f172a',
                  backgroundColor: '#e2e8f0',
                }}>
                  {row.sum > 0 ? row.sum : '-'}
                </td>
              </tr>
            ))}

            {/* Grand Totals Row */}
            <tr>
              <td style={{
                border: '1.5px solid #334155',
                padding: '4px 6px',
                fontWeight: 900,
                textTransform: 'uppercase',
                backgroundColor: '#1e293b',
                color: 'white',
                fontSize: `${fontSize + 1}px`,
              }}>
                Razem
              </td>
              {grandTotals.map((total, colIdx) => (
                <td key={colIdx} style={{
                  border: '1.5px solid #334155',
                  padding: '3px 2px',
                  textAlign: 'center',
                  fontWeight: 800,
                  color: total > 0 ? '#1e293b' : '#94a3b8',
                  backgroundColor: '#f1f5f9',
                  fontSize: `${fontSize}px`,
                }}>
                  {total > 0 ? total : '-'}
                </td>
              ))}
              <td style={{
                border: '1.5px solid #334155',
                padding: '3px 4px',
                textAlign: 'center',
                fontWeight: 900,
                color: '#1e293b',
                backgroundColor: '#e2e8f0',
                fontSize: `${fontSize + 2}px`,
              }}>
                {grandTotal > 0 ? grandTotal : '-'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="order-print-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px', color: '#94a3b8' }}>
        <span>Work Grid System</span>
        <span>S.1-S.{shops.length} = Sklep 1 - Sklep {shops.length}</span>
      </div>
    </>,
    portalNode,
  );
});

PrintOrderReport.displayName = 'PrintOrderReport';
