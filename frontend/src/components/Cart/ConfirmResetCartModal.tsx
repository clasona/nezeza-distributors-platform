import React from 'react';
import { InventoryProps, OrderProps, stateProps } from '../../../type';
import { useSelector } from 'react-redux';

interface ConfirmResetCartModalProps<T extends object> {
  isOpen: boolean;
  onClose: () => void;
  onConfirmResetCart: () => void;
}

const ConfirmResetCartModal = <T extends { _id: number | string }>({
  isOpen,
  onClose,
  onConfirmResetCart,
}: ConfirmResetCartModalProps<T>) => {
  if (!isOpen) return null;


  const { userInfo } = useSelector((state: stateProps) => state.next);

  const handleConfirmResetCart = async () => {
      onConfirmResetCart();
      onClose(); // Close the modal after deletion
    
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
      <div className='bg-nezeza_light_blue p-6 rounded-lg shadow-lg w-96'>
        <h3 className='text-lg font-semibold mb-4'>Confirm Reset Cart</h3>
        <p className='mb-4'>
          Are you sure you want to clear the cart permanently?
        </p>
       
        <div className='flex justify-end space-x-4'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-nezeza_gray_600 bg-gray-300 rounded-md hover:text-white hover:bg-gray-400'
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmResetCart}
            className='px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700'
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmResetCartModal;
