import { Trash2 } from 'lucide-react';
import React from 'react';

interface TableFiltersProps {
  children: React.ReactNode;
}

const TableFilters: React.FC<TableFiltersProps> = ({ children }) => {
  return (
    <div className='flex  justify-center py-4 px-12 bg-nezeza_light_blue rounded-lg items-center gap-4 mb-4'>
      {children}
      <button className='flex items-center text-sm space-x-2 bg-nezeza_red_600 text-white rounded-lg px-6 py-2 hover:bg-nezeza_red_700'>
        <Trash2 />
        <span> Bulk Delete </span>
      </button>
    </div>
  );
};

export default TableFilters;
