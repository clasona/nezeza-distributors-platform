import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface TableCellData {
  content: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  colSpan?: number;
  isStatus?: boolean;
  statusVariant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

interface TableBodyRowProps {
  rowData: any;
  cells: TableCellData[];
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  hasSelectCheckbox?: boolean;
  isExpandable?: boolean;
  expandedContent?: React.ReactNode;
  className?: string;
  onClick?: (rowData: any) => void;
  stripe?: boolean;
  hover?: boolean;
}

const TableBodyRow: React.FC<TableBodyRowProps> = ({
  rowData,
  cells,
  isSelected = false,
  onSelect,
  hasSelectCheckbox = false,
  isExpandable = false,
  expandedContent,
  className = '',
  onClick,
  stripe = true,
  hover = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusClasses = (variant?: string) => {
    switch (variant) {
      case 'success':
        return 'bg-vesoko_green_100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
        return 'bg-vesoko_background text-vesoko_secondary border-blue-200';
      case 'neutral':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlignmentClass = (align?: string) => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't trigger row click if clicking on interactive elements
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('input') ||
      (e.target as HTMLElement).closest('a') ||
      (e.target as HTMLElement).closest('[data-interactive]')
    ) {
      return;
    }

    if (onClick) {
      onClick(rowData);
    } else if (isExpandable) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect && rowData._id) {
      onSelect(rowData._id);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelect && rowData._id) {
      onSelect(rowData._id);
    }
  };

  return (
    <>
      <tr 
        className={`
          border-b border-gray-200 transition-colors duration-150
          ${stripe ? 'odd:bg-white even:bg-gray-50' : 'bg-white'}
          ${hover ? 'hover:bg-blue-50' : ''}
          ${isSelected ? 'bg-blue-100 border-blue-300' : ''}
          ${onClick || isExpandable ? 'cursor-pointer' : ''}
          ${className}
        `}
        onClick={handleRowClick}
      >
        {/* Select Checkbox */}
        {hasSelectCheckbox && (
          <td className="px-6 py-4 w-12">
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleSelectChange}
                onClick={handleSelectClick}
                className="
                  w-4 h-4 text-vesoko_primary bg-gray-100 border-gray-300 rounded 
                  focus:ring-vesoko_primary focus:ring-2 cursor-pointer
                  transition-colors duration-150
                "
              />
            </div>
          </td>
        )}

        {/* Expand/Collapse Button */}
        {isExpandable && (
          <td className="px-6 py-4 w-12">
            <button
              onClick={handleExpandClick}
              className="
                p-1 rounded-md hover:bg-gray-200 transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-vesoko_primary focus:ring-offset-1
              "
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </td>
        )}

        {/* Data Cells */}
        {cells.map((cell, index) => (
          <td
            key={index}
            className={`
              px-6 py-4 text-sm
              ${getAlignmentClass(cell.align)}
              ${cell.className || ''}
            `}
            colSpan={cell.colSpan}
          >
            {cell.isStatus ? (
              <span className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                ${getStatusClasses(cell.statusVariant)}
              `}>
                {cell.content}
              </span>
            ) : (
              <div className="flex items-center">
                {cell.content}
              </div>
            )}
          </td>
        ))}
      </tr>

      {/* Expanded Content Row */}
      {isExpandable && isExpanded && expandedContent && (
        <tr className="bg-gray-50 border-b border-gray-200">
          <td 
            colSpan={cells.length + (hasSelectCheckbox ? 1 : 0) + 1}
            className="px-6 py-4"
          >
            <div className="space-y-4">
              {expandedContent}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default TableBodyRow;
