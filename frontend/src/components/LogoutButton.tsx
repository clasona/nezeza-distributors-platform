import {
  removeStore,
  removeUser,
  resetCart,
  resetFavorites,
} from '@/redux/nextSlice';
import { updateCart } from '@/utils/cart/updateCart';
import { LogOut, Loader2 } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { stateProps } from '../../type';
import { updateFavorites } from '@/utils/favorites/updateFavorites';
import { logoutUser } from '@/utils/auth/logoutUser';

interface LogoutButtonProps {
  redirectTo?: string;
  className?: string;
  noLogoutLabel?: boolean;
}
export const LogoutButton = ({
  redirectTo,
  className,
  noLogoutLabel,
}: LogoutButtonProps) => {
  const dispatch = useDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(''); // State for error messages
  const { userInfo, cartItemsData, favoritesItemsData } = useSelector(
    (state: stateProps) => state.next
  );

  const handleLogOutClick = async () => {
    setIsLoggingOut(true);
    setLogoutError('');

    try {
      // Save user data before logout
      await updateCart(cartItemsData, userInfo?._id);
      await updateFavorites(favoritesItemsData, userInfo?._id);
      
      // Call backend logout endpoint to clear cookies and tokens
      await logoutUser();
      
      // Clear Redux state
      dispatch(removeUser());
      dispatch(removeStore());
      dispatch(resetCart());
      dispatch(resetFavorites());

      // Sign out from NextAuth and redirect
      await signOut({ callbackUrl: redirectTo || '/' });
    } catch (error) {
      console.error('Logout error:', error);
      setLogoutError('Logout failed. Please try again.');
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <button
        disabled={isLoggingOut}
        className={`${className || ''} group relative flex items-center justify-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-75 ${
          className?.includes('w-full')
            ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
            : 'text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-sm'
        }`}
        onClick={handleLogOutClick}
      >
        {isLoggingOut ? (
          <Loader2 className='w-4 h-4 animate-spin' />
        ) : (
          <LogOut className='w-4 h-4' />
        )}
        {!noLogoutLabel && (
          <span className='ml-2'>
            {isLoggingOut ? 'Signing out...' : 'Sign out'}
          </span>
        )}
      </button>

      {/* Modern Loading Overlay */}
      {isLoggingOut && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 transform transition-all'>
            <div className='flex flex-col items-center text-center'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4'>
                <Loader2 className='w-8 h-8 text-red-600 animate-spin' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Signing you out
              </h3>
              <p className='text-sm text-gray-600 mb-4'>
                Please wait while we securely sign you out...
              </p>
              {logoutError && (
                <div className='w-full p-3 bg-red-50 border border-red-200 rounded-lg'>
                  <p className='text-sm text-red-700 font-medium'>Error</p>
                  <p className='text-xs text-red-600 mt-1'>{logoutError}</p>
                  <button
                    onClick={() => {
                      setLogoutError('');
                      setIsLoggingOut(false);
                    }}
                    className='mt-2 text-xs text-red-600 underline hover:text-red-800'
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
