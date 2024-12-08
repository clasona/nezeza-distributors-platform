import { Download } from 'lucide-react';
import React from 'react'

const CustomExport = () => {
  return (
    <button className='relative inline-flex items-center py-2 px-4 space-x-3 text-base border border-green-500 font-medium text-gray-900 rounded-lg group bg-slate-300 hover:text-white hover:bg-green-500 dark:text-white focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800'>
      <Download />
      <span>Export</span>
    </button>
  );
}

export default CustomExport