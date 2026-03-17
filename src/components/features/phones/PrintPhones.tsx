import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Employee } from '../../../types';
import { displayName, formatPhone } from '../../../utils';

interface PrintPhonesProps {
  employees: Employee[];
}

export const PrintPhones: React.FC<PrintPhonesProps> = ({ employees }) => {
  const [portalNode] = useState(() => {
    const el = document.createElement('div');
    el.className = 'print-phones-portal';
    return el;
  });

  useEffect(() => {
    document.body.appendChild(portalNode);
    return () => {
      document.body.removeChild(portalNode);
    };
  }, [portalNode]);

  const half = Math.ceil(employees.length / 2);
  const leftColumn = employees.slice(0, half);
  const rightColumn = employees.slice(half);

  const today = new Date().toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Dynamic font sizing based on employee count
  const itemsPerCol = Math.max(half, 1);
  const rowPad = itemsPerCol > 45 ? '1px 0' : itemsPerCol > 35 ? '2px 0' : '4px 0';
  const nameSize = itemsPerCol > 45 ? '12px' : itemsPerCol > 35 ? '13px' : '15px';
  const phoneSize = itemsPerCol > 45 ? '13px' : itemsPerCol > 35 ? '14px' : '17px';
  const numSize = itemsPerCol > 45 ? '11px' : itemsPerCol > 35 ? '12px' : '13px';

  return createPortal(
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: portrait;
            margin: 8mm;
          }

          html, body {
            width: 100%;
            height: 100%;
            margin: 0 !important;
            padding: 0 !important;
          }

          body > *:not(.print-phones-portal) {
            display: none !important;
          }

          .print-phones-portal {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            color: black !important;
          }

          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .phones-print-header {
            flex: 0 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding-bottom: 6px;
            margin-bottom: 12px;
            border-bottom: 2px solid #1e293b;
          }

          .phones-print-title {
            font-size: 20px;
            font-weight: 900;
            text-transform: uppercase;
            margin: 0;
            letter-spacing: 0.5px;
            color: black;
          }

          .phones-print-subtitle {
            font-size: 11px;
            font-weight: 600;
            color: #64748b;
          }

          .phones-print-body {
            flex: 1 1 auto;
            display: flex;
            gap: 24px;
            min-height: 0;
            overflow: hidden;
          }

          .phones-print-column {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .phones-print-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #f1f5f9;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .phones-print-row-content {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
            min-width: 0;
          }

          .phones-print-idx {
            font-family: monospace;
            font-weight: 700;
            color: #64748b;
            text-align: right;
            width: 24px;
            flex-shrink: 0;
          }

          .phones-print-name {
            font-weight: 700;
            color: #0f172a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .phones-print-phone {
            font-family: monospace;
            font-weight: 900;
            letter-spacing: 1px;
            color: #0f172a;
            white-space: nowrap;
          }

          .phones-print-phone-empty {
            font-family: monospace;
            font-weight: 900;
            letter-spacing: 1px;
            color: #cbd5e1;
            white-space: nowrap;
          }

          .phones-print-footer {
            flex: 0 0 auto;
            border-top: 1px solid #cbd5e1;
            padding-top: 4px;
            margin-top: 8px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #94a3b8;
          }
        }

        @media screen {
          .print-phones-portal {
            display: none !important;
          }
        }
      `}} />

      {/* Header */}
      <div className="phones-print-header">
        <div>
          <h1 className="phones-print-title">Książka Telefoniczna</h1>
        </div>
        <span className="phones-print-subtitle">Wygenerowano: {today}</span>
      </div>

      {/* Body */}
      <div className="phones-print-body">
        {/* Left Column */}
        <div className="phones-print-column" style={{ borderRight: '1.5px dashed #cbd5e1', paddingRight: '12px' }}>
          {leftColumn.map((emp, idx) => (
            <div key={emp.id} className="phones-print-row" style={{ padding: rowPad }}>
              <div className="phones-print-row-content">
                <span className="phones-print-idx" style={{ fontSize: numSize }}>{idx + 1}.</span>
                <span className="phones-print-name" style={{ fontSize: nameSize }}>{displayName(emp.name)}</span>
              </div>
              <span className={emp.phone ? 'phones-print-phone' : 'phones-print-phone-empty'} style={{ fontSize: phoneSize }}>
                {formatPhone(emp.phone) || '--- --- ---'}
              </span>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="phones-print-column" style={{ paddingLeft: '12px' }}>
          {rightColumn.map((emp, idx) => (
            <div key={emp.id} className="phones-print-row" style={{ padding: rowPad }}>
              <div className="phones-print-row-content">
                <span className="phones-print-idx" style={{ fontSize: numSize }}>{half + idx + 1}.</span>
                <span className="phones-print-name" style={{ fontSize: nameSize }}>{displayName(emp.name)}</span>
              </div>
              <span className={emp.phone ? 'phones-print-phone' : 'phones-print-phone-empty'} style={{ fontSize: phoneSize }}>
                {formatPhone(emp.phone) || '--- --- ---'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="phones-print-footer">
        <span>Work Grid System</span>
        <span>Strona 1 / 1</span>
      </div>
    </>,
    portalNode,
  );
};
