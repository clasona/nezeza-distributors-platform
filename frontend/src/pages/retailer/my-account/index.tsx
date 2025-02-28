import React from 'react';
import RetailerLayout from '../layout';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../../type';
import UserAccount from '@/components/Account/UserAccount';

const RetailerAccount = () => {
  const { userInfo } = useSelector((state: stateProps) => state.next);

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
