import React from 'react';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../type';

interface ConfirmAddAllToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAddAllToCart: () => void;
}

const ConfirmAddAllToCartModal = ({
  isOpen,
  onClose,
  onConfirmAddAllToCart,
}: ConfirmAddAllToCartModalProps) => {
  const { favoritesItemsData } = useSelector((state: stateProps) => state.next);
  
  if (!isOpen) return null;

  const totalItems = favoritesItemsData.length;
  const totalValue = favoritesItemsData.reduce((sum, item) => sum + item.price, 0);

  const handleConfirmAddAllToCart = () => {
    onConfirmAddAllToCart();
    onClose();
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50'>
      <div className='bg-white p-6 rounded-xl shadow-2xl w-96 max-w-md mx-4'>
        <h3 className='text-xl font-bold mb-4 text-gray-900'>Add All to Cart</h3>
        <div className='mb-6'>
          <p className='text-gray-700 mb-3'>You're about to add all your favorite items to the cart:</p>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-sm font-medium text-gray-600'>Total Items:</span>
              <span className='text-sm font-bold text-gray-900'>{totalItems}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm font-medium text-gray-600'>Total Value:</span>
              <span className='text-sm font-bold text-vesoko_green_600'>${totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className='flex justify-end space-x-4'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-600 bg-gray-300 rounded-md hover:text-white hover:bg-gray-400'
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmAddAllToCart}
            className='px-4 py-2 text-white bg-vesoko_green_600 rounded-md hover:bg-vesoko_green_700'
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAddAllToCartModal;

