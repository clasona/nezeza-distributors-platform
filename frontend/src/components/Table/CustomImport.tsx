import { Download, Import } from 'lucide-react';
import React from 'react';

const CustomImport = () => {
  return (
    <button className='relative inline-flex items-center py-2 px-4 space-x-3 text-base border border-nezeza_green_600 font-medium text-gray-900 rounded-lg group bg-slate-300 hover:text-white hover:bg-nezeza_green_600 dark:text-white focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-nezeza_green_800'>
      <Import />
      <span>Import</span>
    </button>
  );
};

export default CustomImport;
