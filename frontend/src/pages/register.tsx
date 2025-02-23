import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import TextInput from '@/components/FormInputs/TextInput';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import ErrorMessageModal from '@/components/ErrorMessageModal';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import { registerUser } from '@/utils/user/registerUser';
import { createStore } from '../utils/store/createStore';
import { AddressProps, StoreProps } from '../../type';
import { FaGoogle } from 'react-icons/fa';
import { signIn } from 'next-auth/react';

const RegisterSellerPage = () => {
  // State hooks
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationPrompt, setVerificationPrompt] = useState(false);
  const [email, setEmail] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Form submission handler
  const onSubmit = async (data: any) => {
    if (data.password !== data.repeatPassword) {
      setErrorMessage("Passwords don't match");
      return;
    }

    try {
      await registerUser(data);
      setErrorMessage('');
      setSuccessMessage('User registered successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);

      setEmail(data.email); // Save email for verification prompt
      setVerificationPrompt(true); // Show email verification prompt
    } catch (error) {
      setErrorMessage('Error registering user.');
    }
  };

  const handleGoogleSignup = async () => {
    try {
      // signup with google and redirect to homepage
      await signIn('google', { callbackUrl: '/login' });
    } catch (error) {
      console.error('Error during Google signup:', error);
    }
  };

  return (
    <div className='w-full bg-nezeza_light_blue min-h-screen flex items-center justify-center'>
      <div className='bg-nezeza_light_blue p-4'>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='w-full max-w-md bg-white p-6 rounded-lg shadow-lg'
        >
          <h2 className='text-2xl font-bold text-center text-nezeza_dark_blue mb-4'>
            Create a Nezeza Account
          </h2>

          {!verificationPrompt ? (
            <>
              {/* Form Fields */}
              <div className='space-y-2'>
                <TextInput
                  label='First Name'
                  id='firstName'
                  name='firstName'
                  register={register}
                  errors={errors}
                  type='text'
                />
                <TextInput
                  label='Last Name'
                  id='lastName'
                  name='lastName'
                  register={register}
                  errors={errors}
                  type='text'
                />

                <TextInput
                  label='Email'
                  id='email'
                  name='email'
                  register={register}
                  errors={errors}
                  type='email'
                />

                <TextInput
                  label='Password'
                  id='password'
                  name='password'
                  register={register}
                  errors={errors}
                  type='password'
                />

                <TextInput
                  label='Repeat Password'
                  id='repeatPassword'
                  name='repeatPassword'
                  register={register}
                  errors={errors}
                  type='password'
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>

              {/* <div className='flex items-center justify-center'> */}
              {successMessage && (
                <SuccessMessageModal successMessage={successMessage} />
              )}
              {errorMessage && (
                <ErrorMessageModal errorMessage={errorMessage} />
              )}
              {/* <div className='flex flex-col items-center gap-3'> */}
              <SubmitButton
                isLoading={false}
                buttonTitle='Signup'
                loadingButtonTitle='Registering user...'
                className='w-full h-10 '
              />
              <button
                type='button'
                onClick={handleGoogleSignup}
                className='w-full h-10 flex mt-2 items-center justify-center gap-2 py-2 rounded-md font-medium bg-nezeza_red_600 text-white hover:bg-nezeza_red_700 transition duration-300'
              >
                <FaGoogle className='w-5 h-5' />
                Signup with Google
              </button>
              {/* </div> */}

              <p className='text-center mt-4 text-nezeza_gray_600'>
                Already have an account?{' '}
                <a
                  href='/login'
                  className='text-nezeza_dark_blue hover:text-nezeza_dark_blue underline transition-colors duration-250'
                >
                  Sign in
                </a>
              </p>
            </>
          ) : (
            <div className='text-center mt-6'>
              <h3 className='text-xl font-semibold text-nezeza_green_600'>
                Verify Your Email
              </h3>
              <p className='mt-4 text-gray-600'>
                We've sent a verification link to <strong>{email}</strong>.
                Please check your inbox and follow the instructions to verify
                your email.
              </p>
              <button
                type='button'
                className='mt-6 px-4 py-2 rounded-md bg-nezeza_dark_blue text-white hover:bg-nezeza_yellow hover:text-black transition-colors duration-300'
                onClick={() => (window.location.href = '/login')}
              >
                Continue to Login
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

RegisterSellerPage.noLayout = true; // Remove root layout from this page
export default RegisterSellerPage;
