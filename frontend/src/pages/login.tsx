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
import { FaGoogle } from 'react-icons/fa';
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
          return;
        }

        // Fetch updated session with latest user data
        const updatedSession = await fetch('/api/auth/session').then((res) =>
          res.json()
        );

        if (updatedSession?.user) {
          // Perform backend login and sync data concurrently
          await Promise.all([
            loginUser(formData.email, formData.password),
            syncUserAndData(formData.email),
          ]);

          setSuccessMessage(MESSAGES.LOGIN_SUCCESS);
          await handlePostLoginRedirect(updatedSession.user);
        }
      } catch (error: any) {
        handleError(error);
        setErrorMessage(error.message || MESSAGES.UNEXPECTED_ERROR);
      } finally {
        if (isComponentMountedRef.current) {
          updateLoadingState({ isLoading: false });
        }
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
    <div className='w-full bg-vesoko_powder_blue min-h-screen flex items-center justify-center'>
      <div className='bg-vesoko_light_blue rounded-lg p-4'>
        <form
          onSubmit={handleSubmit}
          className='w-full bg-white p-6 rounded-lg shadow-lg'
        >
          <h2 className='text-2xl font-bold text-center text-vesoko_dark_blue mb-4'>
            Login to VeSoko
          </h2>

          <div className='mb-2'>
            <label className='block text-gray-700' htmlFor='email'>
              Email:
            </label>
            <input
              id='email'
              className='w-full p-2 py-1 rounded-md border border-gray-300 border-vesoko_light focus:border-vesoko_yellow focus:outline-none'
              type='email'
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isAnyLoading}
              required
            />
          </div>

          <div className='mb-2'>
            <label className='block text-gray-700' htmlFor='password'>
              Password:
            </label>
            <input
              id='password'
              className='w-full p-2 py-1 rounded-md border border-gray-300 border-vesoko_light focus:border-vesoko_yellow focus:outline-none'
              type='password'
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={isAnyLoading}
              required
            />
          </div>

          <SubmitButton
            isLoading={loadingStates.isLoading}
            buttonTitle='Login'
            className='w-full h-10'
            disabled={isAnyLoading}
          />

          <button
            type='button'
            onClick={handleGoogleLogin}
            className={`w-full h-10 flex items-center justify-center gap-2 rounded-md font-medium bg-vesoko_red_600 text-white hover:bg-red-600 transition-colors duration-300 mt-2 ${
              loadingStates.isGoogleLoading
                ? 'opacity-70 cursor-not-allowed'
                : ''
            }`}
            disabled={isAnyLoading}
          >
            {loadingStates.isGoogleLoading ? (
              <span className='animate-spin mr-2 h-5 w-5 border-t-2 border-white rounded-full'></span>
            ) : (
              <FaGoogle className='w-5 h-5' />
            )}
            {loadingStates.isGoogleLoading
              ? 'Signing in with Google...'
              : 'Login with Google'}
          </button>

          {errorMessage && (
            <p className='mt-4 text-center text-vesoko_red_600' role='alert'>
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className='mt-4 text-center text-green-600' role='status'>
              {successMessage}
            </p>
          )}

          <p className='text-center mt-6 text-gray-600'>
            New to VeSoko?{' '}
            <a
              className='text-vesoko_dark_blue hover:text-vesoko_dark_blue underline transition-colors cursor-pointer duration-250'
              href='/register'
            >
              Signup
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

LoginPage.noLayout = true;

export default LoginPage;
