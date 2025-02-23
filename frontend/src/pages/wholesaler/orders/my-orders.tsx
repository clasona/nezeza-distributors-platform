import React from 'react';
import WholesalerLayout from '../layout';
import SellerMyOrders from '@/components/SellerMyOrders';
import SellerProducts from '@/components/SellerProducts';

const WholesalerMyOrders = () => {
  return (
    <WholesalerLayout>
      <SellerMyOrders />
    </WholesalerLayout>
  );
};

WholesalerMyOrders.noLayout = true;
export default WholesalerMyOrders;
