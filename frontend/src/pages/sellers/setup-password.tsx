import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const PasswordSetupPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const { token, email } = router.query;

  // Validate token on mount
  useEffect(() => {
    if (!router.isReady) return;
    
    if (!token || !email) {
      setIsValidating(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/password-setup/verify-token?token=${encodeURIComponent(token as string)}&email=${encodeURIComponent(email as string)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
          toast.error(data.message || 'Invalid or expired password setup link');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setIsValidToken(false);
        toast.error('Failed to validate password setup link');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, email, router.isReady]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    };
  };

  const passwordValidation = validatePassword(formData.password);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid || !passwordsMatch) {
      toast.error('Please ensure your password meets all requirements and passwords match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/password-setup/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Password setup successful! You can now log in to your seller account.');
        router.push(`/login`);
      } else {
        toast.error(data.message || 'Failed to setup password');
      }
    } catch (error) {
      console.error('Password setup error:', error);
      toast.error('An error occurred while setting up your password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-vesoko_background to-white flex items-center justify-center'>
        <div className='bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4'>
          <div className='text-center'>
            <Loader2 className='w-8 h-8 animate-spin text-vesoko_primary mx-auto mb-4' />
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>Validating Setup Link</h2>
            <p className='text-gray-600'>Please wait while we validate your password setup link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !email || !isValidToken) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-vesoko_background to-white flex items-center justify-center'>
        <div className='bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4'>
          <div className='text-center'>
            <AlertCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Invalid Setup Link</h2>
            <p className='text-gray-600 mb-6'>
              This password setup link is invalid or has expired. Please contact support or request a new setup link.
            </p>
            <Link
              href='/contact'
              className='inline-flex items-center px-4 py-2 bg-vesoko_primary text-white rounded-md hover:bg-vesoko_primary_dark transition-colors'
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-vesoko_background to-white flex items-center justify-center'>
      <div className='bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-vesoko_green_100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Lock className='w-8 h-8 text-vesoko_primary' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Set Up Your Password</h2>
          <p className='text-gray-600'>
            Welcome to VeSoko! Please set up your seller account password to get started.
          </p>
          <p className='text-sm text-vesoko_primary mt-2 font-medium'>
            {email}
          </p>
        </div>

        {/* Password Setup Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Password Field */}
          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
              New Password
            </label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                id='password'
                name='password'
                value={formData.password}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vesoko_primary focus:border-transparent pr-10'
                placeholder='Enter your new password'
                required
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
              >
                {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          {formData.password && (
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-700'>Password Requirements:</p>
              <div className='space-y-1'>
                {[
                  { key: 'minLength', text: 'At least 8 characters' },
                  { key: 'hasUpperCase', text: 'One uppercase letter' },
                  { key: 'hasLowerCase', text: 'One lowercase letter' },
                  { key: 'hasNumbers', text: 'One number' },
                  { key: 'hasSpecialChar', text: 'One special character' },
                ].map(({ key, text }) => (
                  <div key={key} className='flex items-center gap-2'>
                    <CheckCircle
                      className={`w-4 h-4 ${
                        passwordValidation[key as keyof typeof passwordValidation]
                          ? 'text-green-500'
                          : 'text-gray-300'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        passwordValidation[key as keyof typeof passwordValidation]
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm Password Field */}
          <div>
            <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700 mb-2'>
              Confirm Password
            </label>
            <div className='relative'>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id='confirmPassword'
                name='confirmPassword'
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10 ${
                  formData.confirmPassword && passwordsMatch
                    ? 'border-green-300 focus:ring-green-500'
                    : formData.confirmPassword && !passwordsMatch
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-vesoko_primary'
                } focus:border-transparent`}
                placeholder='Confirm your new password'
                required
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
              >
                {showConfirmPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
              </button>
            </div>
            {formData.confirmPassword && !passwordsMatch && (
              <p className='text-red-600 text-sm mt-1'>Passwords do not match</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={isLoading || !isPasswordValid || !passwordsMatch}
            className='w-full bg-vesoko_primary text-white py-2 px-4 rounded-md hover:bg-vesoko_primary_dark focus:outline-none focus:ring-2 focus:ring-vesoko_primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2'
          >
            {isLoading ? (
              <>
                <Loader2 className='w-5 h-5 animate-spin' />
                Setting up password...
              </>
            ) : (
              'Set Up Password'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className='mt-8 text-center text-sm text-gray-600'>
          <p>
            Need help?{' '}
            <Link href='/contact' className='text-vesoko_primary hover:text-vesoko_primary_dark font-medium'>
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordSetupPage;
