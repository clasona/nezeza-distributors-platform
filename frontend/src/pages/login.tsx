import SubmitButton from '@/components/FormInputs/SubmitButton';
import {
  addStore,
  addUser,
  setCartItems,
  setFavoritesItems,
} from '@/redux/nextSlice';
import { loginUser } from '@/utils/auth/loginUser';
import { getCart } from '@/utils/cart/getCart';
import { mergeCartItems } from '@/utils/cart/mergeCartItems';
import { handleError } from '@/utils/errorUtils';
import { signIn, useSession } from 'next-auth/react';
import React, { useEffect, useState, useRef } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { stateProps } from '../../type';
import { useRouter, useSearchParams } from 'next/navigation';
import { getFavorites } from '@/utils/favorites/getFavorites';
import { mergeFavoritesItems } from '@/utils/favorites/mergeFavoritesItems';
import { hasActiveStripeConnectAccount as checkActiveStripeAccountApi } from '@/utils/stripe/hasStripeConnectAccount';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { cartItemsData, favoritesItemsData } = useSelector(
    (state: stateProps) => state.next
  );
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  // Memoization ref for Stripe check
  const hasCheckedStripeRef = useRef<{ [userId: string]: boolean }>({});

  useEffect(() => {
    // Only proceed if session is loaded and user exists
    if (sessionStatus === 'authenticated' && session?.user) {
      handlePostLoginRedirect();
    }
  }, [session, sessionStatus, router]); // Add sessionStatus to dependencies

  const handlePostLoginRedirect = async () => {
    const user = session?.user;

    if (user?.storeId) {
      // User is a seller
      setIsLoading(true); // Show loading while checking Stripe status
      try {
        // Memoization: only check if we haven't checked for this user
        if (!hasCheckedStripeRef.current[user._id]) {
          const response = await checkActiveStripeAccountApi(user._id);
          hasCheckedStripeRef.current[user._id] = true; // Mark as checked

          if (response && response.hasStripeAccount && response.isActive) {
            // Seller has an active Stripe account, redirect to their dashboard
            let callbackUrl = '/'; // Default fallback
            if (user.storeId.storeType === 'manufacturing') {
              callbackUrl = '/manufacturer';
            } else if (user.storeId.storeType === 'wholesale') {
              callbackUrl = '/wholesaler';
            } else if (user.storeId.storeType === 'retail') {
              callbackUrl = '/retailer';
            } else if (user.storeId.storeType === 'admin') {
              callbackUrl = '/admin';
            }
            router.replace(callbackUrl);
          } else {
            // Seller has no active Stripe account, force redirect to setup page
            router.replace('/sellers/stripe/setup');
          }
        }
        // If already checked, do nothing or redirect to dashboard as needed
      } catch (error) {
        console.error('Error checking Stripe account during login:', error);
        setErrorMessage(
          'Failed to check Stripe account status. Please try again.'
        );
        router.replace('/'); // Fallback to homepage or an error page
      } finally {
        setIsLoading(false);
      }
    } else {
      // User is a customer, redirect to homepage
      router.replace('/');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // signIn with google and redirect to homepage. The useEffect will then handle further redirects.
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Error during Google login:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(''); // Clear previous errors

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: email,
        password: password,
      });

      if (res?.error) {
        setErrorMessage('Invalid credentials');
        setIsLoading(false);
        return;
      }

      // Re-fetch session to get the latest user data including storeId
      const updatedSession = await fetch('/api/auth/session').then((res) =>
        res.json()
      );

      if (updatedSession?.user) {
        await loginUser(email, password);

        const userData = updatedSession?.user;
        const storeData = userData.storeId;

        dispatch(
          addUser({
            _id: userData._id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            storeId: storeData || null,
          })
        );

        if (storeData) {
          dispatch(
            addStore({
              _id: storeData._id,
              name: storeData.name,
              email: storeData.email,
              storeType: storeData.storeType,
            })
          );
        }

        try {
          const serverCartItems = await getCart();
          const mergedCartItems = mergeCartItems(
            cartItemsData,
            serverCartItems
          );
          dispatch(setCartItems(mergedCartItems));

          const serverFavoritesItems = await getFavorites();
          const mergedFavoritesItems = mergeFavoritesItems(
            favoritesItemsData,
            serverFavoritesItems
          );
          dispatch(setFavoritesItems(mergedFavoritesItems));
        } catch (error: any) {
          handleError(error);
        }

        setSuccessMessage('Login successful. Redirecting...');

        // The useEffect will now trigger `handlePostLoginRedirect` with the updated session
      }
    } catch (error: any) {
      handleError(error);
      setErrorMessage(
        error.message || 'An unexpected error occurred during login.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full bg-nezeza_powder_blue min-h-screen flex items-center justify-center'>
      <div className='bg-nezeza_light_blue rounded-lg p-4'>
        <form
          onSubmit={handleSubmit}
          className='w-full bg-white p-6 rounded-lg shadow-lg'
        >
          <h2 className='text-2xl font-bold text-center text-nezeza_dark_blue mb-4'>
            Login to Nezeza
          </h2>
          <div className='mb-2'>
            <label className='block text-gray-700' htmlFor='email'>
              Email:
            </label>
            <input
              className='w-full p-2 py-1 rounded-md border border-gray-300 border-nezeza_light focus:border-nezeza_yellow focus:outline-none'
              type='email'
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className='mb-2'>
            <label className='block text-gray-700' htmlFor='password'>
              Password:
            </label>
            <input
              className='w-full p-2 py-1 rounded-md border border-gray-300 border-nezeza_light focus:border-nezeza_yellow focus:outline-none'
              type='password'
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <SubmitButton
            isLoading={isLoading}
            buttonTitle='Login'
            className='w-full h-10'
            disabled={isLoading}
          />

          <button
            type='button'
            onClick={handleGoogleLogin}
            className='w-full h-10 flex items-center justify-center gap-2 rounded-md font-medium bg-nezeza_red_600 text-white hover:bg-red-600 transition-colors duration-300 mt-2'
          >
            <FaGoogle className='w-5 h-5' />
            Login with Google
          </button>

          {errorMessage && (
            <p className='mt-4 text-center text-nezeza_red_600'>
              {errorMessage}
            </p>
          )}
          <p className='text-center mt-6 text-gray-600'>
            New to Nezeza?{' '}
            <a
              className='text-nezeza_dark_blue hover:text-nezeza_dark_blue underline transition-colors
            cursor-pointer duration-250'
              href='/register'
            >
              Signup
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

LoginPage.noLayout = true;

export default LoginPage;
