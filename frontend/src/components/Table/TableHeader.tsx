import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface TableColumn {
  id: string;
  title: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface TableHeaderProps {
  columns: TableColumn[];
  sortColumn?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  hasSelectAll?: boolean;
  selectAllChecked?: boolean;
  onSelectAllChange?: () => void;
  className?: string;
  sticky?: boolean;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  sortColumn,
  sortOrder,
  onSort,
  hasSelectAll = false,
  selectAllChecked = false,
  onSelectAllChange,
  className = '',
  sticky = true
}) => {
  const getSortIcon = (columnId: string) => {
    if (sortColumn !== columnId) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-vesoko_primary" />
      : <ChevronDown className="w-4 h-4 text-vesoko_primary" />;
  };

  const getAlignmentClass = (align?: string) => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <thead className={`
      bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200
      ${sticky ? 'sticky top-0 z-20' : ''}
      ${className}
    `}>
      <tr>
        {/* Select All Checkbox */}
        {hasSelectAll && (
          <th 
            className="px-6 py-4 w-12"
            scope="col"
          >
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={selectAllChecked}
                onChange={onSelectAllChange}
                className="
                  w-4 h-4 text-vesoko_primary bg-gray-100 border-gray-300 rounded 
                  focus:ring-vesoko_primary focus:ring-2 cursor-pointer
                  transition-colors duration-150
                "
              />
            </div>
          </th>
        )}

        {/* Column Headers */}
        {columns.map((column) => (
          <th
            key={column.id}
            className={`
              px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider select-none
              ${column.sortable ? 'cursor-pointer hover:bg-gray-200 transition-colors duration-150' : ''}
              ${getAlignmentClass(column.align)}
              ${column.className || ''}
            `}
            style={{ width: column.width }}
            onClick={column.sortable && onSort ? () => onSort(column.id) : undefined}
            scope="col"
          >
            <div className={`
              flex items-center gap-2
              ${column.align === 'center' ? 'justify-center' : ''}
              ${column.align === 'right' ? 'justify-end' : ''}
            `}>
              <span className="flex-shrink-0">{column.title}</span>
              {column.sortable && (
                <span className="flex-shrink-0">
                  {getSortIcon(column.id)}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
