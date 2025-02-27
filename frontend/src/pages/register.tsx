import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import TextInput from '@/components/FormInputs/TextInput';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import ErrorMessageModal from '@/components/ErrorMessageModal';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import { registerUser } from '@/utils/auth/registerUser';
import { createStore } from '../utils/store/createStore';
import { AddressProps, StoreProps } from '../../type';
import { FaGoogle } from 'react-icons/fa';
import { signIn } from 'next-auth/react';
import DropdownInputSearchable from '@/components/FormInputs/DropdownInputSearchable';
import { checkUserVerified } from '@/utils/auth/checkUserVerified';
import { useRouter } from 'next/router';

const RegisterPage = () => {
  // State hooks
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationPrompt, setVerificationPrompt] = useState(false);
  const [email, setEmail] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isSeller, setIsSeller] = useState(false);
  const [storeType, setStoreType] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Form submission handler
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    if (data.password !== data.repeatPassword) {
      setErrorMessage("Passwords don't match");
      setIsLoading(false);
      return;
    }
    if (isSeller && !storeType) {
      setErrorMessage('Please select a store type.');
      setIsLoading(false);
      return;
    }

    // Add storeType to the data object if isSeller is true
    if (isSeller && storeType) {
      data.storeType = storeType.value;
    }

    try {
      console.log(data);
      await registerUser(data);
      setSuccessMessage('User registered successfully.');
       localStorage.setItem('verificationEmail', data.email);
       localStorage.setItem('isSeller', isSeller.toString());
      router.push(`/verify-email`);
    } catch (error: any) {
      console.error('Register error:', error);
      setErrorMessage(error);
    } finally {
      setIsLoading(false);
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

  const handleSellerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSeller(e.target.checked);
    if (!e.target.checked) {
      setStoreType(null); // Reset store type if not seller
    }
  };

  const handleStoreTypeChange = (
    value: { value: string; label: string } | null
  ) => {
    setStoreType(value);
  };
  const storeTypeOptions = [
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'retail', label: 'Retail' },
  ];

  return (
    <div className='w-full bg-nezeza_powder_blue min-h-screen flex items-center justify-center'>
      <div className='bg-nezeza_light_blue p-4'>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='w-full max-w-md bg-white p-6 rounded-lg shadow-lg'
        >
          <h2 className='text-2xl font-bold text-center text-nezeza_dark_blue mb-4'>
            Create a Nezeza Account
          </h2>
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
          <div className='flex flex-col text-sm mt-4'>
            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={isSeller}
                onChange={handleSellerChange}
                className='mr-2 peer accent-nezeza_dark_blue'
              />
              Registering as a seller?
            </label>

            {isSeller && (
              <DropdownInputSearchable
                label='Select store type'
                options={storeTypeOptions}
                onChange={handleStoreTypeChange}
                value={storeType}
              />
            )}
          </div>
          {errorMessage && (
            <p className='mt-4 text-center text-nezeza_red_600'>
              {errorMessage}
            </p>
          )}
          <SubmitButton
            isLoading={isLoading}
            buttonTitle='Signup'
            loadingButtonTitle='Processing...'
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
        </form>
      </div>
    </div>
  );
};

RegisterPage.noLayout = true; // Remove root layout from this page
export default RegisterPage;
