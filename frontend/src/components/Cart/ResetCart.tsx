import { clearCartOnServer, resetCart } from '@/redux/nextSlice';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import ConfirmResetCartModal from './ConfirmResetCartModal';
import Link from 'next/link';

const ResetCart = () => {
  const dispatch = useDispatch<any>();
  const [isConfirmCartResetModalOpen, setIsConfirmCartResetModalOpen] =
    useState(false);

  const handleResetCartClick = () => {
    setIsConfirmCartResetModalOpen(true); // Only open the modal
  };

  const handleResetCart = () => {
    dispatch(resetCart()); // Clear cart in Redux
    dispatch(clearCartOnServer()); // Clear cart on the server (async)
    setIsConfirmCartResetModalOpen(false); // Close the modal after confirmation

    // const confirmReset = window.confirm(
    //   'Are you sure to delete all items from your cart?'
    // );
    // if (confirmReset) {
    //   dispatch(resetCart());
    // }
  };

  return (
    <div className='flex items-center gap-4 py-4'>
      <button
        onClick={handleResetCartClick}
        className='px-6 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-300'
      >
        Reset Cart
      </button>
      <Link
        href='/'
        className='text-sm font-semibold text-vesoko_dark_blue hover:text-vesoko_green_600 transition-colors duration-300'
      >
        Continue Shopping
      </Link>
      {/* Reset Cart Modal */}
      {isConfirmCartResetModalOpen && (
        <ConfirmResetCartModal
          isOpen={isConfirmCartResetModalOpen}
          onClose={() => setIsConfirmCartResetModalOpen(false)}
          onConfirmResetCart={() => handleResetCart()}
        />
      )}
    </div>
  );
};

export default ResetCart;
