import React, { useEffect, useState } from 'react';
import { OrderItemsProps, ProductProps } from '../../../type'; // Import OrderItemsProps
import Link from 'next/link';
import { updateOrderItem } from '@/utils/order/updateOrderItem';
import { useRouter } from 'next/router';
import ErrorMessageModal from '../ErrorMessageModal';


interface ConfirmNewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: OrderItemsProps;
  orderId: string;
}

const ConfirmNewProductModal = ({
  isOpen,
  onClose,
  orderId,
  item,
}: ConfirmNewProductModalProps) => {
  if (!isOpen) {
    return null;
  }
  const [isConfirming, setIsConfirming] = useState(false); // Track confirmation state
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [confirmationMessage, setConfirmationMessage] = useState<string>('');

  const handleConfirm = async () => {
    setIsConfirming(true); // Set confirming to true to disable the button

    if (!item.addedToInventory) {
      setConfirmationMessage(
        `⏳ Redirecting to create product page. Please wait...`
      );
      // Delay navigation to show confirmation message
      setTimeout(() => {
        router.push(
          {
            pathname: '../inventory/new-product', // Just the pathname
            query: {
              order_id: orderId,
              order_item_id: item._id,
            },
          },
          '../inventory/new-product'
        );
        // router.push(`../inventory/new-product?_id=${item.product._id}`);
      }, 2000);
    } else {
      setConfirmationMessage(
        '⚠ The selected item has already been added to your inventory.\n' +
          'An ordered item cannot be added twice.'
      );
    }
    setIsConfirming(false); // Reset confirming state
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
      <div className='bg-nezeza_light_blue p-6 rounded-lg shadow-lg w-96'>
        <h3 className='text-lg font-semibold mb-4'>Confirm Create Product</h3>
        {/* {isOrderProps(rowData) && ( */}
        <p className='mb-4'>
          You're about to generate a new product entry based on this ordered
          item.
        </p>

        <div className='flex justify-end space-x-4'>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className={
              'px-4 py-2 text-white bg-nezeza_green_600 hover:bg-nezeza_green_800 rounded-md'
            }
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className='px-4 py-2 text-nezeza_gray_600 bg-gray-300 rounded-md hover:text-white hover:bg-gray-400'
          >
            Cancel
          </button>
        </div>
        {/* Error Message */}
        {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
        {/* Display Confirmation Message (optional) */}
        {confirmationMessage && (
          <div className='mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded'>
            {confirmationMessage.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmNewProductModal;
