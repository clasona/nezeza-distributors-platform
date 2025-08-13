import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addUser, addStore } from '@/redux/nextSlice';
import { stateProps } from '../../../type';

const SessionBridge = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const [hasInitialized, setHasInitialized] = useState(false);
  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );

  // Debug logging
  useEffect(() => {
    console.log('SessionBridge - Status:', status);
    console.log('SessionBridge - Session:', session);
    console.log('SessionBridge - Redux userInfo:', userInfo);
    console.log('SessionBridge - Redux storeInfo:', storeInfo);
  }, [session, status, userInfo, storeInfo]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const sessionUser = session.user;
      
      console.log('SessionBridge - Authenticated user found:', sessionUser);
      
      // Always update Redux with session data to ensure sync
      if (!userInfo || (userInfo && userInfo._id !== sessionUser._id)) {
        console.log('SessionBridge - Updating Redux with session user data');
        dispatch(addUser(sessionUser));
      }
      
      // Update store info if available
      if (sessionUser.storeId && (!storeInfo || storeInfo._id !== sessionUser.storeId._id)) {
        console.log('SessionBridge - Updating Redux with session store data');
        dispatch(addStore(sessionUser.storeId));
      }
      
      setHasInitialized(true);
    }
  }, [session, status, dispatch, userInfo, storeInfo]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log('SessionBridge - User unauthenticated, clearing Redux state');
      // Clear Redux state when user is not authenticated
      if (userInfo) {
        dispatch(addUser(null));
      }
      if (storeInfo) {
        dispatch(addStore(null));
      }
      setHasInitialized(false);
    }
  }, [status, dispatch, userInfo, storeInfo]);

  return null; // This component doesn't render anything
};

export default SessionBridge;
