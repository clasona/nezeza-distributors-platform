import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { forgotPassword } from '@/utils/auth/forgotPassword';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await forgotPassword(email);
      setMessage(response.msg || 'Password reset instructions have been sent to your email.');
    } catch (err: any) {
      const errorMessage = err?.msg || err?.message || 'An error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full bg-gradient-to-br from-vesoko_primary to-vesoko_background min-h-screen flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 border border-gray-100'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-vesoko_primary mb-2'>
              Forgot Password?
            </h1>
            <p className='text-gray-600'>
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Email Input */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2' htmlFor='email'>
                Email Address
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                <input
                  id='email'
                  className='w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-vesoko_primary focus:ring-2 focus:ring-vesoko_primary/20 focus:outline-none transition-all duration-200'
                  type='email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading}
              className={`w-full h-12 bg-vesoko_primary hover:bg-vesoko_primary/90 text-white font-medium rounded-lg transition-all duration-200 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className='flex items-center justify-center'>
                  <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2'></div>
                  Sending...
                </div>
              ) : (
                'Send Reset Instructions'
              )}
            </button>

            {/* Error and Success Messages */}
            {error && (
              <div className='p-4 rounded-lg bg-red-50 border border-red-200'>
                <p className='text-sm text-red-600 text-center' role='alert'>
                  {error}
                </p>
              </div>
            )}

            {message && (
              <div className='p-4 rounded-lg bg-green-50 border border-green-200'>
                <p className='text-sm text-green-600 text-center' role='status'>
                  {message}
                </p>
              </div>
            )}
          </form>

          {/* Back to Login Link */}
          <div className='mt-8 text-center'>
            <Link
              href='/login'
              className='inline-flex items-center text-vesoko_primary hover:text-vesoko_primary font-medium transition-colors duration-200'
            >
              <ArrowLeft size={16} className='mr-2' />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

ForgotPasswordPage.noLayout = true;

export default ForgotPasswordPage;
