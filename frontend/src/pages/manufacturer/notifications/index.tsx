import React from 'react';
import ManufacturerLayout from '../layout';
import { useSelector } from 'react-redux';
import { stateProps, UserProps } from '../../../../type';
import UserNotifications from '@/components/Notifications/UserNotifications';

const ManufacturerAccount = () => {
  const { userInfo } = useSelector((state: stateProps) => state.next);

  return (
    <div>
      <ManufacturerLayout>
        <UserNotifications userInfo={userInfo} />
      </ManufacturerLayout>
    </div>
  );
};

ManufacturerAccount.noLayout = true;
export default ManufacturerAccount;
