import { removeUser, removeStore, resetCart } from '@/store/nextSlice';
import { signOut } from 'next-auth/react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/router';
import { updateCart } from '@/utils/cart/updateCart';
import { stateProps } from '../../type';

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
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(''); // State for error messages
   const { userInfo, cartItemsData } = useSelector(
     (state: stateProps) => state.next
   );
  
  const handleLogout = async () => {
 

    setIsLoggingOut(true);
    setLogoutError('');

    try {
      await signOut(); // Wait for signOut to complete
      const cartItems = cartItemsData; // or get it from useSelector if you need to send the current cart
      const buyerStoreId = userInfo.userId; // get it from useSelector
      await updateCart(cartItems, buyerStoreId);

      dispatch(removeUser());
      dispatch(removeStore());
      dispatch(resetCart());

      if (redirectTo) {
        window.location.href = `/${redirectTo}`;
      } else {
        // router.replace('/');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      setLogoutError('An error occurred during logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogOutClick = () => {
    handleLogout();
  };

  return (
    <div>
      <button
        className={`${className} flex items-center space-x-2 rounded-lg px-2 py-1 text-white bg-nezeza_red_600 hover:bg-nezeza_red_700`}
        onClick={handleLogOutClick}
      >
        <LogOut />
        {!noLogoutLabel && (
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        )}
      </button>

      {isLoggingOut && (
        <div className='fixed flex top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 justify-center items-center z-50'>
          <div className='text-nezeza_red_600 bg-nezeza_light_blue p-6 rounded-lg shadow-md'>
            <p>Logging you out...</p>
            {logoutError && <p className='text-red-500 mt-2'>{logoutError}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
