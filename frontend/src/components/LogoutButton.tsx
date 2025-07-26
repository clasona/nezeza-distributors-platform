import {
  removeStore,
  removeUser,
  resetCart,
  resetFavorites,
} from '@/redux/nextSlice';
import { updateCart } from '@/utils/cart/updateCart';
import { LogOut } from 'lucide-react';
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
    <div>
      <button
        className={`${className} flex items-center space-x-2 rounded-lg px-2 py-1 text-white bg-vesoko_red_600 hover:bg-vesoko_red_700`}
        onClick={handleLogOutClick}
      >
        <LogOut />
        {!noLogoutLabel && (
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        )}
      </button>

      {isLoggingOut && (
        <div className='fixed flex top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 justify-center items-center z-50'>
          <div className='text-vesoko_red_600 bg-vesoko_light_blue p-6 rounded-lg shadow-md'>
            <p>Logging you out...</p>
            {logoutError && <p className='text-red-500 mt-2'>{logoutError}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
