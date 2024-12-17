import { Search } from 'lucide-react';
import React, { ChangeEvent } from 'react';

interface SearchFieldProps {
  searchFieldPlaceholder: string;
  onSearchChange: (query: string) => void; // New prop for handling search input changes
}
const SearchField = ({
  searchFieldPlaceholder,
  onSearchChange,
}: SearchFieldProps) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value); // Pass the query back to the parent
  };

  return (
    <div className='flex-grow '>
      <label htmlFor='table-search' className='sr-only'>
        Search
      </label>
      <div className='relative'>
        <div className='absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none'>
          <Search className='w-4 h-4 text-nezeza_gray_600 dark:text-gray-400' />
        </div>
        <input
          type='text'
          id='table-search'
          className='block w-full py-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-nezeza_green_600 focus:border-nezeza_green_600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-nezeza_green_600 dark:focus:border-nezeza_green_600'
          placeholder={`Search for ${searchFieldPlaceholder}`}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default SearchField;
