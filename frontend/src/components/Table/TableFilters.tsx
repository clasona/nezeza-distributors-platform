import { SlidersHorizontal, Trash2 } from 'lucide-react';
import React from 'react';

interface TableFiltersProps {
  children: React.ReactNode;
}

const TableFilters: React.FC<TableFiltersProps> = ({ children }) => {
  return (
    <div className='flex justify-center py-4 px-6 bg-nezeza_light_blue rounded-lg items-center gap-4 mb-4'>
      <button className='flex items-center text-sm space-x-1 bg-nezeza_red_600 text-white rounded-lg px-4 py-2 hover:bg-nezeza_red_700'>
        <Trash2 />
        <span> Bulk Delete </span>
      </button>
      {children}
      {/* <SlidersHorizontal /> */}
    </div>
  );
};

export default TableFilters;
