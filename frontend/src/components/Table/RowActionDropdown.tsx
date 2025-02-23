import { Ellipsis } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

interface RowActionDropdownProps {
  // actions: (string | { href: string; label: string })[];
  actions: (
    | { label: string; onClick: () => void }
    | { label: string; href: string }
  )[];
}
const RowActionDropdown = ({ actions }: RowActionDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className='relative inline-block text-left '>
      <button
        type='button'
        className='inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        id='dropdownMenuButton2'
        data-dropdown-toggle='dropdownMenuButton2'
        onClick={toggleDropdown}
      >
        <span className='sr-only'>Open dropdown menu</span>
        <Ellipsis />
      </button>

      <div
        id='dropdownMenuButton2'
        className={`z-10 absolute right-0 mt-2 w-48 bg-nezeza_light_blue rounded-md shadow-lg ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        <div className='py-1'>
          {actions.map((action, index) => (
            <React.Fragment key={index}>
              {'href' in action ? (
                <Link
                  href={action.href}
                  className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-300 hover:text-gray-900'
                >
                  {action.label}
                </Link>
              ) : (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false); // Close dropdown after action
                  }}
                  className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-300 hover:text-gray-900'
                >
                  {action.label}
                </button>
              )}
            </React.Fragment>
          ))}
          {/* <button
              key={index}
              onClick={() => {
                action.onClick();
                setIsOpen(false); // Close dropdown after action
              }}
              className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-300 hover:text-gray-900'
            >
              {action.label}
            </button> */}
          {/* ))} */}
        </div>
      </div>
    </div>
  );
};

export default RowActionDropdown;
