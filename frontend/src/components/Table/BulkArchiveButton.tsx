import { Archive } from 'lucide-react';
import React from 'react';

interface BulkArchiveButtonProps {
  onClick: () => void;
  isDisabled: boolean;
}

const BulkArchiveButton: React.FC<BulkArchiveButtonProps> = ({
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
          : 'bg-vesoko_orange_600 text-white hover:bg-vesoko_orange_700'
      } rounded-lg px-2 sm:px-4 py-2`}
    >
      <Archive className='w-4 h-4' />
      <span className='hidden md:inline'> Bulk Archive </span>
    </button>
  );
};

export default BulkArchiveButton;
