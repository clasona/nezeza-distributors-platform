import { Download, Search, Trash2 } from 'lucide-react';
import React from 'react'

const TableActions = () => {
  return (
    <div className='flex  justify-center py-4 px-12 bg-nezeza_light_blue rounded-lg items-center gap-8'>
      <button className='relative inline-flex items-center justify-center py-3 px-4 space-x-3 text-base border border-green-500 font-medium text-gray-900 rounded-lg group bg-slate-300 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800'>
        <Download />
        <span>Export</span>
      </button>
      <div className='flex-grow  '>
        <label htmlFor='table-search' className='sr-only'>
          Search
        </label>
        <div className='relative mt-1'>
          <div className='absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none'>
            <Search className='w-4 h-4 text-gray-500 dark:text-gray-400' />
          </div>
          <input
            type='text'
            id='table-search'
            className='block w-full py-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500'
            placeholder='Search for items'
          />
        </div>
      </div>
      <button className='flex items-center space-x-2 bg-red-600 text-white rounded-lg px-6 py-3'>
        <Trash2 />
        <span> Bulk Delete </span>
      </button>
    </div>
  );
}

export default TableActions;
