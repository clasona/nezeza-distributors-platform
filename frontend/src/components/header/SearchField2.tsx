import { Search } from 'lucide-react';
import React, { ChangeEvent } from 'react';

interface SearchField2Props {
  searchFieldPlaceholder: string;
  onSearchChange?: (query: string) => void;
  value?: string;
}

const SearchField2 = ({
  searchFieldPlaceholder,
  onSearchChange,
  value,
}: SearchField2Props) => {
  const isDisabled = !onSearchChange || value === undefined;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  return (
    <div className='flex-grow'>
      <label htmlFor='product-search' className='sr-only'>
        Search
      </label>
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 flex items-center ps-3 pointer-events-none'>
          <Search className='w-4 h-4 text-vesoko_gray_600 dark:text-gray-400' />
        </div>
        <input
          type='text'
          id='product-search'
          className={`block w-full py-2 ps-10 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-nezeza_green_600 focus:border-nezeza_green_600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-nezeza_green_600 dark:focus:border-nezeza_green_600 ${
            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          placeholder={`Search for ${searchFieldPlaceholder}`}
          onChange={handleInputChange}
          value={value ?? ''}
          disabled={isDisabled}
        />
      </div>
      {isDisabled && (
        <p className='text-xs text-yellow-600 mt-1'>
          This search works only on the home page.
        </p>
      )}
    </div>
  );
};

export default SearchField2;
