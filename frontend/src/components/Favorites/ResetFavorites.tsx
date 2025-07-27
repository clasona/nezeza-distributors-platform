import { clearFavoritesOnServer, resetFavorites } from '@/redux/nextSlice';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import ConfirmResetFavoritesModal from './ConfirmResetFavoritesModal';

const ResetFavorites = () => {
  const dispatch = useDispatch<any>();
  const [isConfirmFavoritesResetModalOpen, setIsConfirmFavoritesResetModalOpen] =
    useState(false);

  const handleResetFavoritesClick = () => {
    setIsConfirmFavoritesResetModalOpen(true); // Only open the modal
  };

  const handleResetFavorites = () => {
    dispatch(resetFavorites()); // Clear favorites in Redux
    dispatch(clearFavoritesOnServer()); // Clear favorites on the server (async)
    setIsConfirmFavoritesResetModalOpen(false); // Close the modal after confirmation

    // const confirmReset = window.confirm(
    //   'Are you sure to delete all items from your favorites?'
    // );
    // if (confirmReset) {
    //   dispatch(resetFavorites());
    // }
  };
  return (
    <div className='flex items-center justify-between py-4'>
      <button
        onClick={handleResetFavoritesClick}
        className='px-6 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-300'
      >
        Reset Favorites
      </button>

      {/* Reset Favorites Modal */}
      {isConfirmFavoritesResetModalOpen && (
        <ConfirmResetFavoritesModal
          isOpen={isConfirmFavoritesResetModalOpen}
          onClose={() => setIsConfirmFavoritesResetModalOpen(false)}
          onConfirmResetFavorites={() => handleResetFavorites()}
        />
      )}
    </div>
  );
};

export default ResetFavorites;
