import DropdownInputSearchable from '@/components/FormInputs/DropdownInputSearchable';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import TextInput from '@/components/FormInputs/TextInput';
import { registerUser } from '@/utils/auth/registerUser';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';

const RegisterPage = () => {
  // State hooks
  const [isSeller, setIsSeller] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [storeType, setStoreType] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
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
    setIsLoading(true);
    setErrorMessage('');
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

    // Add storeType to the data object if isSeller is true and carry some info to prefill in store application
    if (isSeller && storeType) {
      data.storeType = storeType.value;
      localStorage.setItem('selectedStoreType', storeType.value.toString());
    }

    if (!termsAccepted) {
      setErrorMessage('Please accept the terms and conditions.');
      setIsLoading(false);
      return;
    }

    try {
      localStorage.setItem('verificationEmail', data.email);
      localStorage.setItem('isSeller', isSeller.toString());
      // For sellers, we create their account when store application is approved
      if (!isSeller) {
        await registerUser(data);
        router.push(`/verify-email`);
      } else {
        router.push('/store-application');
      }
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
    <div className='w-full bg-vesoko_powder_blue min-h-screen flex items-center justify-center'>
      <div className='bg-vesoko_light_blue rounded-lg p-4'>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='w-full max-w-md bg-white p-6 rounded-lg shadow-lg'
        >
          <h2 className='text-2xl font-bold text-center text-vesoko_dark_blue mb-4'>
            Create a VeSoko Account
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
                className='mr-2 peer accent-vesoko_dark_blue'
              />
              Registering as a seller?
            </label>

            {isSeller && (
              <DropdownInputSearchable
                id='storeType'
                name='storeType'
                label='Select store type'
                options={storeTypeOptions}
                onChange={handleStoreTypeChange}
                value={storeType}
              />
            )}
          </div>
          <div className='flex items-center mt-4 mb-4'>
            <input
              type='checkbox'
              id='terms'
              className='mr-2'
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor='terms' className='text-xs text-vesoko_gray_600'>
              I accept the{' '}
              <a
                href='/terms' //TODO: Implement this page
                target='_blank'
                rel='noopener noreferrer'
                className='text-vesoko_dark_blue hover:text-vesoko_dark_blue underline transition-colors duration-250'
              >
                terms and conditions
              </a>
            </label>
          </div>
          {errorMessage && (
            <p className='mt-4 text-center text-vesoko_red_600'>
              {errorMessage}
            </p>
          )}
          <SubmitButton
            // isLoading={isLoading}
            buttonTitle='Signup'
            // loadingButtonTitle='Processing...'
            className='w-full h-10'
          />
          <button
            type='button'
            onClick={handleGoogleSignup}
            className={`w-full h-10 flex mt-2 items-center justify-center gap-2 py-2 rounded-md font-medium bg-vesoko_red_600 text-white hover:bg-vesoko_red_700 transition duration-300 ${
              isSeller ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSeller}
            tabIndex={isSeller ? -1 : 0}
          >
            <FcGoogle className='w-5 h-5' />
            Signup with Google
          </button>
          {/* </div> */}
          <p className='text-center mt-4 text-vesoko_gray_600'>
            Already have an account?{' '}
            <a
              href='/login'
              className='text-vesoko_dark_blue hover:text-vesoko_dark_blue underline transition-colors duration-250'
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
