import DropdownInputSearchable from '@/components/FormInputs/DropdownInputSearchable';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import TextInput from '@/components/FormInputs/TextInput';
import { registerUser } from '@/utils/auth/registerUser';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff, User, Mail, Lock, Store, CheckCircle2 } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
    if (isSeller) return; // Don't allow Google signup for sellers
    
    setIsGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: '/login' });
    } catch (error) {
      console.error('Error during Google signup:', error);
      setErrorMessage('Google signup failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
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

  const isAnyLoading = isLoading || isGoogleLoading;

  return (
    <div className='w-full bg-gradient-to-br from-vesoko_powder_blue to-vesoko_light_blue min-h-screen flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-lg'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 border border-gray-100'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-vesoko_dark_blue mb-2'>
              Join VeSoko
            </h1>
            <p className='text-gray-600'>Create your account and start exploring</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Name Fields */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2' htmlFor='firstName'>
                  First Name
                </label>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={18} />
                  <input
                    {...register('firstName', { required: true })}
                    id='firstName'
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 ${
                      errors.firstName
                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-vesoko_yellow focus:ring-2 focus:ring-vesoko_yellow/20'
                    } focus:outline-none`}
                    type='text'
                    placeholder='First name'
                    disabled={isAnyLoading}
                  />
                </div>
                {errors.firstName && (
                  <p className='text-red-500 text-sm mt-1'>First name is required</p>
                )}
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2' htmlFor='lastName'>
                  Last Name
                </label>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={18} />
                  <input
                    {...register('lastName', { required: true })}
                    id='lastName'
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 ${
                      errors.lastName
                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-vesoko_yellow focus:ring-2 focus:ring-vesoko_yellow/20'
                    } focus:outline-none`}
                    type='text'
                    placeholder='Last name'
                    disabled={isAnyLoading}
                  />
                </div>
                {errors.lastName && (
                  <p className='text-red-500 text-sm mt-1'>Last name is required</p>
                )}
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2' htmlFor='email'>
                Email Address
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                <input
                  {...register('email', { required: true, pattern: /^[^@]+@[^@]+\.[^@]+$/ })}
                  id='email'
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-200 ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:border-vesoko_yellow focus:ring-2 focus:ring-vesoko_yellow/20'
                  } focus:outline-none`}
                  type='email'
                  placeholder='Enter your email'
                  disabled={isAnyLoading}
                />
              </div>
              {errors.email && (
                <p className='text-red-500 text-sm mt-1'>Please enter a valid email</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2' htmlFor='password'>
                Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                <input
                  {...register('password', { required: true, minLength: 6 })}
                  id='password'
                  className={`w-full pl-12 pr-12 py-3 rounded-lg border transition-all duration-200 ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:border-vesoko_yellow focus:ring-2 focus:ring-vesoko_yellow/20'
                  } focus:outline-none`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  disabled={isAnyLoading}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-vesoko_dark_blue transition-colors duration-200'
                  disabled={isAnyLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className='text-red-500 text-sm mt-1'>Password must be at least 6 characters</p>
              )}
            </div>

            {/* Repeat Password Input */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2' htmlFor='repeatPassword'>
                Confirm Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                <input
                  {...register('repeatPassword', { required: true })}
                  id='repeatPassword'
                  className={`w-full pl-12 pr-12 py-3 rounded-lg border transition-all duration-200 ${
                    errors.repeatPassword
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:border-vesoko_yellow focus:ring-2 focus:ring-vesoko_yellow/20'
                  } focus:outline-none`}
                  type={showRepeatPassword ? 'text' : 'password'}
                  placeholder='Confirm your password'
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  disabled={isAnyLoading}
                />
                <button
                  type='button'
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-vesoko_dark_blue transition-colors duration-200'
                  disabled={isAnyLoading}
                >
                  {showRepeatPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.repeatPassword && (
                <p className='text-red-500 text-sm mt-1'>Please confirm your password</p>
              )}
            </div>

            {/* Seller Option */}
            <div className='bg-gray-50 rounded-lg p-4'>
              <label className='flex items-start cursor-pointer'>
                <div className='flex items-center h-5'>
                  <input
                    type='checkbox'
                    checked={isSeller}
                    onChange={handleSellerChange}
                    className='w-4 h-4 text-vesoko_dark_blue bg-gray-100 border-gray-300 rounded focus:ring-vesoko_yellow focus:ring-2'
                    disabled={isAnyLoading}
                  />
                </div>
                <div className='ml-3'>
                  <div className='flex items-center'>
                    <Store className='w-4 h-4 text-vesoko_dark_blue mr-2' />
                    <span className='text-sm font-medium text-gray-900'>Join as a Seller</span>
                  </div>
                  <p className='text-sm text-gray-600 mt-1'>
                    Sell your products on VeSoko marketplace
                  </p>
                </div>
              </label>

              {isSeller && (
                <div className='mt-4 pt-4 border-t border-gray-200'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Store Type
                  </label>
                  <DropdownInputSearchable
                    id='storeType'
                    name='storeType'
                    options={storeTypeOptions}
                    onChange={handleStoreTypeChange}
                    value={storeType}
                    placeholder='Select your store type'
                  />
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className='flex items-start'>
              <div className='flex items-center h-5'>
                <input
                  type='checkbox'
                  id='terms'
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className='w-4 h-4 text-vesoko_dark_blue bg-gray-100 border-gray-300 rounded focus:ring-vesoko_yellow focus:ring-2'
                  disabled={isAnyLoading}
                />
              </div>
              <div className='ml-3'>
                <label htmlFor='terms' className='text-sm text-gray-600'>
                  I agree to the{' '}
                  <a
                    href='/terms'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-vesoko_dark_blue hover:text-vesoko_yellow font-medium transition-colors duration-200'
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href='/privacy'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-vesoko_dark_blue hover:text-vesoko_yellow font-medium transition-colors duration-200'
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className='p-4 rounded-lg bg-red-50 border border-red-200'>
                <p className='text-sm text-red-600 text-center' role='alert'>
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isAnyLoading}
              className={`w-full h-12 bg-vesoko_dark_blue hover:bg-vesoko_dark_blue/90 text-white font-medium rounded-lg transition-all duration-200 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className='flex items-center justify-center'>
                  <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2'></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Divider */}
            {!isSeller && (
              <div className='relative my-6'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-300'></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-4 bg-white text-gray-500'>or continue with</span>
                </div>
              </div>
            )}

            {/* Google Signup Button */}
            {!isSeller && (
              <button
                type='button'
                onClick={handleGoogleSignup}
                disabled={isAnyLoading}
                className={`w-full h-12 flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 ${
                  isGoogleLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isGoogleLoading ? (
                  <div className='animate-spin h-5 w-5 border-2 border-gray-300 border-t-vesoko_dark_blue rounded-full'></div>
                ) : (
                  <FcGoogle className='w-5 h-5' />
                )}
                {isGoogleLoading ? 'Signing up...' : 'Sign up with Google'}
              </button>
            )}

            {isSeller && (
              <div className='p-4 rounded-lg bg-blue-50 border border-blue-200'>
                <div className='flex items-center'>
                  <CheckCircle2 className='w-5 h-5 text-blue-600 mr-2' />
                  <p className='text-sm text-blue-800'>
                    Seller accounts require manual verification. You'll be redirected to complete your store application.
                  </p>
                </div>
              </div>
            )}
          </form>

          {/* Sign In Link */}
          <div className='mt-8 text-center'>
            <p className='text-gray-600'>
              Already have an account?{' '}
              <a
                href='/login'
                className='text-vesoko_dark_blue hover:text-vesoko_yellow font-medium transition-colors duration-200'
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

RegisterPage.noLayout = true; // Remove root layout from this page
export default RegisterPage;
