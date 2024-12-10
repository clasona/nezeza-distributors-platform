import { Download, Search, Trash2 } from 'lucide-react';
import React from 'react';

const TableActions = () => {
  return (
    <div className='flex  py-4 px-12 bg-nezeza_light_blue rounded-lg items-center gap-4 mb-4'>
      <button className='relative inline-flex items-center  py-2 px-4 space-x-3 text-base border border-nezeza_green_600 font-medium text-gray-900 rounded-lg group bg-slate-300 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-nezeza_green_800'>
        <Download />
        <span>Export</span>
      </button>
      <button className='relative inline-flex items-center py-2 px-4 space-x-3 text-base border border-nezeza_green_600 font-medium text-gray-900 rounded-lg group bg-slate-300 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-nezeza_green_800'>
        <Download />
        <span>Import</span>
      </button>

      <button className='flex items-center space-x-2 bg-red-600 text-white rounded-lg px-6 py-2'>
        <Trash2 />
        <span> Bulk Delete </span>
      </button>
    </div>
  );
};

export default TableActions;
