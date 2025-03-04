import React from 'react';

interface TableFiltersProps {
  children: React.ReactNode;
}

const TableFilters: React.FC<TableFiltersProps> = ({ children }) => {
  return (
    <div className='flex justify-center py-4 px-6 bg-nezeza_light_blue rounded-lg items-center gap-4 mb-4'>
      {children}
      {/* <SlidersHorizontal /> */}
    </div>
  );
};

export default TableFilters;
