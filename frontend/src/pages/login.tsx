import React, { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { FaGoogle } from 'react-icons/fa';
import {
  AddressProps,
  OrderItemsProps,
  stateProps,
  StoreProps,
} from '../../type';
import { useSelector, useDispatch } from 'react-redux';
import { addUser, addStore, setCartItems } from '@/redux/nextSlice';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { createStore } from '../utils/store/createStore';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import { getCart } from '@/utils/cart/getCart';
import { mergeCartItems } from '@/utils/cart/mergeCartItems';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import ErrorMessageModal from '@/components/ErrorMessageModal';
import { loginUser } from '@/utils/auth/loginUser';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { cartItemsData, userInfo } = useSelector(
    (state: stateProps) => state.next
  );
  const router = useRouter();
  const dispatch = useDispatch();

  //initialize loginData as an object
  const [loginData, setLoginData] = useState<any | null>(null);

  // Redirect authenticated users away from login
  useEffect(() => {
    if (userInfo) {
      router.replace('/'); // Redirect to the homepage or dashboard
    }
  }, [userInfo, router]);

  const handleGoogleLogin = async () => {
    try {
      // signin with google and redirect to homepage
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Error during Google login:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await loginUser(email, password);
      if (response.status !== 200) {
        setSuccessMessage(''); // Clear any previous error message
        setErrorMessage(response.data.msg || 'Login failed.');
      } else {
        setLoginData(response.data);

        const userData = response.data.user;
        const storeData = response.data.user.storeId;
        let storeId = 0;

        if (storeData) {
          storeId = storeData;
        }

        // set logged in userInfo to redux for further retrieval
        dispatch(
          addUser({
            userId: userData._id,
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

        setErrorMessage(''); // Clear any previous error message
        setSuccessMessage('Login successful. Redirecting to home page...'); //for testing

        // Fetch and update cart after successful login
        try {
          const serverCartItems = await getCart(); // Get cart from server
          const mergedCartItems = mergeCartItems(
            cartItemsData,
            serverCartItems
          ); // Merge the carts

          dispatch(setCartItems(mergedCartItems)); // Dispatch the setCartItems action
        } catch (error) {
          console.error('Error fetching cart after login:', error);
        }

        setTimeout(() => {
          router.replace('/');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error);
    }
  };

  return (
    <div className='w-full bg-nezeza_powder_blue min-h-screen flex items-center justify-center'>
      <div className='bg-nezeza_light_blue p-4'>
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
            isLoading={false}
            buttonTitle='Login'
            loadingButtonTitle='Logging in ...'
            className='w-full h-10'
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
              href='http://localhost:3000/register' //TODO: put real address
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
