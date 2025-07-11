import { Trash2 } from 'lucide-react';
import React from 'react';

interface BulkDeleteButtonProps {
  onClick: () => void;
  isDisabled: boolean;
}

const BulkDeleteButton: React.FC<BulkDeleteButtonProps> = ({
  onClick,
  isDisabled,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`flex items-center text-sm space-x-1 ${
        isDisabled
          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
          : 'bg-vesoko_red_600 text-white hover:bg-vesoko_red_700'
      } rounded-lg px-2 sm:px-4 py-2`}
      // className='flex items-center text-sm space-x-1 bg-vesoko_red_600 text-white rounded-lg px-4 py-2 hover:bg-vesoko_red_700'
    >
      <Trash2 className='w-4 h-4' />
      <span className='hidden md:inline'> Bulk Delete </span>
    </button>
  );
};

export default BulkDeleteButton;
