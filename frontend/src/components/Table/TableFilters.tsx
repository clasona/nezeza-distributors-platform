import React from 'react';

interface TableFiltersProps {
  children: React.ReactNode;
}

const TableFilters: React.FC<TableFiltersProps> = ({ children }) => {
  return (
    <div className='flex justify-center py-2 px-4 sm:px-6 bg-vesoko_background rounded-lg items-center gap-2 sm:gap-4 mb-4'>
      {children}
      {/* <SlidersHorizontal /> */}
    </div>
  );
};

export default TableFilters;
