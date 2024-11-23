


import React from 'react';
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <div className='flex'>
      {/* Sidebar */}
      <div
        // Conditional class based on isOpen
        // state to control width and visibility
        className={`bg-gray-800 text-white fixed h-screen transition-all duration-300 z-10 ${
          isOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        {/* Sidebar content */}
        <div className='flex flex-col items-center'>
          <Link href='/' className='mt-4 text-white hover:text-gray-300'>
            Dashboard
          </Link>

          <Link
            href='manufacturer/inventory'
            className='mt-4 text-white hover:text-gray-300'
          >
            Inventory
          </Link>
          <Link
            href='manufacturer/orders'
            className='mt-4 text-white hover:text-gray-300'
          >
            Orders
          </Link>
          <Link
            href='manufacturer/account'
            className='mt-4 text-white hover:text-gray-300'
          >
            Account
          </Link>
          {/* Add more sidebar items here */}
        </div>

        {/* Close button */}
        <button
          className='absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white'
          onClick={onClose}
        >
          {/* Close icon */}
          <svg
            className='h-6 w-6'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>
      {/* Main content */}
      <div className={`flex-1 p-4 ${isOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Button to toggle sidebar */}
        <div className='ml-auto'>
          <button
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            onClick={onClose}
          >
            {/* Toggle icon based on isOpen state */}
            {isOpen ? (
              <svg
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            ) : (
              <svg
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16m-7 6h7'
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;