import React from 'react';
import { InventoryProps, OrderProps, stateProps } from '../../../type';
import { useSelector } from 'react-redux';

interface ConfirmResetFavoritesModalProps<T extends object> {
  isOpen: boolean;
  onClose: () => void;
  onConfirmResetFavorites: () => void;
}

const ConfirmResetFavoritesModal = <T extends { _id: number | string }>({
  isOpen,
  onClose,
  onConfirmResetFavorites,
}: ConfirmResetFavoritesModalProps<T>) => {
  if (!isOpen) return null;

  const { userInfo } = useSelector((state: stateProps) => state.next);

  const handleConfirmResetFavorites = async () => {
    onConfirmResetFavorites();
    onClose(); // Close the modal after deletion
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
      <div className='bg-vesoko_light_blue p-6 rounded-lg shadow-lg w-96'>
        <h3 className='text-lg font-semibold mb-4'>Confirm Reset Favorites</h3>
        <p className='mb-4'>
          Are you sure you want to clear the favorites permanently?
        </p>

        <div className='flex justify-end space-x-4'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-vesoko_gray_600 bg-gray-300 rounded-md hover:text-white hover:bg-gray-400'
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmResetFavorites}
            className='px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700'
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmResetFavoritesModal;
