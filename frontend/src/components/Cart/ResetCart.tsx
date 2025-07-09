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
    <div>
      <button
        onClick={handleResetCartClick}
        className='w-44 h-10 font-semibold bg-gray-200 rounded-lg hover:bg-red-600 hover:text-white duration-300'
      >
        Reset cart
      </button>
      <Link
        href='/'
        className='ml-4 font-semibold text-vesoko_dark_blue rounded-lg hover:underline'
      >
        Continue shopping
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
