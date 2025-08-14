import FavoritesProduct from '@/components/Favorites/FavoritesProduct';
import ResetFavorites from '@/components/Favorites/ResetFavorites';
import ConfirmAddAllToCartModal from '@/components/Favorites/ConfirmAddAllToCartModal';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { Heart, ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import { addAllFavoritesToCart } from '@/redux/nextSlice';
import { OrderItemsProps, stateProps } from '../../type';

const FavoritesPage = () => {
  const { favoritesItemsData } = useSelector((state: stateProps) => state.next);
  const dispatch = useDispatch();
  const [isConfirmAddAllModalOpen, setIsConfirmAddAllModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddAllToCartClick = () => {
    setIsConfirmAddAllModalOpen(true);
  };

  const handleConfirmAddAllToCart = () => {
    dispatch(addAllFavoritesToCart());
    setSuccessMessage(`${favoritesItemsData.length} item(s) added to cart successfully!`);
    setIsConfirmAddAllModalOpen(false);
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <Link href='/' className='inline-flex items-center text-vesoko_primary hover:text-vesoko_primary transition-colors duration-200 mb-4'>
            <ArrowLeft className='h-5 w-5 mr-2' />
            Continue Shopping
          </Link>
          <div className='flex items-center gap-3 mb-2'>
            <div className='p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg'>
              <Heart className='h-6 w-6 text-white' />
            </div>
            <h1 className='text-3xl font-bold text-gray-900'>My Favorites</h1>
          </div>
          <p className='text-gray-600'>Your saved items and wishlist</p>
        </div>

        {favoritesItemsData.length > 0 ? (
          <div className='space-y-6'>
            {/* Stats Bar */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-2'>
                    <Star className='h-5 w-5 text-yellow-400 fill-current' />
                    <span className='text-sm font-medium text-gray-900'>
                      {favoritesItemsData.length} saved {favoritesItemsData.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>
                <Link
                  href='/cart'
                  className='inline-flex items-center gap-2 px-4 py-2 bg-vesoko_primary text-white text-sm font-medium rounded-lg hover:bg-vesoko_primary transition-colors duration-200'
                >
                  <ShoppingCart className='h-4 w-4' />
                  View Cart
                </Link>
              </div>
            </div>

            {/* Favorites Items */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
              <div className='px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    Saved Items ({favoritesItemsData.length})
                  </h2>
                  <p className='text-sm text-gray-500'>Price</p>
                </div>
              </div>
              <div className='divide-y divide-gray-200'>
                {favoritesItemsData.map((item: OrderItemsProps) => (
                  <div key={item.product._id} className='p-6 hover:bg-gray-50 transition-colors duration-200'>
                    <FavoritesProduct item={item} />
                  </div>
                ))}
              </div>
              <div className='px-6 py-4 bg-gray-50 border-t border-gray-200'>
                <ResetFavorites />
              </div>
            </div>

            {/* Quick Actions */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Quick Actions</h3>
              <div className='flex flex-wrap gap-3'>
                <Link
                  href='/'
                  className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200'
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={handleAddAllToCartClick}
                  className='inline-flex items-center gap-2 px-4 py-2 bg-vesoko_primary text-white text-sm font-medium rounded-lg hover:bg-vesoko_primary_dark transition-colors duration-200'
                >
                  <ShoppingCart className='h-4 w-4' />
                  Add All to Cart
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className='max-w-md mx-auto'>
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center'>
              <div className='mx-auto w-24 h-24 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mb-6'>
                <Heart className='h-12 w-12 text-pink-400' />
              </div>
              <h2 className='text-2xl font-semibold text-gray-900 mb-3'>No favorites yet</h2>
              <p className='text-gray-600 mb-8'>Start adding items to your favorites by clicking the heart icon on products you love!</p>
              <Link
                href='/'
                className='inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200'
              >
                <ShoppingCart className='h-5 w-5 mr-2' />
                Discover Products
              </Link>
            </div>
          </div>
        )}
        
        {/* Success Message */}
        {successMessage && (
          <div className='fixed top-4 right-4 bg-vesoko_primary text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in'>
            <div className='flex items-center gap-2'>
              <ShoppingCart className='h-5 w-5' />
              <span>{successMessage}</span>
            </div>
          </div>
        )}
        
        {/* Confirmation Modal */}
        <ConfirmAddAllToCartModal
          isOpen={isConfirmAddAllModalOpen}
          onClose={() => setIsConfirmAddAllModalOpen(false)}
          onConfirmAddAllToCart={handleConfirmAddAllToCart}
        />
      </div>
    </div>
  );
};

export default FavoritesPage;
