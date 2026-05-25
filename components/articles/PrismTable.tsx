/**
 * PrismTable — A styled two-column feature/description table for article content.
 *
 * Usage:
 *   import { PrismTable } from '@/components/articles/PrismTable';
 *
 *   <PrismTable
 *     headers={['Feature', 'Description']}
 *     rows={[
 *       ['WMI Persistence', 'Creates a WMI trigger that reinstalls the payload on system events.'],
 *       ['Lock Screen Hiding', <>Embeds within <code>LockAppHost.exe</code> — rarely monitored.</>],
 *     ]}
 *   />
 *
 * Props:
 *   headers  — Optional tuple of [left header, right header]. Defaults to no header row.
 *   rows     — Array of [left cell, right cell] pairs. Cells accept strings or JSX.
 *   caption  — Optional caption rendered below the table.
 *   accent   — Left-column accent color. Defaults to 'purple'.
 */

import React from 'react';

type CellContent = React.ReactNode;

export interface PrismTableProps {
  headers?: [CellContent, CellContent];
  rows: [CellContent, CellContent][];
  caption?: string;
  accent?: 'purple' | 'blue' | 'red' | 'green' | 'orange' | 'cyan' | 'yellow';
}

const accentStyles: Record<
  NonNullable<PrismTableProps['accent']>,
  { border: string; header: string; dot: string; leftText: string }
> = {
  purple: {
    border:   'border-purple-200',
    header:   'bg-purple-600 text-white',
    dot:      'bg-purple-500',
    leftText: 'text-purple-900',
  },
  blue: {
    border:   'border-blue-200',
    header:   'bg-blue-600 text-white',
    dot:      'bg-blue-500',
    leftText: 'text-blue-900',
  },
  red: {
    border:   'border-red-200',
    header:   'bg-red-600 text-white',
    dot:      'bg-red-500',
    leftText: 'text-red-900',
  },
  green: {
    border:   'border-green-200',
    header:   'bg-green-600 text-white',
    dot:      'bg-green-500',
    leftText: 'text-green-900',
  },
  orange: {
    border:   'border-orange-200',
    header:   'bg-orange-500 text-white',
    dot:      'bg-orange-500',
    leftText: 'text-orange-900',
  },
  cyan: {
    border:   'border-cyan-200',
    header:   'bg-cyan-600 text-white',
    dot:      'bg-cyan-500',
    leftText: 'text-cyan-900',
  },
  yellow: {
    border:   'border-yellow-200',
    header:   'bg-yellow-500 text-black',
    dot:      'bg-yellow-500',
    leftText: 'text-yellow-900',
  },
};

export function PrismTable({
  headers,
  rows: rawRows,
  caption,
  accent = 'purple',
}: PrismTableProps) {
  // Guard: if rows isn't an array (e.g. arrived as a raw string from ContentRenderer),
  // fall back to an empty array so we don't crash on .map()
  const rows: [CellContent, CellContent][] = Array.isArray(rawRows) ? rawRows : [];
  const a = accentStyles[accent];

  return (
    <figure className="my-8 not-prose">
      <div className={`overflow-hidden rounded-xl border ${a.border} shadow-sm`}>
        <table className="w-full text-sm border-collapse">

          {/* Optional header row */}
          {headers && (
            <thead>
              <tr>
                <th
                  className={`${a.header} px-5 py-3 text-left text-xs font-black uppercase tracking-widest w-1/3`}
                >
                  {headers[0]}
                </th>
                <th
                  className={`${a.header} px-5 py-3 text-left text-xs font-black uppercase tracking-widest border-l border-white/20`}
                >
                  {headers[1]}
                </th>
              </tr>
            </thead>
          )}

          <tbody>
            {rows.map(([left, right], i) => (
              <tr
                key={i}
                className={`
                  group transition-colors duration-150
                  ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  hover:bg-purple-50
                  ${i !== 0 ? `border-t ${a.border}` : ''}
                `}
              >
                {/* Left cell — label */}
                <td className={`px-5 py-4 align-top w-1/3 ${a.border} border-r`}>
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${a.dot}`}
                      aria-hidden="true"
                    />
                    <span className={`font-bold leading-snug ${a.leftText}`}>
                      {left}
                    </span>
                  </div>
                </td>

                {/* Right cell — description */}
                <td className="px-5 py-4 align-top text-gray-700 leading-relaxed">
                  {right}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {caption && (
        <figcaption className="mt-2 text-xs text-gray-400 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default PrismTable;
