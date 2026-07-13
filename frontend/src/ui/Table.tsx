import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface Column {
  header: string;
  accessor: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  isLoading?: boolean;
}

export const Table = ({ columns, data, onRowClick, isLoading }: TableProps) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredData = sortedData.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(filterQuery.toLowerCase())
    )
  );

  return (
    <div className="w-full bg-surface border border-border rounded overflow-hidden">
      <div className="p-2 border-b border-border flex flex-col gap-2 bg-background/50">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="Search records..."
            className="w-full pl-8 pr-2 py-1 h-7 bg-surface border border-border rounded-sm text-[12px] focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-colors placeholder:text-text-subtle"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-background border-b border-border">
              {columns.map((col, idx) => (
                <th 
                   key={idx}
                   className={`px-3 py-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider 
                    ${col.sortable ? 'cursor-pointer hover:bg-border-light select-none transition-colors' : ''}`}
                   onClick={() => {
                    if (col.sortable) {
                      setSortConfig({
                        key: col.accessor,
                        direction: sortConfig?.key === col.accessor && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                      });
                    }
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      <div className="flex flex-col text-text-subtle">
                        <ChevronUp className={`w-2.5 h-2.5 ${sortConfig?.key === col.accessor && sortConfig.direction === 'asc' ? 'text-primary' : ''}`} />
                        <ChevronDown className={`w-2.5 h-2.5 -mt-1 ${sortConfig?.key === col.accessor && sortConfig.direction === 'desc' ? 'text-primary' : ''}`} />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={columns.length} className="p-8 text-center text-text-muted text-[12px]">Loading data...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={columns.length} className="p-8 text-center text-text-muted text-[12px]">No matching records found.</td></tr>
            ) : filteredData.map((row, rowIdx) => (
              <tr 
                key={rowIdx} 
                className={`group transition-colors bg-surface hover:bg-background ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col, colIdx) => (
                   <td key={colIdx} className="px-3 py-2 text-[12px] text-text">
                    {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
