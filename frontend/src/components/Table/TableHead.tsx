import React from 'react';

interface TableHeadProps {
  columns: {
    title: string;
    srOnly?: boolean;
  }[];
}

const TableHead = ({ columns }: TableHeadProps) => {
  return (
    <thead className='text-xs text-white uppercase bg-nezeza_dark_blue dark:bg-gray-700 dark:text-gray-400'>
      <tr>
        {columns.map((column) => (
          <th
            key={column.title}
            scope='col'
            className={`px-6 py-3 ${column.srOnly ? 'sr-only' : ''}`}
          >
            {column.title}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHead;
