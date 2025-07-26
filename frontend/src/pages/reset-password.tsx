import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { resetPassword } from '@/utils/auth/resetPassword';

const ResetPasswordPage = () => {
  const router = useRouter();
  const { token, email } = router.query;
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if we have the required query parameters
  useEffect(() => {
    if (router.isReady && (!token || !email)) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [router.isReady, token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !email) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await resetPassword(token as string, email as string, password);
      setMessage(response.msg || 'Password reset successful! You can now login with your new password.');
      setIsSuccess(true);
    } catch (err: any) {
      const errorMessage = err?.msg || err?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    router.push('/login');
  };

  if (!router.isReady) {
    return (
      <div className='w-full bg-gradient-to-br from-vesoko_powder_blue to-vesoko_light_blue min-h-screen flex items-center justify-center px-4 py-8'>
        <div className='w-full max-w-md'>
          <div className='bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center'>
            <div className='animate-spin h-8 w-8 border-2 border-vesoko_dark_blue border-t-transparent rounded-full mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !email) {
    return (
      <div className='w-full bg-gradient-to-br from-vesoko_powder_blue to-vesoko_light_blue min-h-screen flex items-center justify-center px-4 py-8'>
        <div className='w-full max-w-md'>
          <div className='bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center'>
            <AlertCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>Invalid Reset Link</h2>
            <p className='text-gray-600 mb-6'>
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <div className='space-y-3'>
              <Link
                href='/forgot-password'
                className='block w-full h-12 bg-vesoko_dark_blue hover:bg-vesoko_dark_blue/90 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center'
              >
                Request New Reset Link
              </Link>
              <Link
                href='/login'
                className='block w-full h-12 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-all duration-200 flex items-center justify-center'
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className='w-full bg-gradient-to-br from-vesoko_powder_blue to-vesoko_light_blue min-h-screen flex items-center justify-center px-4 py-8'>
        <div className='w-full max-w-md'>
          <div className='bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center'>
            <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <CheckCircle2 className='w-12 h-12 text-green-600' />
            </div>
            <h1 className='text-3xl font-bold text-green-600 mb-4'>
              Password Reset Complete!
            </h1>
            <p className='text-gray-600 mb-6'>
              Your password has been successfully reset. You can now login with your new password.
            </p>
            <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
              <div className='flex items-center'>
                <CheckCircle2 className='w-5 h-5 text-green-600 mr-2' />
                <p className='text-sm text-green-800'>
                  {message}
                </p>
              </div>
            </div>
            <button
              onClick={goToLogin}
              className='w-full h-12 bg-vesoko_dark_blue hover:bg-vesoko_dark_blue/90 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2'
            >
              Continue to Login
              <ArrowRight className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full bg-gradient-to-br from-vesoko_powder_blue to-vesoko_light_blue min-h-screen flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 border border-gray-100'>
          <div className='text-center mb-8'>
            <div className='w-20 h-20 bg-vesoko_yellow/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Lock className='w-10 h-10 text-vesoko_dark_blue' />
            </div>
            <h1 className='text-3xl font-bold text-vesoko_dark_blue mb-2'>
              Reset Your Password
            </h1>
            <p className='text-gray-600'>
              Enter your new password below
            </p>
            <p className='text-sm text-vesoko_dark_blue font-semibold break-all mt-2'>
              {email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* New Password Input */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2' htmlFor='password'>
                New Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                <input
                  id='password'
                  className='w-full pl-12 pr-12 py-3 rounded-lg border border-gray-300 focus:border-vesoko_yellow focus:ring-2 focus:ring-vesoko_yellow/20 focus:outline-none transition-all duration-200'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter new password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  minLength={6}
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-vesoko_dark_blue transition-colors duration-200'
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className='text-xs text-gray-500 mt-1'>Password must be at least 6 characters long</p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2' htmlFor='confirmPassword'>
                Confirm New Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                <input
                  id='confirmPassword'
                  className='w-full pl-12 pr-12 py-3 rounded-lg border border-gray-300 focus:border-vesoko_yellow focus:ring-2 focus:ring-vesoko_yellow/20 focus:outline-none transition-all duration-200'
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='Confirm new password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  minLength={6}
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-vesoko_dark_blue transition-colors duration-200'
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className='p-4 rounded-lg bg-red-50 border border-red-200'>
                <div className='flex items-center'>
                  <AlertCircle className='w-5 h-5 text-red-600 mr-2' />
                  <p className='text-sm text-red-600'>{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {message && !isSuccess && (
              <div className='p-4 rounded-lg bg-green-50 border border-green-200'>
                <div className='flex items-center'>
                  <CheckCircle2 className='w-5 h-5 text-green-600 mr-2' />
                  <p className='text-sm text-green-600'>{message}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading}
              className={`w-full h-12 bg-vesoko_dark_blue hover:bg-vesoko_dark_blue/90 text-white font-medium rounded-lg transition-all duration-200 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className='flex items-center justify-center'>
                  <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2'></div>
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className='mt-8 text-center pt-6 border-t border-gray-200'>
            <p className='text-sm text-gray-600 mb-2'>
              Remember your password?
            </p>
            <Link
              href='/login'
              className='text-vesoko_dark_blue hover:text-vesoko_yellow font-medium transition-colors duration-200'
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

ResetPasswordPage.noLayout = true;

export default ResetPasswordPage;
