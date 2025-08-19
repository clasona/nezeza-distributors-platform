import React from 'react';

interface BulkArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const BulkArchiveModal: React.FC<BulkArchiveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-[9999]'>
      <div className='bg-vesoko_background p-6 rounded-lg shadow-lg w-96'>
        <h2 className='text-lg font-semibold mb-4'>Confirm Bulk Archive</h2>
        <p className='mb-4'>
          Are you sure you want to archive the selected rows? This action will
          move them to the archive and they can be restored later.
        </p>
        <div className='flex justify-end space-x-4'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-vesoko_gray_600 bg-gray-300 rounded-md hover:text-white hover:bg-gray-400'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='px-4 py-2 text-white bg-vesoko_orange_600 rounded-md hover:bg-vesoko_orange_700'
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkArchiveModal;
