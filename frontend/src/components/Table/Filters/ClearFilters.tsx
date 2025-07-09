import { XCircle } from 'lucide-react';
import React from 'react';

interface ClearFiltersProps {
  clearFiltersFunction: () => void;
}
const ClearFilters = ({ clearFiltersFunction }: ClearFiltersProps) => {
  return (
    <button
      onClick={clearFiltersFunction}
      className='p-1 text-red-500 hover:text-vesoko_red_600 focus:outline-none focus:ring focus:ring-red-300 rounded-md'
      title='Clear Filters'
    >
      <XCircle className='w-5 h-5' aria-hidden='true' />
    </button>
  );
};

export default ClearFilters;
