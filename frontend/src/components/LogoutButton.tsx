import { removeStore, removeUser, resetCart } from '@/redux/nextSlice';
import { updateCart } from '@/utils/cart/updateCart';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(''); // State for error messages
  const { userInfo, cartItemsData } = useSelector(
    (state: stateProps) => state.next
  );

  const handleLogOutClick = async () => {
    setIsLoggingOut(true);
    setLogoutError('');

    try {
      await updateCart(cartItemsData, userInfo._id); // Ensure cart is updated first

      // Clear Redux state
      dispatch(removeUser());
      dispatch(removeStore());
      dispatch(resetCart());

      // Wait for Redux state to update before redirecting
      setTimeout(() => {
        signOut({ callbackUrl: redirectTo || '/login' });
      }, 100);
    } catch (error) {
      setLogoutError('Logout failed. Please try again.');
      setIsLoggingOut(false);
    }
  };


  // const handleLogOutClick = async () => {
  //   // handleLogout();
  //   setIsLoggingOut(true);
  //   setLogoutError('');

  //   const cartItems = cartItemsData; // or get it from useSelector if you need to send the current cart
  //   const buyerStoreId = userInfo._id; // get it from useSelector
  //   await updateCart(cartItems, buyerStoreId);
  //   dispatch(removeUser());
  //   dispatch(removeStore());
  //   dispatch(resetCart());
  //   await signOut({ callbackUrl: '/login' });
  // };

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
