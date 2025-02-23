import React from 'react';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../../type';
import PaymentsInfo from '@/components/Payments/PaymentsInfo';
import RootLayout from '@/components/RootLayout';

const CustomerPayments = () => {
  const { userInfo } = useSelector((state: stateProps) => state.next);

  return (
    <div>
      <RootLayout>
        <PaymentsInfo userInfo={userInfo} />
      </RootLayout>
    </div>
  );
};

CustomerPayments.noLayout = true;
export default CustomerPayments;
