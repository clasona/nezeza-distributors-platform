import React from 'react';
import Image from 'next/image';
import { OrderItemsProps } from '../../../type';

interface ConfirmRemoveProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRemove: () => void;
  product: OrderItemsProps | null;
}

const ConfirmRemoveProductModal = ({
  isOpen,
  onClose,
  onConfirmRemove,
  product,
}: ConfirmRemoveProductModalProps) => {
  if (!isOpen || !product) return null;

  const handleConfirmRemove = () => {
    onConfirmRemove();
    onClose();
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50'>
      <div className='bg-white p-6 rounded-xl shadow-2xl w-96 max-w-md mx-4'>
        <h3 className='text-xl font-bold mb-4 text-gray-900'>Remove from Favorites</h3>
        <div className='mb-6'>
          <p className='text-gray-700 mb-3'>Are you sure you want to remove this item from your favorites?</p>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <div className='flex items-center gap-3'>
              <Image 
                src={product.product.images[0]} 
                alt={product.title}
                width={48}
                height={48}
                className='w-12 h-12 object-cover rounded-md'
              />
              <div className='flex-1'>
                <p className='font-medium text-gray-900 text-sm line-clamp-2'>{product.title}</p>
                <p className='text-sm text-gray-600'>${product.price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className='flex justify-end space-x-4'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-600 bg-gray-300 rounded-md hover:text-white hover:bg-gray-400 transition-colors duration-200'
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmRemove}
            className='px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200'
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRemoveProductModal;
