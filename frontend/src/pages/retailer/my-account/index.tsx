import React from 'react';
import RetailerLayout from '../layout';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../../type';
import UserAccount from '@/components/Account/UserAccount';
import FullScreenLoader from '@/components/Loaders/FullScreenLoader';

const RetailerAccount = () => {
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

  return (
    <div>
      <RetailerLayout>
        <UserAccount userInfo={userInfo} />
      </RetailerLayout>
    </div>
  );
};

RetailerAccount.noLayout = true;
export default RetailerAccount;
