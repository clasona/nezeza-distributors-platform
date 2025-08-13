import React from 'react';
import RetailerLayout from '../layout';
import StoreAccount from '@/components/Account/StoreAccount';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../../type';
import FullScreenLoader from '@/components/Loaders/FullScreenLoader';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';

const RetailerStoreAccount = () => {
  const { userInfo, storeInfo } = useSelector((state: stateProps) => state.next);

  // Show loading if user data is not yet available
  if (!userInfo) {
    return (
      <div>
        <RetailerLayout>
          <FullScreenLoader />
        </RetailerLayout>
      </div>
    );
  }

  // Show message if no store info available
  if (!storeInfo) {
    return (
      <div>
        <RetailerLayout>
          <PageHeader heading="Store Account" />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Store Information Available</h3>
              <p className="text-gray-600 mb-4">
                You need to complete your store application before you can manage store settings.
              </p>
              <Link
                href="/store-application"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-vesoko_green_600 hover:bg-vesoko_green_700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vesoko_green_500"
              >
                Complete Store Application
              </Link>
            </div>
          </div>
        </RetailerLayout>
      </div>
    );
  }

  return (
    <div>
      <RetailerLayout>
        <StoreAccount />
      </RetailerLayout>
    </div>
  );
};

RetailerStoreAccount.noLayout = true;
export default RetailerStoreAccount;
