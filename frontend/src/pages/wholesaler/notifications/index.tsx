import React from 'react';
import WholesalerLayout from '../layout';
import { useSelector } from 'react-redux';
import { stateProps, UserProps } from '../../../../type';
import UserNotifications from '@/components/Notifications/UserNotifications';

const WholesalerAccount = () => {
  const { userInfo } = useSelector((state: stateProps) => state.next);

  return (
    <div>
      <WholesalerLayout>
        <UserNotifications userInfo={userInfo} />
      </WholesalerLayout>
    </div>
  );
};

WholesalerAccount.noLayout = true;
export default WholesalerAccount;
