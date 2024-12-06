import React, { useState } from 'react';

interface TableRowProps {
  rowValues: {
    content: React.ReactNode;
    className?: string; // Optional class for customization
  }[];
//   actions?: React.ReactNode; // Optional actions to display
}

const TableRow = ({ rowValues }: TableRowProps) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <tr className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'>
      {rowValues.map((value, index) => (
        <td key={index} className={`px-6 py-4 ${value.className || ''}`}>
          {value.content}
        </td>
      ))}
      {/* {actions && <td className='px-6 py-4'>{actions}</td>} */}
    </tr>
  );
};

export default TableRow;
