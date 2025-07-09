import React, { useState } from 'react';
import FormattedStatus from './FormattedStatus';
import FormattedStock from './FormattedStock';

interface TableRowProps<T> {
  hasCollapsibleContent?: boolean;
  rowValues: {
    content: React.ReactNode;
    className?: string; // Optional class for customization
    isStatus?: boolean;
    isStock?: boolean;
  }[];
  rowData: T; // Represents the full row data for editing
  onUpdate?: (updatedRow: T) => void; // TODO: make this generic T type
  onDelete: (id: string) => void; // Callback when a row is Deleted
  //   actions?: React.ReactNode; // Optional actions to display
  renderCollapsibleContent?: (rowData: T) => React.ReactNode; // Function to render collapsible content
}

const TableRow = <T,>({
  hasCollapsibleContent = false,
  rowValues,
  rowData,
  onUpdate,
  onDelete,
  renderCollapsibleContent,
}: TableRowProps<T>) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'>
        {rowValues.map((value, index) => (
          <td key={index} className={`px-6 py-4 ${value.className || ''}`}>
            {value.isStatus && typeof value.content === 'string' ? (
              <FormattedStatus status={value.content} />
            ) : value.isStock && typeof value.content === 'number' ? (
              <FormattedStock quantity={value.content} />
            ) : (
              value.content
            )}
          </td>
        ))}

        {/* Controlling collapsible for orders items  */}
        {hasCollapsibleContent && (
          <td className='px-6 py-4 text-right'>
            <button onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? '▲' : '▼'}
            </button>
          </td>
        )}
      </tr>
      {isExpanded && (
        <tr className='bg-gray-200 dark:bg-gray-700'>
          <td
            colSpan={rowValues.length + 1}
            className='p-4 border-l-4 border-vesoko_dark_blue'
          >
            {renderCollapsibleContent
              ? renderCollapsibleContent(rowData)
              : null}
          </td>
        </tr>
      )}
    </>
  );
};

export default TableRow;
