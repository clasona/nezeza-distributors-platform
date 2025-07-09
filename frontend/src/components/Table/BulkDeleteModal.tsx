import React from 'react';

interface BulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
      <div className='bg-vesoko_light_blue p-6 rounded-lg shadow-lg w-96'>
        <h2 className='text-lg font-semibold mb-4'>Confirm Bulk Delete</h2>
        <p className='mb-4'>
          Are you sure you want to delete the selected rows? This action cannot
          be undone.
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
            className='px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700'
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkDeleteModal;
