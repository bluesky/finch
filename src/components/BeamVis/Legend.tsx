// Legend.tsx
import React from 'react';
import { statusColor } from './Synoptic_Config';

export const Legend: React.FC = () => {
  const items: [keyof typeof statusColor, string][] = [
    ['ok',      'Component Status OK'],
    ['moving',  'Component actively moving'],
    ['finished',    'Component finished moving'],
    ['limit',   'Hardware/software limit reached'],
    ['disconnected', 'Component disconnected'],
  ];

  return (
    <div className="synoptic-legend">
      <strong>Key</strong>
      {items.map(([key, label]) => (
        <div key={key} className="legend-item">
          <span
            className="legend-dot"
            style={{ background: statusColor[key] }}
          />
          {label}
        </div>
      ))}
    </div>
  );
};
