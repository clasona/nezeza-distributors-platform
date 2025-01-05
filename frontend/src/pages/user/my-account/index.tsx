import React from 'react';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../../type';
import UserAccount from '@/components/Account/UserAccount';
import RootLayout from '@/components/RootLayout';

const CustomerAccount = () => {
  const { userInfo } = useSelector((state: stateProps) => state.next);

  return (
    <div>
      <RootLayout>
        <UserAccount userInfo={userInfo} />
      </RootLayout>
    </div>
  );
};

CustomerAccount.noLayout = true;
export default CustomerAccount;
