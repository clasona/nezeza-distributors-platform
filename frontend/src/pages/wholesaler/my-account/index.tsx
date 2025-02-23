import React from 'react';
import WholesalerLayout from '../layout';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../../type';
import UserAccount from '@/components/Account/UserAccount';

const WholesalerAccount = () => {
  const { userInfo } = useSelector((state: stateProps) => state.next);

  return (
    <div>
      <WholesalerLayout>
        <UserAccount userInfo={userInfo} />
      </WholesalerLayout>
    </div>
  );
};

WholesalerAccount.noLayout = true;
export default WholesalerAccount;
