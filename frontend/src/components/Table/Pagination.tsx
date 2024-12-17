import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

interface PaginationProps {
  data: any[];
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ data, pageSize, onPageChange }: PaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    onPageChange(page);
  };
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const itemStartIndex = startIndex + 1;
  const itemEndIndex = Math.min(startIndex + pageSize, data.length);

  return (
    <nav
      className='flex items-center flex-column flex-wrap md:flex-row justify-between py-1 px-4'
      aria-label='Table navigation'
    >
      <span className='text-sm font-normal text-nezeza_gray_600 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto'>
        Showing {''}
        <span className='font-semibold text-gray-700 dark:text-white'>
          {itemStartIndex}-{itemEndIndex}
        </span>{' '}
        {''}
        of {''}
        <span className='font-semibold text-gray-700 dark:text-white'>
          {data.length}
        </span>
      </span>
      <ul className='inline-flex -space-x-px rtl:space-x-reverse test-sm '>
        <li>
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className='flex items-center justify-center px-3 h-8 leading-tight text-nezeza_gray_600 bg-white 
                  border borger-gray-300 rounded-s-lg hover:bg-gray-100 hover:ext-gray-700 dark:bg-gray-800
                  dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
          >
            <ChevronLeft />
          </button>
        </li>
        {Array.from({ length: totalPages }, (_, index) => {
          return (
            <li key={index}>
              <button
                onClick={() => handlePageClick(index + 1)}
                className={`flex items-center justify-center px-3 h-8 leading-tight    
  border 
     
  ${
    currentPage === index + 1
      ? 'text-gray-50 bg-nezeza_dark_blue border-blue-300 dark:bg-nezeza_dark_blue dark:border-gray-700  dark:text-gray-50 dark:hover:bg-blue-900 dark:hover:text-white hover:bg-blue-900 hover:text-white'
      : 'text-nezeza_gray_600 bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700  dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white hover:bg-gray-100 hover:text-gray-700'
  }`}
              >
                {index + 1}
              </button>
            </li>
          );
        })}
        <li>
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className='flex items-center justify-center px-3 h-8 leading-tight text-nezeza_gray_600 bg-white 
                  border borger-gray-300 rounded-e-lg hover:bg-gray-100 hover:ext-gray-700 dark:bg-gray-800
                  dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
          >
            <ChevronRight />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
