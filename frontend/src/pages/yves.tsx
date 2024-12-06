import React, { useState } from 'react';

const Pagination = ({ data }: { data: any[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 2;
  const totalPages = Math.ceil(data.length / PAGE_SIZE);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, data.length);
  const displayedData = data.slice(startIndex, endIndex);

  return (
    <nav
      className='flex items-center flex-column flex-wrap md:flex-row justify-between pt-4'
      aria-label='Table navigation'
    >
      <span className='text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto'>
        Showing {itemStartIndex}-{itemEndIndex} of {data.length}
      </span>
      <ul className='inline-flex -space-x-px rtl:space-x-reverse test-sm h-14'>
        <li>
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageClick(currentPage - 1)}
            className='flex items-center justify-center px-3 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
          >
            Previous
          </button>
        </li>
        {Array.from({ length: totalPages }, (_, index) => (
          <li key={index}>
            <button
              onClick={() => handlePageClick(index + 1)}
              className={`flex items-center justify-center px-3 h-10 leading-tight ${
                currentPage === index + 1
                  ? 'text-gray-50 bg-blue-600 border-blue-300 dark:bg-blue-600 dark:border-gray-700  dark:text-gray-50 dark:hover:bg-blue-900 dark:hover:text-white hover:bg-blue-900 hover:text-white'
                  : 'text-gray-500 bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700  dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {index + 1}
            </button>
          </li>
        ))}
        <li>
          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageClick(currentPage + 1)}
            className='flex items-center justify-center px-3 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
