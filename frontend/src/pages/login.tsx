import SubmitButton from '@/components/FormInputs/SubmitButton';
import {
  addStore,
  addUser,
  setCartItems,
  setFavoritesItems,
} from '@/redux/nextSlice';
import { loginUser, loginUserGoogle } from '@/utils/auth/loginUser';
import { getCart } from '@/utils/cart/getCart';
import { mergeCartItems } from '@/utils/cart/mergeCartItems';
import { handleError } from '@/utils/errorUtils';
import { signIn, useSession } from 'next-auth/react';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { stateProps, StoreProps } from '../../type';
import { useRouter } from 'next/navigation';
import { getFavorites } from '@/utils/favorites/getFavorites';
import { mergeFavoritesItems } from '@/utils/favorites/mergeFavoritesItems';
import { hasActiveStripeConnectAccount as checkActiveStripeAccountApi } from '@/utils/stripe/hasStripeConnectAccount';
import { getUserByEmail } from '@/utils/user/getUserByEmail';

// Types for better type safety
interface LoginFormData {
  email: string;
  password: string;
}

interface LoadingStates {
  isLoading: boolean;
  isGoogleLoading: boolean;
}

// Constants for better maintainability
const STORE_TYPE_ROUTES = {
  manufacturing: '/manufacturer',
  wholesale: '/wholesaler',
  retail: '/retailer',
  admin: '/admin',
} as const;

const MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  LOGIN_SUCCESS: 'Login successful. Redirecting...',
  GOOGLE_LOGIN_ERROR: 'Error during Google login.',
  STRIPE_CHECK_ERROR:
    'Failed to check Stripe account status. Please try again.',
  USER_DETAILS_ERROR: 'Failed to retrieve user details after login.',
  GOOGLE_AUTH_ERROR: 'Failed to authenticate with backend after Google login.',
  UNEXPECTED_ERROR: 'An unexpected error occurred during login.',
  ACCOUNT_NOT_VERIFIED: 'Account not verified. Please verify your email!',
} as const;

const LoginPage = () => {
  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    isLoading: false,
    isGoogleLoading: false,
  });

  // Flow control
  const [isGoogleFlow, setIsGoogleFlow] = useState(false);

  // Redux and routing
  const { cartItemsData, favoritesItemsData } = useSelector(
    (state: stateProps) => state.next
  );
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session, status: sessionStatus } = useSession();

  // Refs for optimization
  const hasCheckedStripeRef = useRef<{ [userId: string]: boolean }>({});
  const lastGoogleSyncRef = useRef<string | null>(null);

  const isComponentMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false;
    };
  }, []);

  // Helper functions
  const updateLoadingState = useCallback((updates: Partial<LoadingStates>) => {
    setLoadingStates((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearMessages = useCallback(() => {
    setErrorMessage('');
    setSuccessMessage('');
  }, []);

  const handleInputChange = useCallback(
    (field: keyof LoginFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handlePasswordVisibilityToggle = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Get route based on store type
  const getStoreRoute = useCallback((storeType: string): string => {
    return (
      STORE_TYPE_ROUTES[storeType as keyof typeof STORE_TYPE_ROUTES] || '/'
    );
  }, []);

  // Shared logic to retrieve user and sync Redux after login
  const syncUserAndData = useCallback(
    async (userEmail: string) => {
      try {
        const response = await getUserByEmail(userEmail);
        if (!response?.data?.user) {
          throw new Error('User data not found');
        }

        const userData = response.data.user;

        // Dispatch user data to Redux
        dispatch(
          addUser({
            _id: userData._id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            image: userData.image || null,
            address: userData.address || null,
            storeId: userData.storeId || null,
          })
        );

        // Dispatch store data if user has a store
        if (userData.storeId) {
          dispatch(
            addStore({
              _id: userData.storeId._id,
              name: userData.storeId.name,
              email: userData.storeId.email,
              storeType: userData.storeId.storeType,
            })
          );
        }

        // Sync cart and favorites concurrently
        const [serverCartItems, serverFavoritesItems] = await Promise.all([
          getCart(),
          getFavorites(),
        ]);

        const mergedCartItems = mergeCartItems(cartItemsData, serverCartItems);
        const mergedFavoritesItems = mergeFavoritesItems(
          favoritesItemsData,
          serverFavoritesItems
        );

        dispatch(setCartItems(mergedCartItems));
        dispatch(setFavoritesItems(mergedFavoritesItems));
      } catch (err: any) {
        handleError(err);
        setErrorMessage(MESSAGES.USER_DETAILS_ERROR);
        throw err; // Re-throw to be handled by caller
      }
    },
    [cartItemsData, favoritesItemsData, dispatch]
  );

  // Handle post-login redirect logic
  const handlePostLoginRedirect = useCallback(
    async (user: any) => {
      if (!user) return;

      console.log('Handling post-login redirect for user:', user);

      if (user.storeId) {
        // User is a seller - check Stripe account status
        updateLoadingState({ isLoading: true });

        try {
          // Only check Stripe status if not already checked for this user
          if (!hasCheckedStripeRef.current[user._id]) {
            const response = await checkActiveStripeAccountApi(user._id);
            hasCheckedStripeRef.current[user._id] = true;

            if (response?.hasStripeAccount && response.isActive) {
              // Active Stripe account - redirect to appropriate dashboard
              const callbackUrl = getStoreRoute(user.storeId.storeType);
              router.replace(callbackUrl);
            } else {
              // No active Stripe account - redirect to setup
              router.replace('/sellers/stripe/setup');
            }
          }
        } catch (error) {
          console.error('Error checking Stripe account during login:', error);
          setErrorMessage(MESSAGES.STRIPE_CHECK_ERROR);
          router.replace('/');
        } finally {
          if (isComponentMountedRef.current) {
            updateLoadingState({ isLoading: false, isGoogleLoading: false });
          }
        }
      } else {
        // User is a customer - redirect to homepage
        router.replace('/');
      }
    },
    [router, updateLoadingState, getStoreRoute]
  );

  // Handle Google login
  const handleGoogleLogin = useCallback(async () => {
    setIsGoogleFlow(true);
    updateLoadingState({ isGoogleLoading: true });
    clearMessages();

    try {
      await signIn('google', { redirect: false });
      // useEffect will handle the rest after session is updated
    } catch (error) {
      console.error('Error during Google login:', error);
      setErrorMessage(MESSAGES.GOOGLE_LOGIN_ERROR);
      setIsGoogleFlow(false);
      updateLoadingState({ isGoogleLoading: false });
    }
  }, [updateLoadingState, clearMessages]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      updateLoadingState({ isLoading: true });
      clearMessages();

      try {
        const res = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (res?.error) {
          setErrorMessage(MESSAGES.INVALID_CREDENTIALS);
          updateLoadingState({ isLoading: false });
          return;
        }

        // Fetch updated session with latest user data
        const updatedSession = await fetch('/api/auth/session').then((res) =>
          res.json()
        );

        if (updatedSession?.user) {
          // Perform backend login first
          await loginUser(formData.email, formData.password);
          
          // Small delay to ensure cookies are properly set
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Then sync user data
          await syncUserAndData(formData.email);

          setSuccessMessage(MESSAGES.LOGIN_SUCCESS);
          await handlePostLoginRedirect(updatedSession.user);
        }
      } catch (error: any) {
        handleError(error);
        
        // Extract the error message properly
        let errorMessage: string = MESSAGES.UNEXPECTED_ERROR;
        
        if (error?.response?.data?.msg) {
          // Backend API error message
          errorMessage = error.response.data.msg;
        } else if (error?.message) {
          // Generic error message
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          // Direct string error
          errorMessage = error;
        }
        
        setErrorMessage(errorMessage);
        
        // Ensure loading state is cleared immediately on error
        setLoadingStates({ isLoading: false, isGoogleLoading: false });
      } finally {
        // Always clear loading state in finally block
        setLoadingStates({ isLoading: false, isGoogleLoading: false });
      }
    },
    [
      formData,
      updateLoadingState,
      clearMessages,
      syncUserAndData,
      handlePostLoginRedirect,
    ]
  );

  // Effect: Handle Google login after session is ready
  useEffect(() => {
    if (
      sessionStatus === 'authenticated' &&
      session?.user &&
      session.user.provider === 'google'
    ) {
      // Compose a unique key for this login
      const currentGoogleLoginKey = session.user._id || session.user.email;
      if (lastGoogleSyncRef.current === currentGoogleLoginKey) {
        // Already handled this user/session
        return;
      }
      if (currentGoogleLoginKey) { lastGoogleSyncRef.current = currentGoogleLoginKey; }

      (async () => {
        try {
          await Promise.all([
            loginUserGoogle(session.user.email as string),
            syncUserAndData(session.user.email as string),
          ]);
          setSuccessMessage(MESSAGES.LOGIN_SUCCESS);
          await handlePostLoginRedirect(session.user);
        } catch (err) {
          setErrorMessage(MESSAGES.GOOGLE_AUTH_ERROR);
        } finally {
          if (isComponentMountedRef.current) {
            setIsGoogleFlow(false);
            updateLoadingState({ isGoogleLoading: false });
          }
        }
      })();
    }
  }, [
    isGoogleFlow,
    sessionStatus,
    session,
    syncUserAndData,
    handlePostLoginRedirect,
    updateLoadingState,
  ]);
  // Determine if any loading state is active
  const isAnyLoading = loadingStates.isLoading || loadingStates.isGoogleLoading;

  return (
    <div className='w-full bg-gradient-to-br from-vesoko_powder_blue to-vesoko_light_blue min-h-screen flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 border border-gray-100'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-vesoko_dark_blue mb-2'>
              Welcome Back
            </h1>
            <p className='text-gray-600'>Sign in to your VeSoko account</p>
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
                  className='w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-vesoko_yellow focus:ring-2 focus:ring-vesoko_yellow/20 focus:outline-none transition-all duration-200'
                  type='email'
                  placeholder='Enter your email'
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isAnyLoading}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2' htmlFor='password'>
                Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                <input
                  id='password'
                  className='w-full pl-12 pr-12 py-3 rounded-lg border border-gray-300 focus:border-vesoko_yellow focus:ring-2 focus:ring-vesoko_yellow/20 focus:outline-none transition-all duration-200'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isAnyLoading}
                  required
                />
                <button
                  type='button'
                  onClick={handlePasswordVisibilityToggle}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-vesoko_dark_blue transition-colors duration-200'
                  disabled={isAnyLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className='text-right'>
              <a
                href='/forgot-password'
                className='text-sm text-vesoko_dark_blue hover:text-vesoko_yellow transition-colors duration-200'
              >
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <SubmitButton
              isLoading={loadingStates.isLoading}
              buttonTitle='Sign In'
              className='w-full h-12 bg-vesoko_dark_blue hover:bg-vesoko_dark_blue/90 text-white font-medium rounded-lg transition-all duration-200'
              disabled={isAnyLoading}
            />

            {/* Divider */}
            <div className='relative my-6'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-4 bg-white text-gray-500'>or continue with</span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type='button'
              onClick={handleGoogleLogin}
              className={`w-full h-12 flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 ${
                loadingStates.isGoogleLoading
                  ? 'opacity-70 cursor-not-allowed'
                  : ''
              }`}
              disabled={isAnyLoading}
            >
              {loadingStates.isGoogleLoading ? (
                <div className='animate-spin h-5 w-5 border-2 border-gray-300 border-t-vesoko_dark_blue rounded-full'></div>
              ) : (
                <FcGoogle className='w-5 h-5' />
              )}
              {loadingStates.isGoogleLoading
                ? 'Signing in...'
                : 'Sign in with Google'}
            </button>

            {/* Error and Success Messages */}
            {errorMessage && (
              <div className='p-4 rounded-lg bg-red-50 border border-red-200'>
                <p className='text-sm text-red-600 text-center' role='alert'>
                  {errorMessage}
                </p>
              </div>
            )}

            {successMessage && (
              <div className='p-4 rounded-lg bg-green-50 border border-green-200'>
                <p className='text-sm text-green-600 text-center' role='status'>
                  {successMessage}
                </p>
              </div>
            )}
          </form>

          {/* Sign Up Link */}
          <div className='mt-8 text-center'>
            <p className='text-gray-600'>
              New to VeSoko?{' '}
              <a
                className='text-vesoko_dark_blue hover:text-vesoko_yellow font-medium transition-colors duration-200'
                href='/register'
              >
                Create an account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

LoginPage.noLayout = true;

export default LoginPage;
