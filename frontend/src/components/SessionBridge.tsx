'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addUser, addStore, removeUser, removeStore } from '@/redux/nextSlice';
import { getUserByEmail } from '@/utils/user/getUserByEmail';
import { stateProps } from '../../type';

/**
 * SessionBridge Component
 * 
 * This component runs in the background to ensure that Redux state
 * is always synchronized with the NextAuth session. It:
 * 
 * 1. Automatically loads user and store data when session becomes available
 * 2. Clears Redux state when session ends (logout)
 * 3. Prevents unnecessary API calls with caching
 * 4. Handles session changes seamlessly
 */
const SessionBridge = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const { userInfo, storeInfo } = useSelector((state: stateProps) => state.next);
  
  // Refs to prevent unnecessary re-renders and API calls
  const lastSyncedUserRef = useRef<string | null>(null);
  const isSyncingRef = useRef(false);

  // Sync user and store data from backend
  const syncUserData = async (userEmail: string) => {
    if (isSyncingRef.current) return; // Prevent concurrent syncing
    
    try {
      isSyncingRef.current = true;
      
      const response = await getUserByEmail(userEmail);
      if (!response?.data?.user) {
        console.warn('SessionBridge: No user data returned from API');
        return;
      }

      const userData = response.data.user;

      // Dispatch comprehensive user data to Redux
      dispatch(
        addUser({
          _id: userData._id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          roles: userData.roles || [],
          image: userData.image || null,
          isVerified: userData.isVerified || false,
          verifiedAt: userData.verifiedAt || null,
          storeId: userData.storeId?._id || null,
          citizenshipCountry: userData.citizenshipCountry || null,
          dob: userData.dob || null,
          address: userData.address || null,
          createdAt: userData.createdAt || null,
          updatedAt: userData.updatedAt || null,
          productsOrdered: userData.productsOrdered || [],
        })
      );

      // Dispatch comprehensive store data if user has a store
      if (userData.storeId) {
        const storeData = userData.storeId;
        dispatch(
          addStore({
            _id: storeData._id,
            storeType: storeData.storeType,
            registrationNumber: storeData.registrationNumber || null,
            name: storeData.name,
            storeName: storeData.name, // Also save as storeName for sidebar compatibility
            category: storeData.category || null,
            description: storeData.description || null,
            email: storeData.email,
            phone: storeData.phone || null,
            logo: storeData.logo || null, // Important for navbar/sidebar
            ownerId: storeData.ownerId || userData._id,
            address: storeData.address || null,
            isActive: storeData.isActive !== false, // Default to true if not specified
            createdAt: storeData.createdAt || null,
            updatedAt: storeData.updatedAt || null,
          })
        );
      } else {
        // Clear store data if user doesn't have a store
        dispatch(removeStore());
      }

      lastSyncedUserRef.current = userEmail;
      console.log('SessionBridge: Successfully synced user data for', userEmail);
      
    } catch (error) {
      console.error('SessionBridge: Error syncing user data:', error);
    } finally {
      isSyncingRef.current = false;
    }
  };

  useEffect(() => {
    if (status === 'loading') {
      // Session is still loading, don't do anything yet
      return;
    }

    if (status === 'unauthenticated' || !session?.user) {
      // User is not authenticated, clear Redux state
      if (userInfo || storeInfo) {
        console.log('SessionBridge: Clearing user data (session ended)');
        dispatch(removeUser());
        dispatch(removeStore());
        lastSyncedUserRef.current = null;
      }
      return;
    }

    if (status === 'authenticated' && session?.user?.email) {
      // User is authenticated, check if we need to sync data
      const currentUserEmail = session.user.email;
      
      // Only sync if:
      // 1. We haven't synced this user before, OR
      // 2. Redux state is empty (page refresh, etc.)
      if (
        lastSyncedUserRef.current !== currentUserEmail || 
        !userInfo || 
        !userInfo._id
      ) {
        console.log('SessionBridge: Syncing user data for', currentUserEmail);
        syncUserData(currentUserEmail);
      }
    }
  }, [status, session, userInfo, storeInfo, dispatch]);

  // This component doesn't render anything
  return null;
};

export default SessionBridge;
