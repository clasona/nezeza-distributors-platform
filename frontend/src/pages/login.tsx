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
import React, { useEffect, useState } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { stateProps } from '../../type';
import { getSellerTypeBaseurl } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { getFavorites } from '@/utils/favorites/getFavorites';
import { mergeFavoritesItems } from '@/utils/favorites/mergeFavoritesItems';

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
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      // Redirect based on user store type
      if (session?.user?.storeId) {
        if (session.user.storeId.storeType === 'manufacturing') {
          router.replace('/manufacturer');
        } else if (session.user.storeId.storeType === 'wholesale') {
          router.replace('/wholesaler');
        } else if (session.user.storeId.storeType === 'retail') {
          router.replace('/retailer');
        }
      } else {
        router.replace('/');
      }
    }
  }, [session, router]);

  const handleGoogleLogin = async () => {
    try {
      // signin with google and redirect to homepage
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Error during Google login:', error);
    }
  };

  // Get callback URL from query params or default to '/dashboard'
  let callbackUrl = '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // const response = await loginUser(email, password);
      setIsLoading(true);
      const res = await signIn('credentials', {
        redirect: false,
        email: email,
        password: password,
      });

      if (res?.error) {
        // setErrorMessage('Invalid credentials');
        // setIsLoading(false);
        setErrorMessage('Invalid credentials');
        return;
      }
      // Wait for session to update
      const updatedSession = await fetch('/api/auth/session').then((res) =>
        res.json()
      );

      if (updatedSession?.user) {
        // console.log('session data:', updatedSession)
        await loginUser(email, password); // For some reason, without this, the backend cookies are not attached to the user (as supposed to by the auth in [...nextauth].ts)
        const userData = updatedSession?.user;
        const storeData = updatedSession?.user.storeId;
        let storeId = 0;

        if (storeData) {
          storeId = storeData;
        }

        // set logged in userInfo to redux for further retrieval
        //TODO: Investigate why sometimes this only gets email and 'name' to redux when logging in?
        dispatch(
          addUser({
            _id: userData._id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            storeId: storeId,
            // image: loginData.user.image,
            //ADD MORE AS NEEDED
          })
        );

        // for sellers. set logged in storeInfo to redux for further retrieval
        //TODO: can be null for customers for now
        if (storeData) {
          dispatch(
            addStore({
              _id: storeData._id,
              name: storeData.name,
              email: storeData.email,
              storeType: storeData.storeType,
              // ADD MORE AS NEEDED
            })
          );
        }

        // Fetch and update cart after successful login
        try {
          const serverCartItems = await getCart(); // Get cart from server
          const mergedCartItems = mergeCartItems(
            cartItemsData,
            serverCartItems
          ); // Merge the carts

          dispatch(setCartItems(mergedCartItems)); // Dispatch the setCartItems action

          const serverFavoritesItems = await getFavorites(); // Get favorites from server
          const mergedFavoritesItems = mergeFavoritesItems(
            favoritesItemsData,
            serverFavoritesItems
          ); // Merge the favorites

          dispatch(setFavoritesItems(mergedFavoritesItems));
        } catch (error: any) {
          handleError(error);
        }

        setErrorMessage(''); // Clear any previous error message
        setSuccessMessage('Login successful. Redirecting to home page...'); //for testing

        // Redirect based on user store type
        if (updatedSession.user.storeId) {
          if (updatedSession.user.storeId.storeType === 'manufacturing') {
            callbackUrl = searchParams.get('callbackUrl') || '/manufacturer';
          } else if (updatedSession.user.storeId.storeType === 'wholesale') {
            callbackUrl = searchParams.get('callbackUrl') || '/wholesaler';
          } else if (updatedSession.user.storeId.storeType === 'retail') {
            callbackUrl = searchParams.get('callbackUrl') || '/retailer';
          }
        } else {
          callbackUrl = searchParams.get('callbackUrl') || '/';
        }
        // setIsLoading(false);
        router.push(callbackUrl); // Redirect user to their original page
      }
    } catch (error: any) {
      handleError(error);
      setErrorMessage(error);
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
        {/* {successMessage && (
          <SuccessMessageModal successMessage={successMessage} />
        )} */}
        {/* {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />} */}
      </div>
    </div>
  );
};

LoginPage.noLayout = true; // this will prevent Next.js from wrapping the component in a layout

export default LoginPage;
