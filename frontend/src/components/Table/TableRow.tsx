import React, { useState } from 'react';
import FormattedStatus from './FormattedStatus';
import FormattedStock from './FormattedStock';
import { InventoryProps, OrderProps } from '../../../type';
// import UpdateRow from './UpdateRow';
// import RemoveRow from './RemoveRow';

interface TableRowProps<T> {
  rowValues: {
    content: React.ReactNode;
    className?: string; // Optional class for customization
    isStatus?: boolean;
    isStock?: boolean;
  }[];
  rowData: T; // Represents the full row data for editing
  onUpdate: (updatedRow: T) => void; // TODO: make this generic T type
  onRemove: (id: number) => void; // Callback when a row is removed
  //   actions?: React.ReactNode; // Optional actions to display
}

const TableRow =<T,> ({
  rowValues,
  rowData,
  onUpdate,
  onRemove,
}: TableRowProps<T>) => {
  const [isChecked, setIsChecked] = useState(false);
 
  return (
      <tr className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'>
        {/* {rowValues.map((value, index) => (
        <td key={index} className={`px-6 py-4 ${value.className || ''}`}>
          {value.content}
        </td>
      ))} */}
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
      </tr>
  );
};

export default TableRow;
