import React, { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { FaGoogle } from 'react-icons/fa';
import { stateProps } from '../../type';
import { useSelector, useDispatch } from 'react-redux';
import { addUser } from '@/store/nextSlice';
import axios from 'axios';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { userInfo } = useSelector((state: stateProps) => state.next);

  const dispatch = useDispatch();

  //initialize loginData as an object
  const [loginData, setLoginData] = useState<any | null>(null);
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
      const response = await axios.post(
        'http://localhost:8000/api/v1/auth/login',
        {
          email,
          password,
        },
        {
          withCredentials: true, // Include cookies with the request
          headers: {
            'Content-Type': 'application/json', // Default header, although Axios sets this automatically for POST
          },
        }
      );

      if (response.status !== 200) {
        setSuccessMessage(''); // Clear any previous error message
        setErrorMessage(response.data.msg);
        //TODO: Do not redirect
      } else {
        setLoginData(response.data);

        // set logged in user details to redux for further retreival
        dispatch(
          addUser({
            name: response.data.user.firstName,
            email: response.data.user.email,
            // image: loginData.user.image,
          })
        );

        setErrorMessage(''); // Clear any previous error message
        setSuccessMessage('Login successful. Redirecting to home page...'); //for testing
        setTimeout(() => {
          // Redirect to home page
          // window.location.href = '/browse-or-setup-store';
          window.location.href = '/';
        }, 2000); // Simulate delay for testing purposes

        //TODO: save and carry some of the userInfo details
      }
    } catch (error) {
      console.error('Error fetching login data:', error);
      //add other errors, such as unauthorized, etc
    }
  };

  return (
    <div className='w-full bg-gray-100 min-h-screen flex items-center justify-center'>
      <div className='bg-nezeza_light_blue p-4'>
        {/* <div className='bg-white shadow-lg rounded-lg p-6'> */}
        {/* TODO: add shadow such as: shadow-lg shadow-nezeza_light_blue-200 */}
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
          <button
            type='submit'
            className='w-full h-10 rounded-md font-medium bg-nezeza_dark_blue text-white hover:bg-nezeza_yellow 
            hover:text-black transition-colors duration-300 mt-2'
          >
            Login
          </button>
          <button
            type='button'
            onClick={handleGoogleLogin}
            className='w-full h-10 flex items-center justify-center gap-2 rounded-md font-medium bg-red-500 text-white hover:bg-red-600 transition-colors duration-300 mt-2'
          >
            <FaGoogle className='w-5 h-5' />
            Login with Google
          </button>

          {errorMessage && (
            <p className='mt-4 text-center text-red-500'>{errorMessage}</p>
          )}
          <p className='text-center mt-6 text-gray-600'>
            New to Nezeza?{' '}
            <a
              className='text-nezeza_yellow hover:text-nezeza_dark_blue hoverunderline transition-colors
            cursor-pointer duration-250'
              href='http://localhost:3000/register' //TODO: put real address
            >
              Signup
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

LoginPage.noLayout = true; // this will prevent Next.js from wrapping the component in a layout

export default LoginPage;
