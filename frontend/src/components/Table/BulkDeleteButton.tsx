import { Trash2 } from 'lucide-react';
import React from 'react'

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
          : 'bg-nezeza_red_600 text-white hover:bg-nezeza_red_700'
      } rounded-lg px-4 py-2`}
      // className='flex items-center text-sm space-x-1 bg-nezeza_red_600 text-white rounded-lg px-4 py-2 hover:bg-nezeza_red_700'
    >
      <Trash2 />
      <span> Bulk Delete </span>
    </button>
  );
};

export default BulkDeleteButton