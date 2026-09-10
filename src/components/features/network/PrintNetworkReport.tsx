import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Store } from '../../../services/storeService';
import { toStoreClipboardRows } from '../../../lib/storeClipboard';

interface PrintNetworkReportProps {
  stores: Store[];
}

export const PrintNetworkReport: React.FC<PrintNetworkReportProps> = React.memo(({ stores }) => {
  const [portalNode] = useState(() => {
    const el = document.createElement('div');
    el.className = 'print-network-portal';
    return el;
  });

  useEffect(() => {
    document.body.appendChild(portalNode);
    return () => {
      document.body.removeChild(portalNode);
    };
  }, [portalNode]);

  const rows = toStoreClipboardRows(stores);
  const today = new Date().toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const thBase: React.CSSProperties = {
    border: '1px solid #000',
    padding: '5px 7px',
    textAlign: 'left',
    fontWeight: 700,
    textTransform: 'uppercase',
    fontSize: '10px',
    backgroundColor: '#fff',
    color: '#000',
  };

  const tdBase: React.CSSProperties = {
    border: '1px solid #000',
    padding: '4px 7px',
    fontSize: '11px',
    color: '#000',
    backgroundColor: '#fff',
  };

  return createPortal(
    <div className="print-network-sheet">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page { size: landscape; margin: 8mm; }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }
          body * { visibility: hidden !important; }
          .print-network-portal,
          .print-network-portal * {
            visibility: visible !important;
          }
          .print-network-portal {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            color: #000 !important;
            font-family: Arial, Helvetica, sans-serif;
            box-shadow: none !important;
          }
          .print-network-sheet,
          .print-network-sheet * {
            background: #fff !important;
            box-shadow: none !important;
            text-shadow: none !important;
            -webkit-print-color-adjust: economy !important;
            print-color-adjust: economy !important;
          }
          #root, .dash-modern, .dash-bg, [class*="aurora"], [class*="blur"] {
            display: none !important;
          }
        }
        @media screen {
          .print-network-portal { display: none; }
        }
      `,
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderBottom: '1px solid #000',
          paddingBottom: 8,
          marginBottom: 10,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#000',
            }}
          >
            Nabywca / Płatnik
          </p>
          <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: '#000' }}>
            Paulinka sp. z o.o. sieć sklepów
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: '#000' }}>
            43-340 Kozy ul. Dworcowa 11, NIP 9372548236, KRS 0000963992
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#000' }}>
          {today}
          <div style={{ fontSize: 10, fontWeight: 600, marginTop: 2 }}>{rows.length} sklepów</div>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thBase}>Sklep</th>
            <th style={thBase}>Adres</th>
            <th style={thBase}>Telefon</th>
            <th style={thBase}>E-mail</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td style={{ ...tdBase, fontWeight: 700, whiteSpace: 'nowrap' }}>{row.name}</td>
              <td style={tdBase}>{row.address || '-'}</td>
              <td style={{ ...tdBase, whiteSpace: 'nowrap' }}>{row.phone || '-'}</td>
              <td style={{ ...tdBase, whiteSpace: 'nowrap' }}>{row.email || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          marginTop: 10,
          paddingTop: 6,
          borderTop: '1px solid #000',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 9,
          color: '#000',
        }}
      >
        <span>Work Grid System</span>
        <span>Sieć sklepów Paulinka</span>
      </div>
    </div>,
    portalNode,
  );
});

PrintNetworkReport.displayName = 'PrintNetworkReport';
