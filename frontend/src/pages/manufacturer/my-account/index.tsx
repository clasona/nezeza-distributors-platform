import React from 'react';
import ManufacturerLayout from '../layout';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../../type';
import UserAccount from '@/components/Account/UserAccount';

const ManufacturerAccount = () => {
  const { userInfo } = useSelector((state: stateProps) => state.next);

  return (
    <div>
      <ManufacturerLayout>
        <UserAccount userInfo={userInfo} />
      </ManufacturerLayout>
    </div>
  );
};

ManufacturerAccount.noLayout = true;
export default ManufacturerAccount;
