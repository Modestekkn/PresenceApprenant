import React from 'react';
import { clsx } from 'clsx';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

export interface DataColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  accessor?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  mobileLabel?: string; // label affiché en mode mobile stacked
}

interface DataTableProps<T> {
  columns: DataColumn<T>[];
  data: T[];
  sortKey?: string;
  sortDirection?: SortDirection;
  onSortChange?: (key: string, direction: SortDirection) => void;
  emptyMessage?: string;
  zebra?: boolean;
  dense?: boolean;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  sortKey,
  sortDirection,
  onSortChange,
  emptyMessage = 'Aucune donnée',
  zebra = true,
  dense = false,
}: DataTableProps<T>) {
  const handleSort = (col: DataColumn<T>) => {
    if (!col.sortable) return;
    let next: SortDirection = 'asc';
    if (sortKey === col.key && sortDirection === 'asc') next = 'desc';
    else if (sortKey === col.key && sortDirection === 'desc') next = null;
  if (onSortChange) onSortChange(String(col.key), next);
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      <table className={clsx('min-w-full text-sm', dense && 'text-xs')}> 
        <thead className="bg-gray-50 dark:bg-[var(--color-bg-alt)]/60">
          <tr>
            {columns.map(col => {
              const active = sortKey === col.key && sortDirection;
              const icon = !col.sortable ? null : !active ? <ArrowUpDown className="w-3.5 h-3.5" /> : sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
              return (
                <th
                  key={String(col.key)}
                  scope="col"
                  className={clsx(
                    'px-6 py-3 text-left font-semibold tracking-wide text-gray-600 dark:text-gray-300 text-xs uppercase select-none',
                    col.headerClassName,
                    col.sortable && 'cursor-pointer hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                  onClick={() => handleSort(col)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {icon}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                {emptyMessage}
              </td>
            </tr>
          )}
          {data.map((row, idx) => (
            <tr
              key={idx}
              className={clsx(
                'group transition-colors',
                zebra && idx % 2 === 1 && 'bg-gray-50/60 dark:bg-[var(--color-bg-alt)]/40',
                'hover:bg-primary-50/60 dark:hover:bg-primary-600/10'
              )}
            >
              {columns.map(col => (
                <td key={String(col.key)} className={clsx('px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100', col.className)}>
                  <div className="block md:contents md:space-y-0 space-y-1">
                    <span className="md:hidden block text-xs uppercase font-medium text-gray-500 dark:text-gray-400">{col.mobileLabel || col.header}</span>
                    <span className="block">
                      {col.accessor ? col.accessor(row) : String(row[col.key as keyof T] ?? '')}
                    </span>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface DataTableSkeletonProps {
  columns: number;
  rows?: number;
}

export const DataTableSkeleton: React.FC<DataTableSkeletonProps> = ({ columns, rows = 5 }) => {
  return (
    <div className="animate-pulse w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="h-10 bg-gray-100 dark:bg-[var(--color-bg-alt)]" />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className={`grid dt-cols-${columns}`} data-cols={columns}>
            {Array.from({ length: columns }).map((__, c) => (
              <div key={c} className="h-10 px-6 flex items-center">
                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
