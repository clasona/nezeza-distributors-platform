import React from 'react';
import WholesalerLayout from '../layout';
import SellerCustomerOrders from '@/components/SellerCustomerOrders';
import SellerProducts from '@/components/SellerProducts';

const WholesalerCustomerOrders = () => {
  return (
    <WholesalerLayout>
      <SellerCustomerOrders />
    </WholesalerLayout>
  );
};

WholesalerCustomerOrders.noLayout = true;
export default WholesalerCustomerOrders;
