import React from 'react';
import TableHeader, { TableColumn } from './TableHeader';
import TableBodyRow, { TableCellData } from './TableBodyRow';
import { Loader2 } from 'lucide-react';

export interface TableRow {
  id: string;
  data: any;
  cells: TableCellData[];
  expandedContent?: React.ReactNode;
  className?: string;
}

interface ModernTableProps {
  columns: TableColumn[];
  rows: TableRow[];
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  className?: string;
  
  // Selection
  hasSelectAll?: boolean;
  selectedRows?: string[];
  onSelectAll?: () => void;
  onSelectRow?: (id: string) => void;
  
  // Sorting
  sortColumn?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  
  // Styling
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
  stickyHeader?: boolean;
  
  // Interaction
  onRowClick?: (rowData: any) => void;
  
  // Expandable rows
  isExpandable?: boolean;
  
  // Minimum rows for dropdown space
  minRows?: number;
}

const ModernTable: React.FC<ModernTableProps> = ({
  columns,
  rows,
  loading = false,
  loadingMessage = 'Loading...',
  emptyMessage = 'No data available',
  emptyIcon,
  className = '',
  
  // Selection
  hasSelectAll = false,
  selectedRows = [],
  onSelectAll,
  onSelectRow,
  
  // Sorting
  sortColumn,
  sortOrder,
  onSort,
  
  // Styling
  striped = true,
  hover = true,
  compact = false,
  stickyHeader = true,
  
  // Interaction
  onRowClick,
  
  // Expandable
  isExpandable = false,
  
  // Minimum rows
  minRows = 5
}) => {
  const isAllSelected = selectedRows.length > 0 && selectedRows.length === rows.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < rows.length;

  // Create empty placeholder rows to ensure minimum table height for dropdown space
  const createEmptyPlaceholderRow = (index: number): TableRow => {
    const emptyCells: TableCellData[] = columns.map(() => ({
      content: '\u00A0', // Non-breaking space to maintain row height
      className: 'text-transparent'
    }));
    
    return {
      id: `empty-${index}`,
      data: {},
      cells: emptyCells,
      className: 'pointer-events-none' // Prevent interactions with empty rows
    };
  };

  // Calculate rows to display with padding
  const getDisplayRows = () => {
    if (loading || rows.length === 0) {
      return rows;
    }

    const displayRows = [...rows];
    const currentRowCount = displayRows.length;
    
    // Add empty rows if we have fewer than minRows
    if (currentRowCount < minRows) {
      const emptyRowsNeeded = minRows - currentRowCount;
      for (let i = 0; i < emptyRowsNeeded; i++) {
        displayRows.push(createEmptyPlaceholderRow(i));
      }
    }
    
    return displayRows;
  };

  const displayRows = getDisplayRows();

  const LoadingRow = () => (
    <tr>
      <td 
        colSpan={columns.length + (hasSelectAll ? 1 : 0) + (isExpandable ? 1 : 0)}
        className="px-6 py-12 text-center"
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-vesoko_primary" />
          <p className="text-gray-500 text-sm font-medium">{loadingMessage}</p>
        </div>
      </td>
    </tr>
  );

  const EmptyRow = () => (
    <tr>
      <td 
        colSpan={columns.length + (hasSelectAll ? 1 : 0) + (isExpandable ? 1 : 0)}
        className="px-6 py-12 text-center"
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          {emptyIcon && (
            <div className="text-gray-400">
              {emptyIcon}
            </div>
          )}
          <div className="space-y-1">
            <p className="text-gray-500 text-base font-medium">{emptyMessage}</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <TableHeader
            columns={columns}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={onSort}
            hasSelectAll={hasSelectAll}
            selectAllChecked={isAllSelected}
            onSelectAllChange={onSelectAll}
            isExpandable={isExpandable}
            sticky={stickyHeader}
          />
          
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <LoadingRow />
            ) : rows.length === 0 ? (
              <EmptyRow />
            ) : (
              displayRows.map((row, index) => {
                const isEmptyRow = row.id.startsWith('empty-');
                return (
                  <TableBodyRow
                    key={row.id}
                    rowData={row.data}
                    rowId={row.id}
                    cells={row.cells}
                    isSelected={!isEmptyRow && selectedRows.includes(row.id)}
                    onSelect={!isEmptyRow ? onSelectRow : undefined}
                    hasSelectCheckbox={hasSelectAll}
                    isExpandable={!isEmptyRow && (isExpandable || !!row.expandedContent)}
                    expandedContent={!isEmptyRow ? row.expandedContent : undefined}
                    onClick={!isEmptyRow ? onRowClick : undefined}
                    stripe={striped}
                    hover={!isEmptyRow && hover}
                    className={`${compact ? 'py-2' : ''} ${row.className || ''} ${isEmptyRow ? 'select-none' : ''}`}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModernTable;
