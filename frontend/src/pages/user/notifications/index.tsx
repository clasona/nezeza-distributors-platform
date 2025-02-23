import React from 'react';
import RootLayout from '@/components/RootLayout';
import { useSelector } from 'react-redux';
import { stateProps, UserProps } from '../../../../type';
import UserNotifications from '@/components/Notifications/UserNotifications';

const WholesalerAccount = () => {
  const { userInfo } = useSelector((state: stateProps) => state.next);

  return (
    <div>
      <RootLayout>
        <UserNotifications userInfo={userInfo} />
      </RootLayout>
    </div>
  );
};

WholesalerAccount.noLayout = true;
export default WholesalerAccount;
